/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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

import type {
  Authenticator,
  HttpMethod,
  IAPIMethods,
  ITransportSettings,
  SDKResponse,
  Values,
} from './transport';
import { agentPrefix, sdkOk } from './transport';
import type { IAuthSession } from './authSession';

/**
 * Creates an "sdk" to be used with the TypeScript SDK's funcs.ts file
 * @param authSession authentication session
 * @param apiVersion version of API to use (e.g. "4.0")
 * @param sdkVersion Looker release version (e.g. "21.4")
 */
export const functionalSdk = (
  authSession: IAuthSession,
  apiVersion: string,
  sdkVersion: string
) => {
  const sdk = new APIMethods(authSession, sdkVersion);
  sdk.apiVersion = apiVersion;
  sdk.apiPath =
    authSession.settings.base_url === ''
      ? ''
      : authSession.settings.base_url + '/api/' + apiVersion;
  return sdk;
};

export class APIMethods implements IAPIMethods {
  private _apiPath = '';
  private _apiVersion = '';

  /**
   * Initialize the APIMethods wrapper
   * @param authSession authentication management session
   * @param sdkVersion version of the SDK for agent tagging
   */
  constructor(
    public authSession: IAuthSession,
    public sdkVersion: string
  ) {
    if (
      !('agentTag' in authSession.settings && authSession.settings.agentTag)
    ) {
      // Initialize agentTag if it's not already explicitly set
      authSession.settings.agentTag = `${agentPrefix} ${sdkVersion}`;
    }
  }

  get apiPath() {
    return this._apiPath;
  }

  set apiPath(value: string) {
    if (this._apiPath) {
      throw new Error(
        `API Path is set to "${this._apiPath}" and cannot be reassigned`
      );
    }
    this._apiPath = value;
  }

  get apiVersion() {
    return this._apiVersion;
  }

  set apiVersion(value: string) {
    // API version can only be set once for the instance
    if (this._apiVersion) {
      throw new Error(
        `API Version is set to "${this._apiVersion}" and cannot be reassigned`
      );
    }
    this._apiVersion = value;
  }

  /** A helper method for constructing with a type as a param
   *
   * Example:
   *   APIMethods.create(Looker40SDK, authSession)
   *
   * @param type
   * @param authSession
   */
  static create<T extends APIMethods>(
    type: new (authSession: IAuthSession) => T,
    authSession: IAuthSession
  ): T {
    // eslint-disable-next-line new-cap
    return new type(authSession);
  }

  /** A helper method for simplifying error handling of SDK responses.
   *
   * Pass in a promise returned by any SDK method, and it will return a promise
   * that rejects if the `SDKResponse` is not `ok`. This will swallow the type
   * information in the error case, but allows you to route all the error cases
   * into a single promise rejection.
   *
   * The promise will have an `Error` rejection reason with a string `message`.
   * If the server error contains a `message` field, it will be provided, otherwise a
   * generic message will occur.
   *
   * ```ts
   * const sdk = LookerSDK({...})
   * let look
   * try {
   *    look = await sdk.ok(sdk.create_look({...}))
   *    // do something with look
   * }
   * catch(e) {
   *    // handle error case
   * }
   * ```
   */
  async ok<TSuccess, TError>(promise: Promise<SDKResponse<TSuccess, TError>>) {
    return sdkOk<TSuccess, TError>(promise);
  }

  /**
   * Determine whether the url should be an API path, relative from base_url, or is already fully specified override
   * @param path Request path
   * @param options Transport settings
   * @param authenticator optional callback
   * @returns the fully specified request path including any query string parameters
   */
  makePath(
    path: string,
    options: Partial<ITransportSettings>,
    authenticator?: Authenticator
  ) {
    if (path.match(/^(http:\/\/|https:\/\/)/gi)) return path;
    // is this an API-versioned call?
    const base = authenticator ? this.apiPath : options.base_url;
    return `${base}${path}`; // path was relative
  }

  /**
   *
   * A helper method to add authentication to an API request for deserialization
   *
   * @param {HttpMethod} method type of HTTP method
   * @param {string} path API endpoint path
   * @param {any} queryParams Optional query params collection for request
   * @param {any} body Optional body for request
   * @param {Partial<ITransportSettings>} options Optional overrides like timeout and verify_ssl
   */
  async authRequest<TSuccess, TError>(
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    options = { ...this.authSession.settings, ...options };
    const authenticator = (init: any) => {
      return this.authSession.authenticate(init);
    };
    path = this.makePath(path, options, authenticator);
    return this.authSession.transport.request<TSuccess, TError>(
      method,
      path,
      queryParams,
      body,
      authenticator,
      options
    );
  }

  /**
   * A helper method to add authentication to an API request for streaming
   * @param {(readable: Readable) => Promise<T>} callback
   * @param {HttpMethod} method
   * @param {string} path
   * @param queryParams
   * @param body
   * @param {Partial<ITransportSettings>} options
   * @returns {Promise<T>}
   */
  async authStream<T>(
    callback: (response: Response) => Promise<T>,
    method: HttpMethod,
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<T> {
    options = { ...this.authSession.settings, ...options };
    const authenticator = (init: any) => {
      return this.authSession.authenticate(init);
    };
    path = this.makePath(path, options, authenticator);
    return this.authSession.transport.stream<T>(
      callback,
      method,
      path,
      queryParams,
      body,
      (init: any) => {
        return this.authSession.authenticate(init);
      },
      options
    );
  }

  // // dynamically evaluate a template string
  // macro(template: string, vars: any) {
  //   // replace {foo} from spec path with ${foo} for template string
  //   template = template.replace(/{/gi, '${')
  //   return new Function('return `+ template +`;').call(vars)
  // }
  //
  // pathify(path: string, pathParams?: any) {
  //   if (!pathParams) return path
  //   if (path.indexOf('{') < 0) return path
  //   return this.macro(path, pathParams)
  // }

  /** Make a GET request */
  async get<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'GET',
      path,
      queryParams,
      body,
      options
    );
  }

  /** Make a HEAD request */
  async head<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'HEAD',
      path,
      queryParams,
      body,
      options
    );
  }

  /** Make a DELETE request */
  async delete<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'DELETE',
      path,
      queryParams,
      body,
      options
    );
  }

  /** Make a POST request */
  async post<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'POST',
      path,
      queryParams,
      body,
      options
    );
  }

  /** Make a PUT request */
  async put<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'PUT',
      path,
      queryParams,
      body,
      options
    );
  }

  /** Make a PATCH request */
  async patch<TSuccess, TError>(
    path: string,
    queryParams?: Values,
    body?: any,
    options?: Partial<ITransportSettings>
  ): Promise<SDKResponse<TSuccess, TError>> {
    return this.authRequest<TSuccess, TError>(
      'PATCH',
      path,
      queryParams,
      body,
      options
    );
  }
}
