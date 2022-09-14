import { stat, writeFile } from "fs/promises";
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
   * Iff set and true, this task was skipped during {@link run}.
   */
  skipped?: true;

  /**
   * Creates a new instance.
   *
   * @param stableDiffusion the Stable Diffusion back-end connection.
   * @param prompt the prompt for which to generate an image.
   * @param options a set of image generation options.
   * @param saveAs a helper function that generates a file path under which to
   *               store the resulting image(s).
   * @param skipIfExists if the file already exists, this task will not perform again
   */
  constructor(
    private readonly stableDiffusion: StableDiffusion,
    readonly prompt: string,
    readonly options: Partial<StableDiffusionOptions>,
    private readonly saveAs: (index: number) => string,
    private readonly skipIfExists = false
  ) {}

  async run(): Promise<void> {
    if (await this.shouldGenerate()) {
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
    } else {
      // we're "lying" insofar as that we haven't actually determined which files exist
      // we're just assuming
      this.skipped = true;
      const shouldHave = this.options.outputs ?? 1;
      for (let i = 0; i < shouldHave; i++) {
        this.files.push(this.saveAs(i));
      }
    }
  }

  private async shouldGenerate(): Promise<boolean> {
    if (this.skipIfExists) {
      try {
        const pathStats = await stat(this.saveAs(0)); // this will reject iff file does not exist
        return !pathStats.isFile() || pathStats.size === 0;
      } catch (e) {
        // rejection is expected iff file does not exist, we'll just fall through to
        // the default case, which returns true.
      }
    }
    return true;
  }
}
