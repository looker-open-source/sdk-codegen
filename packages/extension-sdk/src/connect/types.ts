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

import type { ChattyHostConnection } from '@looker/chatty';
import type {
  RawVisualizationData,
  VisualizationDataReceivedCallback,
  VisualizationSDK,
} from './visualization';
import type {
  TileHostData,
  TileHostDataChangedCallback,
  TileSDK,
} from './tile';

/**
 * Extension event used for chatty communication
 */
export enum ExtensionEvent {
  /**
   * Notification from host to client
   */
  EXTENSION_HOST_NOTIFICATION = 'EXTENSION_NOTIFICATION',
  /**
   * Process request from client.
   */
  EXTENSION_API_REQUEST = 'EXTENSION_API_REQUEST',
}

/**
 * Request types used by the underlying API. The ENTENSION_API_REQUEST delegates
 * work based upon the request type
 */
export enum ExtensionRequestType {
  /**
   * Context data request
   */
  CONTEXT_DATA = 'CONTEXT_DATA',
  /**
   * Verify that the host exists and is working correctly. Host is the Looker window
   * instance that owns the client IFRAME.
   */
  VERIFY_HOST = 'VERIFY_HOST',
  /**
   * Execute a call on the Looker CORE SDK
   */
  INVOKE_CORE_SDK = 'INVOKE_CORE_SDK',
  /**
   * Execute a raw request on the Looker CORE SDK
   */
  RAW_INVOKE_CORE_SDK = 'RAW_INVOKE_CORE_SDK',
  /**
   * Update title
   */
  UPDATE_TITLE = 'UPDATE_TITLE',
  /**
   * Update location
   */
  UPDATE_LOCATION = 'UPDATE_LOCATION',
  /**
   * Location route changed
   */
  ROUTE_CHANGED = 'ROUTE_CHANGED',
  /**
   * Close popovers in the looker host
   */
  CLOSE_HOST_POPOVERS = 'CLOSE_HOST_POPOVERS',
  /**
   * Clipboard request
   */
  CLIPBOARD = 'CLIPBOARD',
  /**
   * Local storage request
   */
  LOCAL_STORAGE = 'LOCAL_STORAGE',
  /**
   * Read user attribute action
   */
  USER_ATTRIBUTE = 'USER_ATTRIBUTE',
  /**
   * Track action
   */
  TRACK_ACTION = 'TRACK_ACTION',
  /**
   * Error event
   */
  ERROR_EVENT = 'ERROR_EVENT',
  /**
   * Invoke external API
   */
  INVOKE_EXTERNAL_API = 'INVOKE_EXTERNAL_API',
  /**
   * Extension unloaded
   */
  EXTENSION_UNLOADED = 'EXTENSION_UNLOADED',
  /**
   * Log out of Looker from /spartan extension
   *
   * Only works from within the /spartan context. It will not work for
   * extensions running under /extensions
   */
  SPARTAN_LOGOUT = 'SPARTAN_LOGOUT',
  /**
   * Extension rendered
   */
  RENDERED = 'RENDERED',
  /**
   * Set up the visConfig options that should be present in an explore
   */
  VIS_DEFAULT_CONFIG = 'VIS_DEFAULT_CONFIG',
  /**
   * Change visualization configuration after intial load
   */
  VIS_CONFIG_UPDATE = 'VIS_CONFIG_UPDATE',
  /**
   * Tile add error messages
   */
  TILE_ADD_ERRORS = 'TILE_ADD_ERRORS',
  /**
   * Tile clear error messages
   */
  TILE_CLEAR_ERRORS = 'TILE_CLEAR_ERRORS',
  /**
   * Tile open drill menu
   */
  TILE_OPEN_DRILL_MENU = 'TILE_OPEN_DRILL_MENU',
  /**
   * Tile toggle cross filter
   */
  TILE_TOGGLE_CROSS_FILTER = 'TILE_TOGGLE_CROSS_FILTER',
  /**
   * Tile update row limit
   */
  TILE_ROW_LIMIT_UPDATE = 'TILE_ROW_LIMIT_UPDATE',
  /**
   * Tile run dashboard. Indicates that the dashboard queries should be run.
   */
  TILE_RUN_DASHBOARD = 'TILE_RUN_DASHBOARD',
  /**
   * Tile stop dashboard. Indicates to a dashboard that a queries should be stopped
   */
  TILE_STOP_DASHBOARD = 'TILE_STOP_DASHBOARD',
  /**
   * Tile update filters. Update the filters of the dashboard.
   */
  TILE_UPDATE_FILTERS = 'TILE_UPDATE_FILTERS',
  /**
   * Open schedule dialog.
   */
  TILE_OPEN_SCHEDULE_DIALOG = 'TILE_OPEN_SCHEDULE_DIALOG',
}

