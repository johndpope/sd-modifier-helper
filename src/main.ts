import { StableDiffusion } from "./stable-diffusion";
import { join } from "path";
import { GeneratedImage } from "./models";
import { TaskQueue } from "./task-queue";
import {
  CleanupTask,
  CreateDirectoryTask,
  IndexTask,
  ResizeTask,
  SdTask,
} from "./tasks";
import { Presets, SingleBar } from "cli-progress";
import { AxiosError } from "axios";
import { Configuration } from "./configuration";

(async () => {
  const instance = new StableDiffusion();
  const configuration = await Configuration.fromArgs();

  try {
    await checkBackend(instance);
  } catch (e) {
    if (e instanceof AxiosError && e.code === "ECONNREFUSED") {
      console.error(`No running back-end instance on ${instance.backend}`);
      process.exit(-1);
    }
  }

  const taskQueue = await buildTaskQueue(instance, configuration);
  const generated: GeneratedImage[] = [];
  taskQueue.enqueue(
    new IndexTask(
      join(configuration.templatePath, "index.html"),
      join(configuration.outputPath, "index.html"),
      generated
    )
  );

  const progress = new SingleBar({}, Presets.shades_classic);
  progress.start(taskQueue.length, 0);
  taskQueue.on(TaskQueue.TASK_ERROR, (task, err) => {
    console.error(`Task failed: ${err}`);
  });
  taskQueue.on(TaskQueue.AFTER_EACH, () => progress.increment());
  taskQueue.once(TaskQueue.AFTER_ALL, () => progress.stop());

  for await (const processed of taskQueue.process()) {
    if (
      processed instanceof SdTask &&
      typeof processed.memento !== "undefined"
    ) {
      const { category, prompt } = processed.memento;
      generated.push(
        ...processed.files.map((path, index) => ({
          category,
          path,
          label: `${prompt}, #${index}`,
        }))
      );
    }
  }
})();

async function buildTaskQueue(
  instance: StableDiffusion,
  cfg: Configuration
): Promise<TaskQueue> {
  const [options, modifiers, inputs] = await Promise.all([
    cfg.readOptions(),
    cfg.readModifiers(),
    cfg.readInputs(),
  ]);
  const taskQueue = new TaskQueue();
  if (cfg.cleanFirst) {
    taskQueue.enqueue(new CleanupTask(cfg.outputPath));
  }

  for (const [category, styles] of Object.entries(modifiers)) {
    for (const style of styles) {
      const folder = join(cfg.outputPath, category, style);
      taskQueue.enqueue(new CreateDirectoryTask(folder));

      for (const input of inputs) {
        const name = cfg.nameToPrompt(input.name);
        const prompt = `${name}, ${style}`;
        const task = new SdTask(
          instance,
          prompt,
          {
            initialImagePath: join(cfg.inputPath, input.name),
            ...options,
          },
          (index) => join(folder, `${name}-${index}-full.png`),
          cfg.skipExisting
        );
        task.memento = {
          input: name,
          style,
          category,
          prompt,
        };
        taskQueue.enqueue(task);
        for (let i = 0; i < options.outputs; i++) {
          taskQueue.enqueue(
            new ResizeTask(
              join(folder, `${name}-${i}-full.png`),
              join(folder, `${name}-${i}-thumb.png`),
              128,
              128
            )
          );
        }
      }
    }
  }

  return taskQueue;
}

/**
 * Pings the back-end. If unavailable, an error will be thrown by Axios.
 * @param instance the Stable Diffusion instance to check.
 */
async function checkBackend(instance: StableDiffusion): Promise<void> {
  console.log("Checking back-end connectivity");
  await instance.ping();
  console.log("Backend ready!");
}
