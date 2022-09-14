import { join } from "path";
import { readdir, readFile } from "fs/promises";
import { Dirent } from "fs";
import { StableDiffusionOptions } from "./stable-diffusion-options";
import { validateModifiers, validateOptions } from "./validation";
import { Modifiers } from "./models";
import args from "./args";

/**
 * This is a helper class that makes configuration related settings available.
 */
export class Configuration {
  /**
   * A regular expression describing the format of the input image,
   * with the first matching group serving as the name for an image.
   */
  get inputExpr(): RegExp {
    return /^([A-Za-z ]+)\.png$/i; // FIXME: hardcoded
  }

  /**
   * The root path from which templates should be loaded from.
   * @see {@link IndexTask}
   */
  get templatePath(): string {
    return process.env.TEMPLATE_PATH ?? join(__dirname, "..", "templates");
  }

  /**
   *
   * @param inputPath the folder from which to load the input images
   * @param outputPath the root path under which to store results
   * @param modifiersPath the file from which to load a set of modifiers from
   * @param optionsPath the file from which to load Stable Diffusion options from
   * @param cleanFirst if true, the output path will be entirely removed first
   * @param skipExisting if true, existing files will not be regenerated
   * @protected
   */
  protected constructor(
    // TODO: wrap into options argument
    readonly inputPath: string,
    readonly outputPath: string,
    readonly modifiersPath: string,
    readonly optionsPath: string,
    readonly cleanFirst: boolean,
    readonly skipExisting: boolean
  ) {}

  static async fromArgs(): Promise<Configuration> {
    const actual = await args;
    return new Configuration(
      actual.input,
      actual.output,
      actual.modifiers,
      actual.options,
      actual.clean,
      actual.skipExisting
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

  /**
   * Uses the first match group described by {@link inputExpr} to
   * extract a name for an input file.
   *
   * @param name the file's name, with no path information.
   */
  nameToPrompt(name: string): string {
    const match = this.inputExpr.exec(name);
    if (!match) {
      throw new Error(`Failed to figure out the prompt for "${name}"`);
    }
    return match[1];
  }
}