/**
 * The message that is associated with the Chatty EXTENSION_API_REQUEST event
 */
export interface ExtensionRequest {
  /**
   * Extension request type
   */
  type: ExtensionRequestType;
  /**
   * Optional payload associated with extension request type
   */
  payload?: InvokeCoreSdkRequest | undefined;
}

export enum ApiVersion {
  sdk40 = '4.0',
}

export interface InvokeCoreSdkRequest {
  apiMethodName?: string;
  httpMethod?: string;
  path?: string;
  body?: any;
  params?: any;
  options?: any;
  apiVersion?: ApiVersion;
}

export interface UpdateTitleRequest {
  title: string;
}

export interface UpdateLocationRequest {
  url: string;
  state?: any;
}

export interface ExtensionHostApi extends ExtensionSDK {
  isDashboardMountSupported: boolean;
  handleNotification(
    message: ExtensionNotification
  ): ExtensionInitializationResponse | undefined;
  invokeCoreSdk(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    authenticator?: any,
    options?: any,
    apiVersion?: ApiVersion
  ): Promise<any>;
  invokeCoreSdkRaw(
    httpMethod: string,
    path: string,
    body?: any,
    params?: any,
    apiVersion?: ApiVersion
  ): Promise<any>;
  unloaded(): void;
}

export interface ExtensionClientApi {
  handleRequest(message: ExtensionRequest): any | void;
}

export interface ContextDataRequest {
  type: 'save' | 'refresh';
  contextData?: string;
}

export interface RouteChangeRequest {
  route: string;
}

export interface ClipboardRequest {
  type: 'write';
  value: string;
}

export interface LocalStorageRequest {
  type: 'get' | 'set' | 'remove';
  name: string;
  value?: string;
}

export interface TrackActionRequest {
  name: string;
  trackAction: string;
  attributes?: Record<string, any>;
}

export interface ErrorEventRequest {
  errorEvent: ErrorEvent;
}

export enum FetchResponseBodyType {
  json = 'json',
  text = 'text',
}

export interface FetchDataRequest {
  resource: string;
  init?: Extract<RequestInit, 'method' | 'headers' | 'body' | 'credentials'>;
  responseBodyType?: FetchResponseBodyType;
}

/**
 * Notification type
 */
export enum ExtensionNotificationType {
  /**
   * Route change message sent when the route changes in the host
   * (browser forward or back buttons)
   */
  ROUTE_CHANGED = 'ROUTE_CHANGED',
  /**
   * Initialize message sent when chatty host and client have established
   * communication
   */
  INITIALIZE = 'INITIALIZE',
  /**
   * Visualization data
   */
  VISUALIZATION_DATA = 'VISUALIZATION_DATA',
  /**
   * Tile host data changed
   */
  TILE_HOST_DATA = 'TILE_HOST_DATA',
}

/**
 * Extension initialize message. Will be received once
 * when the extension is first instantiated
 */
export interface ExtensionInitializeMessage {
  type: ExtensionNotificationType.INITIALIZE;
  payload: LookerHostData;
}

/**
 * Route changed message. Received when the host route changes.
 * This happens when the user clicks the browser backward or
 * forward button.
 */
