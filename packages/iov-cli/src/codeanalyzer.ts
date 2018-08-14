import recast = require("recast");
import babylon = require("babylon");

export function wrapInAsyncFunction(code: string): string {
  var ast = recast.parse(`(async () => { ${code} })()`, { parser: babylon });
  // console.log(recast.print(ast));
  // console.log(ast.program.body);

  const body = ast.program.body[0].expression.callee.body.body;

  if (body.length !== 0) {
    const last = body.pop();
    if (last.type === "ExpressionStatement") {
      body.push({
        type: "ReturnStatement",
        argument: last,
      });
    } else {
      body.push(last);
    }
  }

  return recast.print(ast).code;
}
