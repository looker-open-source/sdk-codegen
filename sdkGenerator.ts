import * as Models from "./sdkModels";

export interface IGeneratorCtor<T extends Models.IModel> {
  new (model: T): Generator<T>
}

export abstract class Generator<T extends Models.IModel> {
  model: T;
  buf: string[] = [];

  constructor (model: T) {
    this.model = model;
  }

  // convenience function that calls render for each item in the list
  // and collects their output in the buffer
  each<K extends Models.IModel>(list: Array<K>, ctor: IGeneratorCtor<K>, delimiter?: string): this {
    const strs = list.map((model) => {
      return new ctor(model).render()
    })
    if (delimiter) {
      this.p(strs.join(delimiter))
    }
    else {
      this.p(strs)
    }
    return this;
  }

  abstract render(): string

  // Add one or more strings to the internal buffer
  // if the string is not empty or undefined
  p(str?: string | string[]): this {
    if (typeof str !== 'undefined' && str.length > 0) {
      this.buf = this.buf.concat(str)
    }
    return this
  }

  pIf(expr: any, str?: string | string[]): this {
    if (expr) {
      this.p(str)
    }
    return this
  }

  to_string(): string {
    return this.buf.join('\n')
  }
}

class ParamGenerator extends Generator<Models.IParameter> {
  render(): string {
    return `${this.model.name}: ${this.model.type.name}`;
  }
}

class List {
  list: string[] = [];

  constructor(str: string | string[]) {
    this.list = this.list.concat(str)
  }

  pIf(expr: any, str: string | string[]): this {
    if (expr) {
      this.list = this.list.concat(str)
    }
    return this
  }

  add(str: string): this {
    this.list.push(str)
    return this
  }

  toString(delimiter: string): string {
    return this.list.join(delimiter);
  }
}

function each<K extends Models.IModel>(list: Array<K>, ctor: IGeneratorCtor<K>, delimiter?: string): string {
  const strs = list.map((model) => {
    return new ctor(model).render()
  })
  return strs.join(delimiter)
}

class MethodGenerator extends Generator<Models.IMethod> {

  prologue(): this {
    return this.p(`# ${this.model.httpMethod} ${this.model.endpoint}`)
    .p(this.model.description);
  }

  decl(): this {
    // composition of functions
    return this.p(`def ${this.model.operationId}${this.paramList()}${this.returnType()}`)
  }

  // responsible for outputting parens or other delimiters, if needed,
  // and the list of param names and types
  paramList() : string {
      // "Wall of params" code style
    return `(${each(this.model.params || [], ParamGenerator, ',\n')})`
  }

  returnType() : string {
    return ` -> ${this.model.type.name}:`
  }

  docComment(): this {
    return this.pIf(this.model.summary, `"""${this.model.summary}"""`)
  }

  body(): this {
    return this.p(`return http.${this.model.httpMethod}(`)
    .p(new List(`'${this.model.endpoint}'`)
      .pIf(this.model.pathArgs, `path=[${this.model.pathArgs}]`)
      .pIf(this.model.bodyArg, `body=${this.model.bodyArg}`)
      .pIf(this.model.queryArgs, `query=${this.model.queryArgs}`)
      .pIf(this.model.headerArgs, `header=${this.model.headerArgs}`)
      .pIf(this.model.cookieArgs, `cookie=${this.model.cookieArgs}`)
      .toString(',\n')
    )
    .p(')\n')
  }

  epilogue(): this {
    return this.p(`# epilogue goes here, if needed\n`)
  }

  render(): string {
    return this.prologue()
    .decl()
    .docComment()  // this ordering appears to be unique to Python?
    .body()
    .epilogue()
    .to_string()
  }
}

export class SdkGenerator extends Generator<Models.ILookerApi> {
  render(): string {
    return this.p(`# total API methods:${this.model.methods.length}`)
    .each(this.model.methods, MethodGenerator)
    .to_string()
  }
}

