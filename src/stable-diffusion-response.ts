export interface StableDiffusionImageResponse {
  status: "succeeded";
  output: Array<{
    data: string;
    seed: number;
  }>;
}

export type StableDiffusionResponse = StableDiffusionImageResponse;
