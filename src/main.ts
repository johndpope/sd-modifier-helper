import { StableDiffusion } from "./stable-diffusion";
import { mkdir, readdir, readFile } from "fs/promises";
import { Dirent } from "fs";
import { join } from "path";
import { StableDiffusionOptions } from "./stable-diffusion-options";
import { validate } from "./validation";
import { GeneratedImage } from "./models";
import { TaskQueue } from "./task-queue";
import { IndexTask, ResizeTask, SdTask } from "./tasks";
import { SingleBar, Presets } from "cli-progress";
import { AxiosError } from "axios";

const inputPath = join(__dirname, "..", "inputs");
const inputExpr = /^([A-Za-z ]+)\.png$/i;
const optionsPath = join(__dirname, "..", "options.json");
const modifiersPath = join(__dirname, "..", "modifiers.json");

(async () => {
  const instance = new StableDiffusion();

  try {
    await checkBackend(instance);
  } catch (e) {
    if (e instanceof AxiosError && e.code === "ECONNREFUSED") {
      console.error(`No running back-end instance on ${instance.backend}`);
      process.exit(-1);
    }
  }

  const taskQueue = await buildTaskQueue(instance);
  const generated: GeneratedImage[] = [];
  const templateFile = join(__dirname, "..", "templates", "index.html");
  const indexFile = join(__dirname, "..", "outputs", "index.html");
  taskQueue.enqueue(new IndexTask(templateFile, indexFile, generated));

  const progress = new SingleBar({}, Presets.shades_classic);
  progress.start(taskQueue.length, 0);
  for await (const processed of taskQueue.process()) {
    progress.increment();
    if (
      processed instanceof SdTask &&
      typeof processed.memento !== "undefined"
    ) {
      const { input, style, category, prompt } = processed.memento as Record<
        string,
        string
      >;
      generated.push(
        ...processed.files.map((path, index) => ({
          input,
          category,
          style,
          prompt,
          index,
          path,
        }))
      );
    }
  }

  progress.stop();
})();

async function buildTaskQueue(instance: StableDiffusion): Promise<TaskQueue> {
  const options = await readOptions();
  const modifiers = await readModifiers();
  const inputs = await readInputs();
  const taskQueue = new TaskQueue();

  for (const [category, styles] of Object.entries(modifiers)) {
    for (const style of styles) {
      const folder = join(__dirname, "..", "outputs", category, style);
      await mkdir(folder, { recursive: true });

      for (const input of inputs) {
        const name = nameToPrompt(input.name);
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

/**
 * Reads a list of modifiers from `./modifiers.json`.
 */
async function readModifiers(): Promise<Record<string, string[]>> {
  const contents = await readFile(modifiersPath, { encoding: "utf8" });
  // TODO: validate via Joi
  return JSON.parse(contents) as Record<string, string[]>;
}

/**
 * Reads all input files contained in `./inputs`.
 */
async function readInputs(): Promise<Dirent[]> {
  const entries = await readdir(inputPath, {
    encoding: "utf8",
    withFileTypes: true,
  });
  return entries.filter(
    (entry) => entry.isFile() && inputExpr.test(entry.name)
  );
}

/**
 * Reads and validates options from `options.json`.
 * If valid, it will be returned as a {@link StableDiffusionOptions} instance.
 */
async function readOptions(): Promise<StableDiffusionOptions> {
  const contents = await readFile(optionsPath, { encoding: "utf8" });
  const values: unknown = JSON.parse(contents);
  return validate(values);
}

function nameToPrompt(name: string): string {
  const match = inputExpr.exec(name);
  if (!match) {
    throw new Error(`Failed to figure out the prompt for "${name}"`);
  }
  return match[1];
}
