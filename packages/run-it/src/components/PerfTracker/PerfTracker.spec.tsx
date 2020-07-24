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

import { screen } from '@testing-library/react'
import { renderWithTheme } from '@looker/components-test-utils'
import React from 'react'
import { PerfTracker } from './PerfTracker'
import { IResourceLoadTimes, LoadTimes, PerfTimings } from './perfUtils'

const mockEntries: IResourceLoadTimes[] = [
  new LoadTimes({
    name: 'one',
    duration: 50,
    redirectStart: 1,
    redirectEnd: 2,
    domainLookupStart: 3,
    domainLookupEnd: 4,
    connectStart: 5,
    connectEnd: 6,
    secureConnectionStart: 7,
    responseStart: 8,
    responseEnd: 9,
    fetchStart: 10,
    requestStart: 11,
    startTime: 12,
  } as PerformanceResourceTiming),
  new LoadTimes({
    name: 'two',
    duration: 100,
    redirectStart: 21,
    redirectEnd: 22,
    domainLookupStart: 23,
    domainLookupEnd: 24,
    connectStart: 25,
    connectEnd: 26,
    secureConnectionStart: 27,
    responseStart: 28,
    responseEnd: 29,
    fetchStart: 30,
    requestStart: 31,
    startTime: 32,
  } as PerformanceResourceTiming),
]

describe('PerfTracker', () => {
  test('it initializes to no data', () => {
    renderWithTheme(<PerfTracker />)
    expect(
      screen.getByText('No performance data is loaded')
    ).toBeInTheDocument()
  })
  test.skip('it displays items', () => {
    jest.spyOn(PerfTimings.prototype, 'entries').mockReturnValue(mockEntries)
    renderWithTheme(<PerfTracker />)
    screen.debug()
  })
})
