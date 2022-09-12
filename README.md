This is a little NodeJS script that utilizes
[cmdr2's Stable Diffusion distribution](https://github.com/cmdr2/stable-diffusion-ui/)
to generate previews of well-known modifiers.

These previews will be generated with:
- a resolution of 512x512,
- a downscaled thumbnail with the resolution 128x128,
- two examples for every style, starting with seed 42,
- a prompt strength of 0.8,
- a guidance score of 7.5,
- 50 iterations,
- *no* full precision,
- *no* upscaling,
- *no* face corrections, but
- lots of AI love. ♥

This is a proof-of-concept, and I did it between shopping for my dog's birthday and
a dentist appointment. Please be gentle.

## Customize Inputs

Just drop the files in `./inputs`.
Their file name will be their prompt as well.

## Custom Modifiers

Modifiers are loaded from `./modifiers.json'.

## Customize Outputs

You can fiddle with some Stable Diffusion parameters in `./options.json`.
If you mess it up, the validation library Joi will cry havoc though.

## Generated Artwork

Generated files will be placed in:
`./outputs/[CATEGORY NAME]/[STYLE]`.

For every input image, two images will be generated (seed 42 and 43) at 512x512.
In addition, a thumbnail of these will be created at 128x128.
