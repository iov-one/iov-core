// This is an example of the non-trivial art of converting an asynchonous
// method into a synchonous one. This should only be used in the REPL where
// await is not available since the user is working in a top level scope.
//
// yarn run ts-node wait-demo.ts

function wait<T>(promise: Promise<T>): T {
  return require('deasync2').await(promise);
}

const somePromise = new Promise((resolve, _) => {
  setTimeout(() => {
    console.log("done! Will resolve now");
    resolve("abc");
  }, 2000);
})

console.log("Let's wait until we get what we need …");
const value = wait(somePromise)
console.log(value)
