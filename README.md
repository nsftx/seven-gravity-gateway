# Seven Gravity Gateway

This component serves as communication layer between parent and child frames. Gateway supports cross and same origin communication between frames on same page.

## Installation

Our packages are published to [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-packages-from-other-organizations). You need to add the entry to global or project based `.npmrc` file so that all requests to install our packages will go through GitHub Packages. 

```
@nsftx:registry=https://npm.pkg.github.com
```

After that, install package

`npm install @nsftx/seven-gravity-gateway --save`

## Usage

GG consists of 2 modules: Master and Slave module. Master module is intended for frames which will integrate 3rd party product via iframe. Slave module is intended for applications which will be integrated in some 3rd party frame.

Modules are exposed as UMD modules which we can be required as CommonJS or AMD modules, or simply injecting the script in HTML and using the global reference.

**Master gateway:**

```javascript
var Gateway = window.gravity.gateway.master;
```
or
```javascript
import Gateway from '@nsftx/seven-gravity-gateway/master';
```

**Slave gateway:**

```javascript
var Gateway = window.gravity.gateway.slave;
```
or
```javascript
import Gateway from '@nsftx/seven-gravity-gateway/slave';
```


To load **both modules**:
```javascript
import Gateway from '@nsftx/seven-gravity-gateway';
```

For a detailed explanation about how GG works, check [Wiki](https://github.com/nsftx/seven-gravity-gateway/wiki).

## Test

`npm run test` or `npm run test:watch`

## Contributing

Any contributions you make are **greatly appreciated**.

1. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request against `next`
5. Once approved, Open a new Pull Request against `master`

## Release procedure

In order to release next version of the library pull request is required. Use following steps for release.

- Merge approved pull requests that should be in next version to master
- Create `version-$nextVersion` branch from master or next
- run `npm version $versionType` for stable release or for next `npm version prerelease --preid=beta`
- Push branch & tag to remote
- Create pull request using `release` template https://github.com/nsftx/seven-components/pull/new?template=release.md
- After pull request is merged create a new Release document https://github.com/nsftx/seven-components/releases/new. GitHub will trigger action (`.github/workflows/release.yml`) and it will publish package
