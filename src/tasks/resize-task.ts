import { Task } from "./task";
import { SdTask } from "./sd-task";
import sharp from "sharp";

/**
 * A task that resizes the specified input image to the designated size,
 * and stores it as a PNG at the destination path.
 */
export class ResizeTask implements Task {
  /**
   * Iff set and true, this task was skipped during {@link run}.
   */
  skipped?: true;

  constructor(
    readonly sourcePath: string,
    readonly destPath: string,
    readonly width: number,
    readonly height: number,
    readonly related?: SdTask
  ) {}

  async run(): Promise<void> {
    if (this.related?.skipped !== true) {
      await sharp(this.sourcePath)
        .resize({ width: this.width, height: this.height })
        .png()
        .toFile(this.destPath);
    } else {
      this.skipped = true;
    }
  }
}
