fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### bump

```sh
[bundle exec] fastlane bump
```

Bump build numbers, and set the version to match the pacakage.json version.

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

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Ship to Testflight.

### ios prod

```sh
[bundle exec] fastlane ios prod
```

Ship to AppStore.

----


## Android

### android apk

```sh
[bundle exec] fastlane android apk
```

Build the Android application apk.

### android prod

```sh
[bundle exec] fastlane android prod
```

Ship to PlayStore.

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
