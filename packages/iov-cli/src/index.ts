// I tried to add these but they just broke tsc
// so it seems we can add globals defined in the same module,
// but if we import anything it breaks???

// import * as code from './api';
// import {Foo} from './globals';

declare module NodeJS {
  interface Global {
    value: number;
    fx: (x: number) => number;
  }
}

declare const value: number;
declare const fx: (x: number) => number;

const a = 100;
const bigger = (x: number) => x * 5;
global.value = a;
global.fx = bigger;

// tslint:disable:no-console
console.log(`set global ${global.value}`);
console.log('Type fx(value)');

