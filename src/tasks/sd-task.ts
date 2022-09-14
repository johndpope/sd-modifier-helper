import { writeFile } from "fs/promises";
import { Task } from "./task";
import { StableDiffusionOptions } from "../stable-diffusion-options";
import { StableDiffusion } from "../stable-diffusion";

interface SdTaskMemento extends Record<string, unknown> {
  category: string;
  prompt: string;
  style: string;
}

export class SdTask implements Task {
  readonly files: string[] = [];

  memento?: SdTaskMemento;

  constructor(
    private readonly stableDiffusion: StableDiffusion,
    readonly prompt: string,
    readonly options: StableDiffusionOptions,
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
