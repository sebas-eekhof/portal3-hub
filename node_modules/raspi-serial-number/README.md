#Raspberry Pi Serial Number [![11.15.0](https://badge.fury.io/js/raspi-serial-number.svg)](https://badge.fury.io/js/raspi-serial-number)

**Warning:** Only works on *Raspberry Pi* boards! Will raise an exception if not running in a Raspberry Pi

##Summary
*Raspberry Pi*s come with a serial number. This package provides a way to get your *Raspberry Pi*'s serial number as a string.

##Features
* Has one synchronous and two asynchronous functions
* Fast
* Light weight - **Weights 1290 B (uncompressed) or 718 B (gzip-compressed)**
* Has no dependencies
* Contains Typescript type definitions

##Documentation

###Async - Promises
```ts
function getSerialNumber(): Promise<string>;
```
Almost the same as the previous one but returns a promise which will resolve into the serial number or reject with an exception.

###Async - Callback
```ts
function getSerialNumber(callback: (error: any, data?: string) => void): void;
```
Receives a callback function. If there is an error, the first parameter of the callback will be it. If not, the serial number will be passed to the second parameter.

###Sync
```ts
function getSerialNumberSync(): string;
```
Returns Raspberry Pi's serial number string or throws an exception if there is an error.

##Examples

###### (Typescript definitions already included)

###On ES5:
```js
var rsn = require('raspi-serial-number');
var getSerialNumber = rsn.getSerialNumber;
var getSerialNumberSync = rsn.getSerialNumberSync;
```

###On ES6:
```ts
import {getSerialNumber, getSerialNumberSync} from 'raspi-serial-number';
```
or

```ts
const {getSerialNumber, getSerialNumberSync} = require('raspi-serial-number');
```

###Async - Promises
```ts
getSerialNumber()
    .then(d=>console.log("Promise result: ",d))
    .catch(e=>console.log("Promise error: ",e));
```

###Async - Callback
```ts
getSerialNumber((error,data) => {
    if(error)
        console.error("Callback error: ",error);
    else
        console.log("Callback result: ",data)
});
```

###Sync
```ts
try {
    console.log("Sync result: ",getSerialNumberSync());
} catch (e) {
    console.error("Sync error: ",e);
}
```


##Future work
* Add options to allow specifying whether or not the leftmost zeros should be trimmed or not (current behaviour is trimming the leftmost zeros of the serial number)
* Maybe add some other options. I'm open to suggestions!

##

**Feel free to open an issue on Github if you find a bug or have a suggestion!**