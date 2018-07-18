const a = 100;

const bigger = (x: number) => x * 5;

// tslint:disable:no-console
console.log(`loaded up ${a}`);

declare module NodeJS {
  interface Global {
    cli: number;
  }
}

declare const cli: number;


global.cli = a;

console.log(`set global ${global.cli}`);


