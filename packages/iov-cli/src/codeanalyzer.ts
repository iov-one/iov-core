import recast = require("recast");

export function splitCode(code: string) {
  var ast = recast.parse(code);
  // console.log(recast.print(ast));
  // console.log(ast.program.body);
  const lastStatement = ast.program.body.pop();

  return {
    other: recast.print(ast).code,
    last: recast.print(lastStatement).code,
  };
}