export interface ExtensionRouteChangedMessage {
  type: ExtensionNotificationType.ROUTE_CHANGED;
  payload: RouteChangeData;
}

/**
 * Visualization data. Only received by extensions visualizations.
 * <code>Looker >=22.8</code>
 */
export interface ExtensionVisualizationDataMessage {
  type: ExtensionNotificationType.VISUALIZATION_DATA;
  payload: RawVisualizationData;
}

/**
 * Tile Host Data Changed notificaction
 * <code>Looker >=22.8</code>
 */
export interface TileHostDataChangedMessage {
  type: ExtensionNotificationType.TILE_HOST_DATA;
  payload: Partial<TileHostData>;
}

/**
 * Extension notification
 */
export type ExtensionNotification =
  | ExtensionInitializeMessage
  | ExtensionRouteChangedMessage
  | ExtensionVisualizationDataMessage
  | TileHostDataChangedMessage;

/**
 * Route change data
 */
export interface RouteChangeData {
  /**
   * Changed route for the extension
   */
  route?: string;
  /**
   * Changed route state
   */
  routeState?: any;
}

/**
 * Looker host type.
 * standard - Standard Looker host with the navigation bar.
 * embed - Embedded Looker host.
 * spartan - Spartan Looker host.
 */
export type HostType = 'standard' | 'embed' | 'spartan';

/**
 * Extension mount type.
 * Fullscreen mount.
 * @deprecated <code>Looker >=22.8</code>. Use MountPoint (fullscreen is equivalent of standalone)
 */
export type MountType = 'fullscreen' | undefined;

/**
 * Extension mount point
 * <code>Looker >=22.8</code>
 */
export enum MountPoint {
  standalone = 'standalone',
  dashboardVisualization = 'dashboard-visualization',
  dashboardTile = 'dashboard-tile',
  dashboardTilePopup = 'dashboard-tile-popup',
}

/**
 * Initialization data. Looker host data.
 */
export interface LookerHostData {
  /**
   * Extension id
   */
  extensionId: string;
  /**
   * Version of looker
   */
  lookerVersion: string;
  /**
   * Initial route for the extension
   */
  route?: string;
  /**
   * route state
   */
  routeState?: any;
  /**
   * Origin of Looker host
   * @deprecated
   */
  hostUrl?: string;
  /**
   * Origin of Looker host
   * <code>Looker >=21.8</code>
   */
  hostOrigin?: string;
  /**
   * Looker host type (standard, embed, spartan)
   * <code>Looker >=21.8</code>
   */
  hostType?: HostType;
  /**
   * Extension mount type.
   * <code>Looker >=21.8</code>
   */
  mountType?: MountType;
  /**
   * Extension mount point.
   * <code>Looker >=22.8</code>
   */
  mountPoint: MountPoint;
  /**
   * Extension context data
   */
  contextData?: string;
  /**
   * The extension is rendering to a PDF or image.
   * <code>Looker >=22.8</code>
   */
  isRendering?: boolean;
  /**
   * When true the dashboard tile has been enabled.
   * <code>Looker >=22.8</code>
   */
  extensionDashboardTileEnabled: boolean;
}

/**
 * Response returned from initialization
 */
export interface ExtensionInitializationResponse {
  /**
   * Version of the SDK
   */
  extensionSdkVersion: string;
  /**
   * initialization error message
   */
  errorMessage?: string;
}

/**
 * Extension host configuration
 */
export interface ExtensionHostConfiguration {
  /**
   * Callback once extension initialized
   * @param errorMessage details of any errors that have
   *  occured during initialization
   */
  initializedCallback?: (errorMessage?: string) => void;
  /**
   * Callback to set the initial route to be restored. Ignored if
   * route tracking off
   */
  setInitialRoute?: (route: string, routeState?: any) => void;
  /**
   * Required looker version. An error will be thrown if the host
   * Looker is not at the version specified.
   */
  requiredLookerVersion?: string;
  /**
   * Callback to notify extension that host has changed the route.
   * The host changes the route when browser back or forward button
   * pressed.
   */
  hostChangedRoute?: (route: string, routeState?: any) => void;
  /**
   * Timeout for messages sent via chatty. Defaults to 30000 milliseconds.
   * Set to -1 for no timeout.
   */
  chattyTimeout?: number;
  /**
   * Callback called when visualization data received
   */
  visualizationDataReceivedCallback?: VisualizationDataReceivedCallback;

