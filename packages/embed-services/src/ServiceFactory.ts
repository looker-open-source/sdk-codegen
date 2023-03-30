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

export interface IService {}

export type ServiceCreatorFunc = (sdk: IAPIMethods) => IService

export interface IServiceFactory {
  get(serviceName: string): IService | undefined
  register(serviceName: string, serviceCreator: ServiceCreatorFunc): void
}

class ServiceFactory implements IServiceFactory {
  servicesMap: Record<string, IService> = {}
  constructor(private sdk: IAPIMethods) {}

  get(serviceName: string) {
    const service = this.servicesMap[serviceName]
    if (!service) {
      throw new Error(`Service ${serviceName} not found`)
    }
    return service
  }

  register(serviceName: string, serviceCreator: ServiceCreatorFunc) {
    let service: IService = this.servicesMap[serviceName]
    if (!service) {
      service = serviceCreator(this.sdk)
      this.servicesMap[serviceName] = service
    }
    return service
  }
}

let factory: IServiceFactory

export function createFactory(sdk: IAPIMethods) {
  factory = new ServiceFactory(sdk)
}

export function getFactory() {
  if (!factory) {
    throw new Error('Factory must be created with an SDK.')
  }
  return factory
}
