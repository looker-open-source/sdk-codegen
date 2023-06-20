/*

 MIT License

 Copyright (c) 2023 Looker Data Sciences, Inc.

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
import type { IAPIMethods } from '@looker/sdk-rtl'

export type ServiceCreatorFunc<T> = (sdk: IAPIMethods, timeToLive?: number) => T

export interface IServiceFactory {
  /**
   * Retrieves a service
   * @param serviceName to retrieve
   */
  get<T>(serviceName: string): T
  /**
   * Registers or creates a service
   * @param serviceName name of service.
   * @param serviceCreator function that creates the service.
   * @param timeToLive in seconds, for the service cache. Defaults to 15 minutes.
   */
  register<T>(
    serviceName: string,
    serviceCreator: ServiceCreatorFunc<T>,
    timeToLive?: number
  ): void
}

/**
 * A factory for registering and maintaining services
 */
class ServiceFactory implements IServiceFactory {
  servicesMap: Record<string, any> = {}
  constructor(private sdk: IAPIMethods) {}

  get<T>(serviceName: string): T {
    const service = this.servicesMap[serviceName]
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service
  }

  register<T>(
    serviceName: string,
    serviceCreator: ServiceCreatorFunc<T>,
    timeToLive?: number
  ) {
    let service = this.servicesMap[serviceName]
    if (!service) {
      service = serviceCreator(this.sdk, timeToLive)
      this.servicesMap[serviceName] = service
    }
    return service
  }
}

let factory: IServiceFactory | undefined

/**
 * Helper method for creating a singleton factory
 * @param sdk
 */
export function createFactory(sdk: IAPIMethods) {
  factory = new ServiceFactory(sdk)
}

/**
 * Helper method for getting the factory
 */
export function getFactory() {
  if (!factory) {
    throw new Error('Factory must be created with an SDK.')
  }
  return factory
}

/**
 * Helper method for destroying the factory
 */
export function destroyFactory() {
  factory = undefined
}
