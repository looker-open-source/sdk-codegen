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

import type { ReactNode } from 'react';
import type {
  ExtensionHostApi,
  ExtensionSDK,
  RawVisualizationData,
  TileHostData,
  TileSDK,
  VisualizationSDK,
  LookerHostData,
} from '@looker/extension-sdk';

/**
 * Base extension context
 */
export interface BaseExtensionContextData {
  /**
   * Extension SDK.
   */
  extensionSDK: ExtensionSDK;
  /**
   * Looker host data
   */
  lookerHostData?: Readonly<LookerHostData>;
  /**
   * Error message will be set in an initialization error occurs.
   * @deprecated if an initialization error occurs the extension
   * component is no longer rendered. initializeError will ALWAYS
   * be undefined
   */
  initializeError?: string;
  /**
   * Current route
   */
  route: string;
  /**
   * Current route state
   */
  routeState?: any;
  /**
   * Visualization data.
   */
  visualizationData?: Readonly<RawVisualizationData>;
  /**
   * Visualization api.
   */
  visualizationSDK: VisualizationSDK;
  /**
   * Tile host data
   */
  tileHostData: Readonly<TileHostData>;
  /**
   * Tile api.
   */
  tileSDK: TileSDK;
}

export interface RouteData {
  route: string;
  routeState?: any;
}

export interface ExtensionProviderProps {
  /**
   * When true, a react router MemoryRouter will be created and changes to the
   * extension route will be propagated to the host. The host will then track
   * the clients route by appending it to the host route.
   * Note that this is only supported where the extension is mounted
   * in the main extension view. If the extension is mounted as a component of a
   * looker composite component (dashboard for example), hostTracksRoute will be
   * ignored.
   */
  hostTracksRoute?: boolean;
  /**
   * Pathname change callback. Use when extension components need to modify their
   * state based upon the current route.
   */
  onPathnameChange?: (pathname: string) => void;
  /**
   * Route change callback. Use when extension components need to modify their
   * state based upon the current route. Alternate to onPathname change and
   * provides more details
   */
  onRouteChange?: (route: string, routeState?: any) => void;
  /**
   * Loading component to display while the provider is
   * establishing communication with the Looker host
   */
  loadingComponent?: JSX.Element;
  /**
   * Required looker version. An error will be thrown if the host
   * Looker is not at the version specified.
   */
  requiredLookerVersion?: string;
  /**
   * Timeout for messages sent via chatty. Defaults to 30000 milliseconds.
   * Set to -1 for no timeout.
   */
  chattyTimeout?: number;
  /**
   * Children
   */
  children?: ReactNode;
}

export interface ExtensionConnectorProps extends ExtensionProviderProps {
  contextData: BaseExtensionContextData;
  connectedCallback: (extensionSDK: ExtensionHostApi) => void;
  updateContextData: (contextData: Partial<BaseExtensionContextData>) => void;
  unloadedCallback: () => void;
}
