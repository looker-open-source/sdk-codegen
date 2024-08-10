/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-redeclare */

// Defensive type-level programming to guard against additional
// parameters being added to Error, as happened in lib.es2022.error.d.ts
// (which introduced the errorOptions argument)
type AugmentErrorOptions<
  ErrorParameters extends unknown[],
  AdditionalErrorOptions,
> = ErrorParameters extends [(infer Message)?]
  ? [Message?, AdditionalErrorOptions?]
  : ErrorParameters extends [(infer Message)?, (infer ErrorOptions)?]
    ? [Message?, (ErrorOptions & AdditionalErrorOptions)?]
    : ErrorParameters extends [
          (infer Message)?,
          (infer ErrorOptions)?,
          ...infer Rest,
        ]
      ? [Message?, (ErrorOptions & AdditionalErrorOptions)?, ...Rest]
      : never;

interface IErrorDetail {
  field?: string;
  code?: string;
  message?: string;
  documentation_url: string;
}

// This specifies SDK custom error options
interface ILookerSDKErrorOptions {
  errors?: IErrorDetail[];
  documentation_url?: string | null;
}

interface ILookerSDKErrorConstructor {
  new (
    ...args: AugmentErrorOptions<
      ConstructorParameters<ErrorConstructor>,
      ILookerSDKErrorOptions
    >
  ): LookerSDKError;
  (
    ...args: AugmentErrorOptions<
      Parameters<ErrorConstructor>,
      ILookerSDKErrorOptions
    >
  ): LookerSDKError;
}

// The subclass and function expression's name should match, so that stack traces look clean.
// We bind it to a local identifier for clarity, and to perform a type assertion.
export interface LookerSDKError extends Error {
  errors?: IErrorDetail[];
  documentation_url?: string | null;
}

export const LookerSDKError: ILookerSDKErrorConstructor =
  /* #__PURE__ */ (() => {
    'use strict';
    const LookerSDKErrorConstructor = function LookerSDKError(
      this: LookerSDKError | undefined,
      ...errorArguments
    ) {
      const [
        message,
        {
          errors,
          documentation_url,
          ...errorOptions
        } = {} as ILookerSDKErrorOptions,
        ...rest
      ]: AugmentErrorOptions<
        ConstructorParameters<ErrorConstructor>,
        ILookerSDKErrorOptions
      > &
        AugmentErrorOptions<
          Parameters<ErrorConstructor>,
          ILookerSDKErrorOptions
        > = errorArguments;

      // The `super()` call. At present, Error() and new Error() are
      // indistinguishable, but use whatever we were invoked with in case
      // that ever changes.
      const error = this
        ? new Error(
            message,
            // we have to suppress a type error here if TypeScript
            // doesn't know es2022's two-argument Error constructor
            // @ts-ignore-error
            errorOptions,
            ...rest
          )
        : Error(
            message,
            // @ts-ignore-error
            errorOptions,
            ...rest
          );

      // Object.setPrototypeOf() is necessary when extending built-ins,
      // since Error.call(this, message, errorOptions, ...rest) doesn't
      // set up the prototype chain the way it would with a user-defined
      // class.
      Object.setPrototypeOf(
        error,
        this ? Object.getPrototypeOf(this) : LookerSDKError.prototype
      );

      // Normally the 'message' property of JavaScript Error objects is non-enumerable
      // set it to be enumerable for consistency with our non-error responses,
      // which are implemented as plain JavaScript objects where all
      // properties are enumerable.
      Object.defineProperty(error, 'message', { enumerable: true });

      // handle null in addition to undefined
      (error as LookerSDKError).errors = errors ?? [];
      (error as LookerSDKError).documentation_url = documentation_url ?? '';

      return error;
    } as ILookerSDKErrorConstructor;

    // LookerSDKError.prototype, LookerSDKError.prototype.constructor, and
    // LookerSDKError.prototoype.name all have to be non-enumerable to match
    // the built-in RangeError, TypeError, etc., so we use
    // Object.defineProperty to set them instead of `=` assignment.

    // Default values for property descriptor objects:
    //   writable: false
    //   enumerable: false
    //   configurable: false
    Object.defineProperty(
      LookerSDKErrorConstructor,
      'prototype',
      // It's a weird wart that the built-in Error constructor
      // prototypes have writable and configurable constructor and name
      // fields. We follow that behavior to be consistent, not because
      // it makes sense.
      {
        value: Object.create(Error.prototype, {
          constructor: {
            value: LookerSDKErrorConstructor,
            writable: true,
            configurable: true,
          },
          name: {
            value: 'LookerSDKError',
            writable: true,
            configurable: true,
          },
        }),
        // SomeConstructorFunction.prototype starts off writable with
        // `function`-type constructors, in contrast to `class SomeClass`.
        // Set this to be non-writable to match `class`es and the built-in
        // Error constructors.
        writable: false,
      }
    );

    return LookerSDKErrorConstructor;
  })();
