# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2022-09-14

### Added
- The validation of `modifiers.json` is now added.
- The path to the options, the modifiers, the input directory, and the output directory
  can now be set via CLI arguments.
- Files that were already generated will no longer be regenerated iff `--skip-existing`
  is set.

### Fixed
- The directory clean-up/creation tasks are now working 2% more properly. For realsies!

### Changed
- By default, this will now only generate **1** output image.

## [1.1.0] - 2022-09-13

This is mainly a slight improvement under the hood, since I wrote and published
1.0.0 in-between shopping and a dentist appointment.
This refactoring step also gave rise to opportunities, such as progress bars.

### Added
- Before starting, the Stable Diffusion back-end will now be pinged.
  This serves as a check to see if it's reachable at all.
- The tool now sports a little progress bar to give you an indication of how much work
  was already done vs. how much work is to be done in total.

### Changed
- Minor visual changes on the generated index page once the renderings are complete.

## [1.0.0] - 2022-09-12

Initial proof-of-concept release.

[Unreleased]: https://github.com/MrManny/sd-modifier-helper/compare/main...develop
[1.2.0]: https://github.com/MrManny/sd-modifier-helper/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/MrManny/sd-modifier-helper/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/MrManny/sd-modifier-helper/releases/tag/v1.0.0
