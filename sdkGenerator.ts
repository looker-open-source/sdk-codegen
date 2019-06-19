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
  each<K extends Models.IModel>(list: Array<K>, ctor: IGeneratorCtor<K>, indent: string = '', delimiter?: string): this {
    const strs = list.map((model) => {
      return new ctor(model).render(indent)
    })
    if (delimiter) {
      this.p(strs.join(delimiter))
    }
    else {
      this.p(strs)
    }
    return this;
  }

  abstract render(indent: string): string

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

  toString(indent: string): string {
    return indent + this.buf.join('\n' + indent)
  }
}

class ParamGenerator extends Generator<Models.IParameter> {
  render(): string {
    return `${this.model.name}: ${this.model.type.name}`;
  }
}

class List {
  list: string[] = []
  indent: string = '  '

  constructor(str: string | string[], indent: string) {
    this.indent = indent
    this.list = this.list.concat(indent+str)
  }

  pIf(expr: any, str: string | string[]): this {
    if (expr) {
      this.list = this.list.concat(this.indent+str)
    }
    return this
  }

  paramGroup = (section: string, args: string[] | undefined) => this.pIf(args, `${section}=[${args ? args.join(', ') : ''}]`)

  paramSection = (section: string, args: string | undefined) => this.pIf(args, `${section}=${args}`)

  add(str: string): this {
    this.list.push(this.indent+str)
    return this
  }

  toString(delimiter: string): string {
    return this.list.join(delimiter);
  }
}

function each<K extends Models.IModel>(
    list: Array<K>, ctor: IGeneratorCtor<K>,
    indent: string = '', delimiter?: string): string {
  const values = list.map((model) => {
    return new ctor(model).render(indent)
  })
  return values.join(delimiter)
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

  indent() {
    return '  '
  }

  // responsible for outputting parens or other delimiters, if needed,
  // and the list of param names and types
  paramList() : string {
    // "Wall of params" code style
    return `(\n${each(this.model.params || [], ParamGenerator, this.indent(),',\n')})`
  }

  returnType() : string {
    return ` -> ${this.model.type.name}:`
  }

  docComment(): this {
    return this.pIf(this.model.summary, `"""${this.model.summary}"""`)
  }

  body(): this {
    return this.p(`${this.indent()}return session.${this.model.httpMethod}(`)
    .p(new List(`'${this.model.endpoint}'`, this.indent()+this.indent())
        .paramGroup('path', this.model.pathArgs)
        .paramSection('body',this.model.bodyArg)
        .paramGroup( 'query', this.model.queryArgs)
        .paramGroup('header', this.model.headerArgs)
        .paramGroup('cookie', this.model.cookieArgs)
      .toString(',\n')
    )
    .p(`${this.indent()})\n`)
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
    .toString(this.indent())
  }
}

export class SdkGenerator extends Generator<Models.IApi> {
  render(): string {
    return this.p(`# total API methods:${this.model.methods.length}`)
    .each(this.model.methods, MethodGenerator)
    .toString('')
  }
}

