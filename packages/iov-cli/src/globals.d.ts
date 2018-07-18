// just to see if we can force the import with this
export interface Foo {
  name: string;
}

declare module NodeJS {
  interface Global {
    a: number;
    bigger: (x: number) => number;
  }
}

declare const a: number;
declare const bigger: (x: number) => number;

