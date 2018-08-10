import { diffLines } from "diff";
import { join } from "path";
import { Recoverable, REPLServer, start } from "repl";
import { register, Register, TSError } from "ts-node";

import { executeJavaScript, isRecoverable, lineCount } from "./helpers";

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
  private readonly evalData = { input: "", output: "", version: 0, lines: 0 };

  constructor(tsconfigPath: string, initialTypeScript: string, debuggingEnabled: boolean) {
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
    const resetEval = this.appendEval("");
    +"\n";

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

        // Had to add one return so appendEval (lineCount) wouldn't panic
        const undo = this.appendEval(identifier + "\n");
        const { name, comment } = this.typeScriptService.getTypeInfo(
          this.evalData.input,
          this.evalPath,
          // Have to subtract one due to the empty return above
          this.evalData.input.length - 1,
        );

        undo();

        repl.outputStream.write(`${name}\n${comment ? `${comment}\n` : ""}`);
        repl.displayPrompt();
      },
    });

    return repl;
  }

  private compileAndExecute(tsInput: string): any {
    const lines = this.evalData.lines;
    const isCompletion = !/\n$/.test(tsInput);
    const undo = this.appendEval(tsInput);
    let output: string;

    try {
      output = this.typeScriptService.compile(this.evalData.input, this.evalPath, -lines);
    } catch (err) {
      undo();
      throw err;
    }

    // Use `diff` to check for new JavaScript to execute.
    const changes = diffLines(this.evalData.output, output);

    if (isCompletion) {
      undo();
    } else {
      this.evalData.output = output;
    }

    const lastResult = changes.reduce((result, change) => {
      return change.added ? executeJavaScript(change.value, this.evalFilename) : result;
    }, undefined);

    return lastResult;
  }

  private async replEval(code: string): Promise<ReplEvalResult | undefined> {
    // TODO: Figure out how to handle completion here.
    if (code === ".scope") {
      return undefined;
    }

    try {
      const result = this.compileAndExecute(code);
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

  private appendEval(input: string): () => void {
    const oldInput = this.evalData.input;
    const oldVersion = this.evalData.version;
    const oldOutput = this.evalData.output;
    const oldLines = this.evalData.lines;

    // Handle ASI issues with TypeScript re-evaluation.
    if (
      oldInput.charAt(oldInput.length - 1) === "\n" &&
      /^\s*[\[\(\`]/.test(input) &&
      !/;\s*$/.test(oldInput)
    ) {
      this.evalData.input = `${this.evalData.input.slice(0, -1)};\n`;
    }

    this.evalData.input += input;
    this.evalData.lines += lineCount(input);
    this.evalData.version++;

    const undoFunction = () => {
      this.evalData.input = oldInput;
      this.evalData.output = oldOutput;
      this.evalData.version = oldVersion;
      this.evalData.lines = oldLines;
    };

    return undoFunction;
  }
}
