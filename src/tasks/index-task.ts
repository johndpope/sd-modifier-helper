import { Task } from "./task";
import nunjucks from "nunjucks";
import { readFile, writeFile } from "fs/promises";
import { GeneratedImage } from "../models";

/**
 * A task that creates an `index.html` page for generated images.
 */
export class IndexTask implements Task {
  constructor(
    readonly templateFile: string,
    readonly writeTo: string,
    private readonly generated: GeneratedImage[]
  ) {}

  async run(): Promise<void> {
    const template = nunjucks.compile(
      await readFile(this.templateFile, { encoding: "utf8" })
    );
    const asString = template.render({ generated: this.generated });
    await writeFile(this.writeTo, asString, {
      encoding: "utf8",
    });
  }
}
