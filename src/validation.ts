import Joi from "joi";
import { StableDiffusionOptions } from "./stable-diffusion-options";

const schema = Joi.object<StableDiffusionOptions>({
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

export function validate(options: unknown): StableDiffusionOptions {
  const { error, value } = schema.validate(options, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (error) {
    throw error;
  }
  return value;
}