  /**
   * Callback called when the host is updated
   */
  tileHostDataChangedCallback?: TileHostDataChangedCallback;
}

export interface ExtensionHostApiConfiguration
  extends ExtensionHostConfiguration {
  chattyHost: ChattyHostConnection;
}

/**
 * Custom parameters for fetch proxy
 */
export interface FetchCustomParameters {
  /**
   * Http method
   */
  method?: 'POST' | 'GET' | 'DELETE' | 'PATCH' | 'PUT' | 'HEAD';
  /**
   * Request headers
   */
  headers?: Record<string, string>;
  /**
   * Request body
   */
  body?: string;
  /**
   * Credentials. Controls how cookies are sent to the external API server.
   * For external APIs this should be set to include if cookies suppor is
   * credentials are or omitted or the init object is omitted, the credentials
   * desired.
   */
  credentials?: 'omit' | 'same-origin' | 'include';
}

/**
 * Fetch proxy response
 */
export interface FetchProxyDataResponse {
  /**
   * true if status in the 200 range
   */
  ok: boolean;
  /**
   * http response status
   */
  status: number;
  /**
   * description of the status
   */
  statusText?: string;
  /**
   * response headers
   */
  headers: Record<string, string>;
  /**
   * response body
   */
  body?: any;
}

/**
 * Fetch proxy instance. A fetch proxy can be created with a base URL and prepopulated
 * init and response body type. This allows init header setup to be centralized rather
 * than duplicating code for each fetch proxy call
 */
export interface FetchProxy {
  /**
   * External API proxy to the browser fetch API. Merges arguments with arguments specified
   * when the fetch proxy was created. The arguments in the call override the arguments specified
   * when the proxy was created.
   * @param resource url to call. will be concatenated to base URL is base URL was specified.
   * @param init. object containing custom parameters for fetch. Will be merged with init
   *        object defined when the proxy was created.
   * @param responseBodyType indicates how to handle the response body. Overrides responseBodyType
   *        specifed when proxy created.
   */
  fetchProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ): Promise<FetchProxyDataResponse>;
}

/**
 * Public extension SDK
 */
export interface ExtensionSDK {
  /**
   * Looker host data
   */
  lookerHostData?: Readonly<LookerHostData>;

  /**
   * Create a tag that the Looker server will recognize as a
   * secret key to evaluated and replaced. The tag is name spaced
   * to the extension.
   * @param keyName for which a tag is required
   */
  createSecretKeyTag(keyName: string): string;

  /**
   * Verify that looker host is available
   */
  verifyHostConnection(): Promise<boolean>;

  /**
   * Update window title (if allowed)
   * @param title new window title
   */
  updateTitle(title: string): void;

  /**
   * Update location of current window (if allowed). Navigating to
   * a new host is NOT allowed
   * @param url - new url - should begin with '/'
   * @param state push state
   * @param target when set opens new browser window. Use
   *        openBrowserWindow instead.
   */
  updateLocation(url: string, state?: any, target?: string): void;

  /**
   * Open new browser window with URL
   * @param url for window
   * @param target name of window. Defaults to _blank
   */
  openBrowserWindow(url: string, target?: string): void;

  /**
   * Close currently opened popovers (menus for example)
   */
  closeHostPopovers(): void;

  /**
   * Store an item in local storage. Note that local storage is name
   * spaced to the extension. It is not necessary to include the extension
   * name in the name of the item.
   * @param name of item
   * @param value to store in local storage
   */
  localStorageSetItem(name: string, value?: string): Promise<boolean>;

