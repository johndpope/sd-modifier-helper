import { StableDiffusion } from "./stable-diffusion";
import { mkdir } from "fs/promises";
import { join } from "path";
import { GeneratedImage } from "./models";
import { TaskQueue } from "./task-queue";
import { IndexTask, ResizeTask, SdTask } from "./tasks";
import { Presets, SingleBar } from "cli-progress";
import { AxiosError } from "axios";
import { Configuration } from "./configuration";

(async () => {
  const instance = new StableDiffusion();
  const configuration = new Configuration();

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
      join(__dirname, "..", "templates", "index.html"),
      join(__dirname, "..", "outputs", "index.html"),
      generated
    )
  );

  const progress = new SingleBar({}, Presets.shades_classic);
  progress.start(taskQueue.length, 0);
  for await (const processed of taskQueue.process()) {
    progress.increment();
    if (
      processed instanceof SdTask &&
      typeof processed.memento !== "undefined"
    ) {
      const { category, prompt } = processed.memento as Record<string, string>;
      generated.push(
        ...processed.files.map((path, index) => ({
          category,
          path,
          label: `${prompt}, #${index}`,
        }))
      );
    }
  }

  progress.stop();
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

  for (const [category, styles] of Object.entries(modifiers)) {
    for (const style of styles) {
      const folder = join(__dirname, "..", "outputs", category, style);
      await mkdir(folder, { recursive: true });

      for (const input of inputs) {
        const name = cfg.nameToPrompt(input.name);
        const prompt = `${name}, ${style}`;
        const task = new SdTask(
          instance,
          prompt,
          {
            initialImagePath: join(__dirname, "..", "inputs", input.name),
            ...options,
          },
          (index) => join(folder, `${name}-${index}-full.png`)
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
