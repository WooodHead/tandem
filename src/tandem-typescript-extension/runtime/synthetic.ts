import * as ts from "typescript";
import { evaluateTypescript } from "./evaluator";
import {
  ISynthetic,
  SyntheticArray,
  SymbolTable,
  SyntheticKind,
  NativeFunction,
  SyntheticObject,
  ISyntheticFunction,
  SyntheticValueObject,
  mapNativeAsSynthetic,
  ISyntheticValueObject,
  IInstantiableSynthetic,
} from "tandem-runtime";

export abstract class SyntheticBaseFunction extends SyntheticObject implements ISyntheticFunction {
  kind = SyntheticKind.Function;
  constructor(name?: string) {
    super();
    SyntheticObject.defineProperty(this, "call", {
      get: () => {
        return new SyntheticCallFunction(this);
      }
    });
    SyntheticObject.defineProperty(this, "apply", {
      get: () => {
        return new SyntheticApplyFunction(this);
      }
    });

    SyntheticObject.defineProperty(this, "bind", {
      get: () => {
        return new SyntheticBindFunction(this);
      }
    });
    this.set("prototype", new SyntheticObject());
    this.set("name", new SyntheticValueObject(name));
  }

  abstract apply(context: ISynthetic, args: Array<ISynthetic>);

  createInstance(args: Array<ISynthetic>): ISynthetic {
    const instance = SyntheticObject.create(this.get<SyntheticObject>("prototype"));
    this.apply(instance, args);
    return instance;
  }
}

export class SyntheticFunction extends SyntheticBaseFunction implements ISyntheticFunction {
  kind = SyntheticKind.Function;

  constructor(private _expression: ts.FunctionLikeDeclaration, private _context: SymbolTable, name?: string) {
    super(name);
  }

  apply(context: ISynthetic, args: Array<ISynthetic> = []): ISynthetic {

    const bodyContext = this._context.createChild();
    bodyContext.defineConstant("this", context);
    const ctxArgs  = new SyntheticObject();

    this._expression.parameters.forEach((parameter, i) => {
      const varName = (<ts.Identifier>parameter.name).text;
      const value   = (parameter.dotDotDotToken ? new SyntheticArray(...args.slice(i)) : args[i]) || new SyntheticValueObject(undefined);
      ctxArgs.set(varName, value);
      bodyContext.defineVariable(
        varName,
        value
      );
    });

    bodyContext.set("arguments", ctxArgs);

    return evaluateTypescript(this._expression.body, bodyContext).value || new SyntheticValueObject(undefined);
  }

  toNative() {
    return (...args: any[]) => {
      return this.apply(mapNativeAsSynthetic(this), args.map((value) => mapNativeAsSynthetic(value))).toNative();
    };
  }

  toString() {
    return this._expression.getText();
  }

  toJSON() {
    return { kind: SyntheticKind.Function, scriptText: this._expression.getText() };
  }
}

class SyntheticCallFunction extends SyntheticBaseFunction {
  constructor(private __target: ISyntheticFunction) {
    super("name");
  }
  apply(context: ISynthetic, args: Array<ISynthetic> = []) {
    return this.__target.apply(args[0], args.slice(1));
  }
}

class SyntheticApplyFunction extends SyntheticBaseFunction {
  constructor(private __target: ISyntheticFunction) {
    super("apply");
  }
  apply(context: ISynthetic, args: Array<ISynthetic> = []) {
    return this.__target.apply(args[0], (<SyntheticArray<any>>args[1]).value);
  }
}

class SyntheticBindFunction extends SyntheticBaseFunction {
  constructor(private __target: ISyntheticFunction) {
    super("bind");
  }
  apply(context: ISynthetic, args: Array<ISynthetic> = []) {
    return new SyntheticBoundFunction(this.__target, args);
  }
}

class SyntheticBoundFunction extends SyntheticBaseFunction {
  constructor(private __target: ISyntheticFunction, private _args: Array<ISynthetic>) {
    super();
  }
  apply(context: ISynthetic, args: Array<ISynthetic> = []) {
    return this.__target.apply(this._args[0], this._args.slice(1).concat(args));
  }
}

export class SyntheticClass extends SyntheticObject implements IInstantiableSynthetic {
  constructor(private _expression: ts.ClassDeclaration, private _context: SymbolTable, name?: string) {
    super();
    this.set("name", new SyntheticValueObject(name));
  }

  toNative() {

    // TODO
    return function() {

    };
  }

  createInstance(args: Array<ISynthetic>): ISynthetic {
    const instance = new SyntheticObject();
    let constructor;
    for (const member of this._expression.members) {
      const value = evaluateTypescript(member, this._context).value;
      if (value == null) continue;

      if (member.kind === ts.SyntaxKind.Constructor) {
        constructor = value;
      } else if (member.name) {
        instance.set((<ts.Identifier>member.name).text, value);
      }
    }

    if (constructor) {
      constructor.apply(instance, args);
    }

    return instance;
  }
}