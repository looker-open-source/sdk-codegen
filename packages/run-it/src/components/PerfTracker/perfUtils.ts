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

/**
 * Calculation of Load times for a resource performance entry
 */
export interface IResourceLoadTimes {
  entry: PerformanceEntry;
  name: string;
  duration: number;
  redirect: number;
  domainLookup: number;
  connect: number;
  secureConnection: number;
  responseTime: number;
  fetchUntilResponseEnd: number;
  requestUntilResponseEnd: number;
  startUntilResponseEnd: number;
  processStart: number;
  processEnd: number;
  processDuration: number;
}

/**
 * Rounds a number to 3 decimal places
 */
export const perfRound = (num: number) =>
  Math.round((num + Number.EPSILON) * 10000) / 10000;

/**
 * Round and scale (if needed) the difference in performance metrics
 * @param end of high precision timer metric
 * @param start of high precision timer metric
 * @returns rounded difference of end - start
 */
const diff = (end: number, start: number) => perfRound(end - start);

export class LoadTimes implements IResourceLoadTimes {
  duration = 0;
  redirect = 0;
  domainLookup = 0;
  connect = 0;
  secureConnection = 0;
  responseTime = 0;
  fetchUntilResponseEnd = 0;
  requestUntilResponseEnd = 0;
  startUntilResponseEnd = 0;
  processStart = 0;
  processEnd = 0;
  processDuration = 0;

  constructor(public entry: PerformanceEntry) {
    if ('redirectStart' in entry) {
      // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming
      // Either a `PerformanceResourceTiming` or `PerformanceTiming` instance
      const resource = entry as PerformanceResourceTiming;
      this.redirect = diff(resource.redirectEnd, resource.redirectStart);
      this.domainLookup = diff(
        resource.domainLookupEnd,
        resource.domainLookupStart
      );
      this.connect = diff(resource.connectEnd, resource.connectStart);
      if (resource.secureConnectionStart > 0)
        this.secureConnection = diff(
          resource.connectEnd,
          resource.secureConnectionStart
        );
      this.responseTime = diff(resource.responseEnd, resource.responseStart);
      if (resource.fetchStart > 0)
        this.fetchUntilResponseEnd = diff(
          resource.responseEnd,
          resource.fetchStart
        );
      if (resource.requestStart > 0)
        this.requestUntilResponseEnd = diff(
          resource.responseEnd,
          resource.requestStart
        );
      if (resource.startTime > 0)
        this.startUntilResponseEnd = diff(
          resource.responseEnd,
          resource.startTime
        );
      this.calcProcessTime();
    }
  }

  private calcProcessTime() {
    this.duration = this.entry.duration;
    if (performance.getEntriesByName !== undefined) {
      const entries = performance.getEntriesByName(
        `${this.name}-${this.entry.startTime}`,
        'measure'
      );
      if (entries.length > 0) {
        const measure = entries[entries.length - 1] as PerformanceMeasure;
        const resource = this.entry as PerformanceResourceTiming;
        this.processStart = resource.responseEnd;
        this.processEnd = resource.responseEnd + measure.duration;
        this.processDuration = measure.duration;
        this.duration += measure.duration;
      }
    }
  }

  get name() {
    return this.entry.name;
  }
}

/**
 * Performance API utility class
 *
 * Defaults to "resource" types
 * */
export class PerfTimings {
  private _full = false;
  private _bufferSize = 0;
  private static _supported: boolean | undefined = undefined;

  /** Are performance timings supported in this runtime? */
  public static get supported() {
    if (PerfTimings._supported === undefined) {
      // This gyration is necessary to avoid IDEA-based exceptions about performance being undefined,
      // which it may be, but this now throws up in IDEA
      try {
        PerfTimings._supported = performance !== undefined;
      } catch {
        PerfTimings._supported = false;
      }
    }
    return PerfTimings._supported;
  }

  public static set supported(value: boolean) {
    PerfTimings._supported = value;
  }

  constructor() {
    if (PerfTimings.supported) {
      performance.onresourcetimingbufferfull = (_ev) => (this._full = true);
      // https://developer.mozilla.org/en-US/docs/Web/API/Performance/setResourceTimingBufferSize
      // says the buffer size should be at least 150, but I don't know if we need to set it
      // this.bufferSize = 50 // TODO what's the default bufferSize? Does it vary by browser?
    }
  }

  clear() {
    if (!PerfTimings.supported) return false;
    if (performance.clearResourceTimings !== undefined)
      performance.clearResourceTimings();
    if (performance.clearMarks !== undefined) performance.clearMarks();
    if (performance.clearMeasures !== undefined) performance.clearMeasures();
    this._full = this.entries().length === 0;
    return this._full;
  }

  entries(pattern = '.*', type = 'resource') {
    // https://developer.mozilla.org/en-US/docs/Web/API/PerformanceEntry
    if (PerfTimings.supported) {
      const ex = new RegExp(pattern, 'i');
      return performance
        .getEntriesByType(type)
        .filter((p) => ex.test(p.name))
        .map((p) => new LoadTimes(p));
    }
    return [];
  }

  get bufferSize() {
    return this._bufferSize;
  }

  set bufferSize(value) {
    if (
      PerfTimings.supported &&
      typeof performance.setResourceTimingBufferSize !== undefined
    ) {
      this._bufferSize = value;
      performance.setResourceTimingBufferSize(value);
    }
  }

  get isFull() {
    return this._full;
  }
}
