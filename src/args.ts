import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export default yargs(hideBin(process.argv))
  .option("modifiers", {
    alias: "m",
    default: "modifiers.json",
    string: true,
    demandOption: true,
    description: "input modifiers.json file",
  })
  .option("options", {
    alias: "x",
    default: "options.json",
    string: true,
    demandOption: true,
    description: "options for Stable Diffusion",
  })
  .option("input", {
    alias: "i",
    default: "inputs",
    string: true,
    demandOption: true,
    description: "path containing input images",
  })
  .option("output", {
    alias: "o",
    default: "outputs",
    string: true,
    demandOption: true,
    description: "path for the output",
  })
  .option("clean", {
    alias: "c",
    default: false,
    boolean: true,
    description: "if the output path should be cleaned first",
  })
  .option("skip-existing", {
    alias: "s",
    default: false,
    boolean: true,
    description: "skips image generation for files that already exist",
  })
  .parse();
