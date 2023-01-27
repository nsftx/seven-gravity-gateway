# Seven Gravity Gateway

This component serves as communication layer between parent and child frames. Gateway supports cross and same origin communication between frames on same page.

## Installation

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

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
