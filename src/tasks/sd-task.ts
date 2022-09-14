import { writeFile } from "fs/promises";
import { Task } from "./task";
import { StableDiffusionOptions } from "../stable-diffusion-options";
import { StableDiffusion } from "../stable-diffusion";

interface SdTaskMemento extends Record<string, unknown> {
  category: string;
  prompt: string;
  style: string;
}

/**
 * A task that delegates an image generation job to the SD back-end.
 */
export class SdTask implements Task {
  /**
   * A list of files created during {@link run}.
   */
  readonly files: string[] = [];

  memento?: SdTaskMemento;

  /**
   * Creates a new instance.
   *
   * @param stableDiffusion the Stable Diffusion back-end connection.
   * @param prompt the prompt for which to generate an image.
   * @param options a set of image generation options.
   * @param saveAs a helper function that generates a file path under which to
   *               store the resulting image(s).
   */
  constructor(
    private readonly stableDiffusion: StableDiffusion,
    readonly prompt: string,
    readonly options: Partial<StableDiffusionOptions>,
    private readonly saveAs: (index: number) => string
  ) {}

  async run(): Promise<void> {
    const outputs = await this.stableDiffusion.generate(
      this.prompt,
      this.options
    );
    await Promise.all(
      outputs.map((data, index) => {
        const path = this.saveAs(index);
        return writeFile(path, data).then(() => {
          this.files.push(path);
        });
      })
    );
  }
}
