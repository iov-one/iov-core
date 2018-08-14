import recast = require("recast");

export interface SplitResult {
  readonly other: string;
  readonly last: string;
}

export function splitCode(code: string): SplitResult {
  var ast = recast.parse(code);
  // console.log(recast.print(ast));
  // console.log(ast.program.body);
  const lastStatement = ast.program.body.pop();

  return {
    other: recast.print(ast).code,
    last: recast.print(lastStatement).code,
  };
}
