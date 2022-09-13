import Joi from "joi";
import { StableDiffusionOptions } from "./stable-diffusion-options";
import { Modifiers } from "./models";

/**
 * This is the Joi schema to validate arbitrary JSON input to follow the
 * format of {@link StableDiffusionOptions}.
 */
const optionsSchema = Joi.object<StableDiffusionOptions>({
  faceCorrection: Joi.boolean().default(false),
  fullPrecision: Joi.boolean().default(false),
  guidance: Joi.number().min(1.0).default(7.5),
  height: Joi.number().integer().min(64).max(1024).default(512),
  width: Joi.number().integer().min(64).max(1024).default(512),
  mode: Joi.string().valid("cpu", "gpu").default("gpu"),
  initialImagePath: Joi.string().optional(),
  seed: Joi.number().integer().min(0).default(42),
  steps: Joi.number().integer().min(1).default(50),
  timeout: Joi.number().min(1000).default(120000),
  upscale: Joi.alternatives(
    Joi.boolean().valid(false),
    Joi.string().valid("RealESRGAN_x4plus", "RealESRGAN_x4plus_anime_6B")
  ).default("RealESRGAN_x4plus"),
  turbo: Joi.boolean().default(true),
  promptStrength: Joi.number().min(0).max(1).default(0.8),
  outputs: Joi.number().integer().min(1).default(2),
});

const modifiersSchema = Joi.object<Modifiers>()
  .pattern(/^[a-zA-Z &_-]{1,64}$/, Joi.array().items(Joi.string().min(1)))
  .unknown(true);

function pathToString(path: Array<number | string>): string {
  return path
    .map((item) => (typeof item === "number" ? `[${item}]` : item))
    .join(".");
}

function validate<TIn, TOut>(data: TIn, schema: Joi.ObjectSchema<TOut>): TOut {
  const { error, value } = schema.validate(data, {
    abortEarly: true,
    cache: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    const [issue] = error.details;
    throw new Error(`${issue.message} in path: ${pathToString(issue.path)}`);
  }
  return value as TOut;
}

/**
 * Validates the given object against the {@link StableDiffusionOptions} schema.
 * If valid, it will be returned (alongside defaults where unset).
 * If invalid, an Error will be thrown.
 *
 * @param options the object to validate.
 */
export function validateOptions(options: unknown): StableDiffusionOptions {
  return validate(options, optionsSchema);
}

/**
 * Validates the given object against the {@link Modifiers} schema.
 * If valid, it will be returned (alongside defaults where unset).
 * If invalid, an Error will be thrown.
 *
 * @param modifiers the object to validate.
 */
export function validateModifiers(modifiers: unknown): Modifiers {
  return validate(modifiers, modifiersSchema);
}
