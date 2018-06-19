import { Fn, IChain, Predicate } from "../types/fx.d";
import { chainify } from "./helpers";

interface IPerson {
  readonly name: string;
  readonly age: number;
}

const old: Predicate<IPerson> = (p: IPerson) => p.age > 40;
const jj: Predicate<IPerson> = (p: IPerson) => p.name[0] === "j";

const birthday: Fn<IPerson, IPerson> = (p: IPerson) => ({
  age: p.age + 1,
  name: p.name
});

const people: IChain<IPerson> = chainify([
  { age: 87, name: "abe" },
  { age: 39, name: "john" }
]);

export const oldJohn = people
  .map(birthday)
  .filter(jj)
  .map(birthday)
  .filter(old)
  .value();
