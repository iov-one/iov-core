import recast = require("recast");

export interface SplitResult {
  readonly rest: any;
  readonly last: any;
}

export function splitCode(code: string): SplitResult {
  var ast = recast.parse(code);
  // console.log(recast.print(ast));
  // console.log(ast.program.body);
  const lastStatement = ast.program.body.pop();

  return {
    rest: ast,
    last: lastStatement,
  };
}

export function convertCodeToFunctionBody(code: string): string {
  let lastOut;

  const { rest, last } = splitCode(code);
  if (!last) return "";

  if (last.type === "ExpressionStatement") {
    lastOut = {
      type: "ReturnStatement",
      argument: last,
    };
  } else {
    lastOut = last;
  }

  rest.program.body.push(lastOut);

  const recastPrintedCode: string = recast.print(rest).code;
  return recastPrintedCode.replace(/;;$/, ";");
}
