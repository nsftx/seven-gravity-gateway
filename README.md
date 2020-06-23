# Seven Gravity Gateway

This component serves as communication layer between parent and child frames. Gateway supports cross and same origin communication between frames on same page.

## Installation

`npm install @nsoft/seven-gravity-gateway --save`

GG consists of 2 modules: Master and Slave module. Master module is intended for frames which will integrate 3rd party product via iframe. Slave module is intended for applications which will be integrated in some 3rd party frame. 

## Usage

Modules are exposed as UMD modules which we can be required as CommonJS or AMD modules, or simply injecting the script in HTML and using the global reference. Script is available over `nsoft.cdn` and it is public. GG can also be imported from `node_modules`.

**Master gateway:**

```lang=javascript
var Gateway = window.gravity.gateway.master;
```
or
```lang=javascript
import Gateway from '@nsoft/seven-gravity-gateway/master';
```

**Slave gateway:**

```lang=javascript
var Gateway = window.gravity.gateway.slave;
```
or
```lang=javascript
import Gateway from '@nsoft/seven-gravity-gateway/slave';
```


To load **both modules**:
```lang=javascript
import Gateway from '@nsoft/seven-gravity-gateway';
```

For a detailed explanation about how GG works, check [Wiki](https://github.com/nsftx/seven-gravity-gateway/wiki).
