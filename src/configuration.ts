import { join } from "path";
import { readdir, readFile } from "fs/promises";
import { Dirent } from "fs";
import { StableDiffusionOptions } from "./stable-diffusion-options";
import { validateModifiers, validateOptions } from "./validation";
import { Modifiers } from "./models";

export class Configuration {
  get inputPath(): string {
    return process.env.INPUT_PATH ?? join(__dirname, "..", "inputs");
  }

  get inputExpr(): RegExp {
    return /^([A-Za-z ]+)\.png$/i; // FIXME: hardcoded
  }

  get optionsPath(): string {
    return process.env.OPTIONS_PATH ?? join(__dirname, "..", "options.json");
  }

  get outputPath(): string {
    return process.env.OUTPUT_PATH ?? join(__dirname, "..", "outputs");
  }

  get templatePath(): string {
    return process.env.TEMPLATE_PATH ?? join(__dirname, "..", "templates");
  }

  get modifiersPath(): string {
    return (
      process.env.MODIFIERS_PATH ?? join(__dirname, "..", "modifiers.json")
    );
  }

  /**
   * Reads a list of modifiers.
   */
  async readModifiers(): Promise<Modifiers> {
    const contents = await readFile(this.modifiersPath, { encoding: "utf8" });
    const values: unknown = JSON.parse(contents);
    return validateModifiers(values);
  }

  /**
   * Reads all input files.
   */
  async readInputs(): Promise<Dirent[]> {
    const entries = await readdir(this.inputPath, {
      encoding: "utf8",
      withFileTypes: true,
    });
    return entries.filter(
      (entry) => entry.isFile() && this.inputExpr.test(entry.name)
    );
  }

  /**
   * Reads and validates options.
   * If valid, it will be returned as a {@link StableDiffusionOptions} instance.
   */
  async readOptions(): Promise<StableDiffusionOptions> {
    const contents = await readFile(this.optionsPath, { encoding: "utf8" });
    const values: unknown = JSON.parse(contents);
    return validateOptions(values);
  }

  nameToPrompt(name: string): string {
    const match = this.inputExpr.exec(name);
    if (!match) {
      throw new Error(`Failed to figure out the prompt for "${name}"`);
    }
    return match[1];
  }
}
