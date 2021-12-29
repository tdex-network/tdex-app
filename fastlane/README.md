fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### git_check

```sh
[bundle exec] fastlane git_check
```

Various checks for git branch

----


## iOS

### ios certificates

```sh
[bundle exec] fastlane ios certificates
```

Fetch certificates and provisioning profiles

### ios build

```sh
[bundle exec] fastlane ios build
```

Build the iOS application.

### ios bump

```sh
[bundle exec] fastlane ios bump
```

Increment the build bersion.

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Ship to Testflight.

### ios beta_ci

```sh
[bundle exec] fastlane ios beta_ci
```

Ship to TestFlight in CI

----


## Android

### android apk

```sh
[bundle exec] fastlane android apk
```

Build the Android application for Debug.

### android build

```sh
[bundle exec] fastlane android build
```

Build the Android application for Release.

### android beta

```sh
[bundle exec] fastlane android beta
```

Ship to Playstore Beta.

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
