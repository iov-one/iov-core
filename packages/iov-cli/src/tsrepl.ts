import { diffLines } from "diff";
import { join } from "path";
import { Recoverable, REPLServer, start } from "repl";
import { register, Register, TSError } from "ts-node";

import { executeJavaScript, isRecoverable } from "./helpers";

interface ReplEvalResult {
  readonly result: any;
  readonly error: any;
}

export class TsRepl {
  private readonly typeScriptService: Register;
  private readonly initialTypeScript: string;
  private readonly debuggingEnabled: boolean;
  private readonly evalFilename = `[eval].ts`;
  private readonly evalPath = join(process.cwd(), this.evalFilename);
  private readonly evalData = { input: "", output: "" };

  constructor(tsconfigPath: string, initialTypeScript: string, debuggingEnabled: boolean = false) {
    this.typeScriptService = register({ project: tsconfigPath });
    this.initialTypeScript = initialTypeScript;
    this.debuggingEnabled = debuggingEnabled;
  }

  public start(): REPLServer {
    /**
     * A wrapper around replEval used to match the method signature
     * for "Custom Evaluation Functions"
     * https://nodejs.org/api/repl.html#repl_custom_evaluation_functions
     */
    const replEvalWrapper = async (
      code: string,
      _context: any,
      _filename: string,
      callback: (err?: Error, result?: any) => any,
    ) => {
      const result = await this.replEval(code);
      if (result === undefined) {
        callback();
      } else {
        callback(result.error, result.result);
      }
    };

    const repl = start({
      prompt: ">> ",
      input: process.stdin,
      output: process.stdout,
      terminal: process.stdout.isTTY,
      eval: replEvalWrapper,
      useGlobal: true,
    });

    // Bookmark the point where we should reset the REPL state.
    const resetEval = this.appendTypeScriptInput("");

    const reset = (): void => {
      resetEval();

      // Hard fix for TypeScript forcing `Object.defineProperty(exports, ...)`.
      executeJavaScript("exports = module.exports", this.evalFilename);

      // Ensure code ends with "\n" due to implementation of replEval
      this.replEval(this.initialTypeScript + "\n");
    };

    reset();
    repl.on("reset", reset);

    repl.defineCommand("type", {
      help: "Check the type of a TypeScript identifier",
      action: (identifier: string) => {
        if (!identifier) {
          repl.displayPrompt();
          return;
        }

        const identifierTypeScriptCode = `${identifier}\n`;
        const undo = this.appendTypeScriptInput(identifierTypeScriptCode);
        const identifierFirstPosition = this.evalData.input.length - identifierTypeScriptCode.length;
        const { name, comment } = this.typeScriptService.getTypeInfo(
          this.evalData.input,
          this.evalPath,
          identifierFirstPosition,
        );

        undo();

        repl.outputStream.write(`${name}\n${comment ? `${comment}\n` : ""}`);
        repl.displayPrompt();
      },
    });

    return repl;
  }

  private compileAndExecute(tsInput: string, isAutocompletionRequest: boolean): any {
    if (!isAutocompletionRequest) {
      // Expect POSIX lines (https://stackoverflow.com/a/729795)
      if (tsInput.length > 0 && !tsInput.endsWith("\n")) {
        throw new Error("final newline missing");
      }
    }

    const undo = this.appendTypeScriptInput(tsInput);
    let output: string;

    try {
      // lineOffset unused at the moment (https://github.com/TypeStrong/ts-node/issues/661)
      output = this.typeScriptService.compile(this.evalData.input, this.evalPath);
    } catch (err) {
      undo();
      throw err;
    }

    // Use `diff` to check for new JavaScript to execute.
    const changes = diffLines(this.evalData.output, output);

    if (isAutocompletionRequest) {
      undo();
    } else {
      this.evalData.output = output;
    }

    // Execute new JavaScript. This may not necessarily be at the end only because e.g. an import
    // statement in TypeScript is compiled to no JavaScript until the imported symbol is used
    // somewhere. This btw. leads to a different execution order of imports than in the TS source.
    let lastResult: any = undefined;
    for (const added of changes.filter(change => change.added)) {
      lastResult = executeJavaScript(added.value, this.evalFilename);
    }
    return lastResult;
  }

  private async replEval(code: string): Promise<ReplEvalResult | undefined> {
    // TODO: Figure out how to handle completion here.
    if (code === ".scope") {
      return undefined;
    }

    const isAutocompletionRequest = !/\n$/.test(code);

    try {
      const result = this.compileAndExecute(code, isAutocompletionRequest);
      return {
        result: result,
        error: undefined,
      };
    } catch (error) {
      if (this.debuggingEnabled) {
        console.log("Current REPL TypeScript program:");
        console.log(this.evalData.input);
      }

      let outError: Error | undefined;
      if (error instanceof TSError) {
        // Support recoverable compilations using >= node 6.
        if (Recoverable && isRecoverable(error)) {
          outError = new Recoverable(error);
        } else {
          console.error(error.diagnosticText);
          outError = undefined;
        }
      } else {
        outError = error;
      }

      return {
        result: undefined,
        error: outError,
      };
    }
  }

  private appendTypeScriptInput(input: string): () => void {
    const oldInput = this.evalData.input;
    const oldOutput = this.evalData.output;

    // Handle ASI issues with TypeScript re-evaluation.
    if (
      oldInput.charAt(oldInput.length - 1) === "\n" &&
      /^\s*[\[\(\`]/.test(input) &&
      !/;\s*$/.test(oldInput)
    ) {
      this.evalData.input = `${this.evalData.input.slice(0, -1)};\n`;
    }

    this.evalData.input += input;

    const undoFunction = () => {
      this.evalData.input = oldInput;
      this.evalData.output = oldOutput;
    };

    return undoFunction;
  }
}