  /**
   * Get an item from local storage. Note that local storage is name
   * spaced to the extension. It is not necessary to include the extension
   * name in the name of the item.
   * @param name of item
   */
  localStorageRemoveItem(name: string): Promise<boolean>;

  /**
   * Remove an item from local storage. Note that local storage is name
   * spaced to the extension. It is not necessary to include the extension
   * name in the name of the item.
   * @param name of item
   */
  localStorageGetItem(name: string): Promise<string | null>;

  /**
   * Write string to clipboard.
   * @param value to write to clipboard.
   */
  clipboardWrite(value: string): Promise<void>;

  /**
   * Set a user attribute value.
   * @param name of item
   * @param value to store in local storage
   */
  userAttributeSetItem(name: string, value?: string): Promise<boolean>;
  /**
   * Get a user attribute value.
   * @param name of item
   */
  userAttributeGetItem(name: string): Promise<string | null>;
  /**
   * Reset a user attribute value to the default
   * @param name of item
   */
  userAttributeResetItem(name: string): Promise<void>;
  /**
   * Track some kind of action.
   * @param name of action
   * @param trackAction of action
   * @param attributes associated with action
   */
  track(
    name: string,
    trackAction: string,
    attributes?: Record<string, any>
  ): void;

  /**
   * Error event details. Report error details to the Looker host
   * Notes:
   * 1. Because crossorigin is not set on the script tag that loads the extension
   *    details of the error cannot be determined.
   * 2. In development mode (at least if react is being used), an error will
   *    be recorded twice. This is because react reports the failure to get
   *    details of the error as an error.
   */
  error(errorEvent: ErrorEvent): void;

  /**
   * Notify host that client route has changed
   * @param route
   * @param routeState state of route
   */
  clientRouteChanged(route: string, routeState?: any): void;

  /**
   * Get the context associated with the extension. The context can be of any
   * JSON serializable type.
   *
   * Note that a separate copy of the context will be returned each time getContext
   * is called so an update to context object will not be reflected in subsequent
   * calls UNLESS saveContext is called.
   */
  getContextData(): any;

  /**
   * Save the context data in the Looker server and return a copy of the context data.
   * Subsequent calls to getContext will return the updated context data.
   *
   * Note that context data is shared amongst all users of the extension regardless of
   * role (in otherwords context does not support permissions). Care should be taken when
   * updating context data as the last write wins and extensions generally read the context data
   * once on extension load (see refreshContext for exception). The context should only be used
   * for data that rarely changes.
   *
   * @param contextData to save
   * @return current context data
   */
  saveContextData(contextData: any): Promise<any>;

  /**
   * Get the lastest version of context data from the Looker server.
   *
   * Should another user update the context data this method can be used to get the lastest data
   * without reloading the extension. Note that there is not a mechanism to indicate
   * that the context data has been modified.
   */
  refreshContextData(): Promise<any>;

  /**
   * Create a fetch proxy instance. Allows set up init parameter to be centalized into one place
   * @param baseUrl root URL to call. The resource on the fetch call will be appended to the baseUrl
   * @param init. object containing custom parameters for fetch.
   * @param responseBodyType indicates how to handle the response body. If omitted an attempt will be made
   *                         to determine how to handle the response body based upon the content type of the
   *                         response. Ultimately it defaults to a text response.
   * @return current context data
   */
  createFetchProxy(
    baseUrl?: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ): FetchProxy;

