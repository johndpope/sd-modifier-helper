import { Task } from "./task";
import sharp from "sharp";

export class ResizeTask implements Task {
  constructor(
    private readonly sourcePath: string,
    private readonly destPath: string,
    private readonly width: number,
    private readonly height: number
  ) {}

  async run(): Promise<void> {
    await sharp(this.sourcePath)
      .resize({ width: this.width, height: this.height })
      .png()
      .toFile(this.destPath);
  }
}
