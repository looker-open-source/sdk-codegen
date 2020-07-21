/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

/**
 * Calculation of Load times for a resource performance entry
 */
export interface IResourceLoadTimes {
  entry: PerformanceEntry
  name: string
  duration: number
  redirect: number
  domainLookup: number
  connect: number
  secureConnection: number
  responseTime: number
  fetchUntilResponseEnd: number
  requestUntilResponseEnd: number
  startUntilResponseEnd: number
}

export class LoadTimes implements IResourceLoadTimes {
  redirect = 0
  domainLookup = 0
  connect = 0
  secureConnection = 0
  responseTime = 0
  fetchUntilResponseEnd = 0
  requestUntilResponseEnd = 0
  startUntilResponseEnd = 0

  constructor(public entry: PerformanceEntry) {
    if ('redirect' in entry) {
      // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
      // Either a `PerformanceResourceTiming` or `PerformanceTiming` instance
      const resource = entry as PerformanceResourceTiming
      this.redirect = resource.redirectEnd - resource.redirectStart
      this.domainLookup = resource.domainLookupEnd - resource.domainLookupStart
      this.connect = resource.connectEnd - resource.connectStart
      if (resource.secureConnectionStart > 0)
        this.secureConnection =
          resource.connectEnd - resource.secureConnectionStart
      this.responseTime = resource.responseEnd - resource.responseStart
      if (resource.fetchStart > 0)
        this.fetchUntilResponseEnd = resource.responseEnd - resource.fetchStart
      if (resource.requestStart > 0)
        this.requestUntilResponseEnd =
          resource.responseEnd - resource.requestStart
      if (resource.startTime > 0)
        this.startUntilResponseEnd = resource.responseEnd - resource.startTime
    }
  }

  get duration() {
    return this.entry.duration
  }

  get name() {
    return this.entry.name
  }
}

/**
 * Performance API utility class
 *
 * Defaults to "resource" types
 * */
export class PerfTimings {
  private _full = false
  private _bufferSize = 0
  supported: boolean
  constructor() {
    this.supported = performance !== undefined
    if (this.supported) {
      performance.onresourcetimingbufferfull = (_ev) => (this._full = true)
      // https://developer.mozilla.org/en-US/docs/Web/API/Performance/setResourceTimingBufferSize
      // says the buffer size should be at least 150, but I don't know if we need to set it
      // this.bufferSize = 50 // TODO what's the default bufferSize? Does it vary by browser?
    }
  }

  clear() {
    if (!this.supported) return false
    if (typeof performance.clearResourceTimings !== 'function')
      throw new Error('Clearing resource timings is not supported')
    performance.clearResourceTimings()
    this._full = this.entries().length === 0
    return this._full
  }

  entries(pattern = '.*', type = 'resource') {
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry
    if (this.supported) {
      const ex = new RegExp(pattern, 'i')
      return performance
        .getEntriesByType(type)
        .filter((p) => ex.test(p.name))
        .map((p) => new LoadTimes(p))
    }
    return []
  }

  get bufferSize() {
    return this._bufferSize
  }

  set bufferSize(value) {
    if (
      this.supported &&
      typeof performance.setResourceTimingBufferSize === 'function'
    ) {
      this._bufferSize = value
      performance.setResourceTimingBufferSize(value)
    }
  }

  get isFull() {
    return this._full
  }
}