  /**
   * External API proxy to the browser fetch API.
   * Do not attempt to call internal Looker APIs. Any attempt to do so will be rejected.
   * Protocol MUST be https.
   * Entitlements must be defined for the extension in the manifest application in order to use this feature.
   * At a minimum, the domain and top level domain must be specified in the entitlements.
   * @param resource url to call
   * @param init. object containing custom parameters for fetch.
   * @param responseBodyType indicates how to handle the response body. If omitted an attempt will be made
   *                         to determine how to handle the response body based upon the content type of the
   *                         response. Ultimately it defaults to a text response.
   */
  fetchProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ): Promise<FetchProxyDataResponse>;

  /**
   * External API server proxy. Similar to fetch proxy except that external API calls are made
   * through the Looker instance. This allows the request to be embedded with secret keys stored
   * in the Looker server. This method should only be used for secret key/token exchange calls
   * as it adds additional overhead to the external API (network and competing for resources on
   * the Looker server). Note that there is no server proxy equivalent to createFetchProxy.
   * Entitlements must be defined for the extension in the manifest application in order to use this feature.
   * At a minimum, the domain and top level domain must be specified in the entitlements.
   * The Looker server will examine the request URL, headers amd body for handlebar ({{ KEY_NAME }}) expressions.
   * If found, the expression will be substituted with key values obtained from user attributes where the user
   * attribute is a combination of EXTENSION_ID::KEY_NAME.
   * @param resource url to call
   * @param init. object containing custom parameters for server call.
   * @param responseBodyType indicates how to handle the response body. If omitted an attempt will be made
   *                         to determine how to handle the response body based upon the content type of the
   *                         response. Ultimately it defaults to a text response.
   */
  serverProxy(
    resource: string,
    init?: FetchCustomParameters,
    responseBodyType?: FetchResponseBodyType
  ): Promise<FetchProxyDataResponse>;

  /**
   * Oauth2 authentication. Authentication relies on a new window being
   * created and a form being submitted. The authParameters become inputs
   * to the form submission.
   * @param authEndpoint endpoint responsible for the authentication.
   *                     An oauth2 url entitlement MUST be defined for
   *                     the end point.
   * @param authParameters parameters to be included in the request.
   *         client_id MUST be included
   *         scope MUST be included
   *         redirect_uri MUST NOT be included - will be set by host
   *         response_type MUST NOT be included - will be set to 'token' by host
   *         state OPTIONAL - If omitted will be generated by host.
   *         code_challenge_method optional - set to 'S256' to use code challenge
   *         rather than secret key.
   * @param httpMethod used for submission. Defaults to 'POST'.
   * @deprecated
   */
  oauth2Authenticate(
    authEndpoint: string,
    authParameters: Record<string, string>,
    httpMethod?: string
  ): Promise<any>;

  /**
   * Oauth2 exchange code for token. This is actually a wrapper around
   * serverProxy or fetch with some specialized processing. If the code_challenge_method
   * was used in the oauth2Authenticate call then fetch is used otherwise serverProxy is
   * used. It is expected that this method is called immediately after oauth2Authenticate.
   * The state, redirect url and code verifier (code_challenge_method only)
   * are saved from the oauth2Authenticate call and included in the exchange
   * for token call.
   * Note, currently code_challenge_method and secret key usage are mutually exclusive.
   * @param authEndpoint endpoint responsible for the code exchange
   *                     An oauth2 url entitlement MUST be defined for
   *                     the end point.
   * @param authParameters parameters to be included in the request.
   *                       Note that state and redirect_uri parameters
   *                       will automatically be added to this object.
   *                       If code challenge is not being used a client secret tag
   *                       must be added to the request. The client
   *                       secret tag is generated using the createSecretKeyTag
   *                       method.
   *                       If code challenge is being used the code_verifier is added
   *                       to the message.
   * @deprecated
   */
  oauth2ExchangeCodeForToken(
    authEndpoint: string,
    authParameters: Record<string, string>
  ): Promise<any>;

  /**
   * Log user out of Looker. Only works when running under /spartan
   */
  spartanLogout(): void;

  /**
   * Indicate that an extension has been rendered.
   * <code>Looker >=22.8</code>
   */
  rendered(failureMessage?: string): void;

  /**
   * Visualization API.
   */
  visualizationSDK: VisualizationSDK;

  /**
   * Tile API.
   */
  tileSDK: TileSDK;

  /**
   * Returns true if dashboard mount is supported. There are two
   * checks involved:
   * 1. The extension mount point is configured correctly
   * 2. The Looker host system supports it.
   */
  isDashboardMountSupported: boolean;
}
