This is a little NodeJS script that utilizes
[cmdr2's Stable Diffusion distribution](https://github.com/cmdr2/stable-diffusion-ui/)
to generate previews of well-known modifiers.

These previews will be generated with:

| Setting         |   Value |
|-----------------|--------:|
| Resolution      | 512x512 |
| Outputs         |       2 |
| Initial seed    |      42 |
| Prompt strength |     0.8 |
| Guidance score  |     7.5 |
| Steps           |      50 |
| Upscaling       |    none |
| Face correction |    none |
| Full precision  |      no |
| AI love ♥      |    lots |

This is a proof-of-concept, and I did it between shopping for my dog's birthday and
a dentist appointment. Please be gentle.

## Customize Inputs

Just drop the files in `./inputs`.
Their file name will be their prompt as well.

## Custom Modifiers

Modifiers are loaded from `./modifiers.json`.

## Customize Outputs

You can fiddle with some Stable Diffusion parameters in `./options.json`.
If you mess it up, the validation library Joi will cry havoc though.

## Generated Artwork

Generated files will be placed in:
`./outputs/[CATEGORY NAME]/[STYLE]/[INPUT]-[INDEX]-[full|thumb].png`.

For every input image, images will be generated at 512x512px, starting with seed 42.
In addition, a thumbnail of these will be created at 128x128px.
