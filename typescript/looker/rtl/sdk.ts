import { BrowserTransport, BrowserTransportOptions } from './browser_transport'
import { APIMethods } from '../sdk/methods'

export function LookerBrowserSDK (options: BrowserTransportOptions): APIMethods {
  return new APIMethods(new BrowserTransport(options))
}
