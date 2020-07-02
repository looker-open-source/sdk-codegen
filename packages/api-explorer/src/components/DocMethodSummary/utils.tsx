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
import React from 'react'
import { Icon, Status } from '@looker/components'

/**
 * Return a Status react element based on an endpoint's status
 * @param status Endpoint status
 */
export const pickStatus = (status: string) => {
  switch (status.toLocaleLowerCase()) {
    case 'beta':
      return <Status intent="warn" />
    case 'experimental':
      return <Icon name="Beaker" />
    case 'deprecated':
      return <Status intent="critical" />
    case 'stable':
      return <Status intent="positive" />
    default:
      return <Status intent="neutral" />
  }
}

/**
 * Returns tooltip content based on an endpoint's status
 * @param status Endpoint status
 */
export const pickTooltipContent = (status: string) => {
  switch (status.toLocaleLowerCase()) {
    case 'beta':
      return 'This beta endpoint is under development and subject to change.'
    case 'experimental':
      return 'This experimental endpoint is not fully developed and may be significantly changed or completely removed in future releases.'
    case 'deprecated':
      return 'This endpoint has been deprecated and will be removed in the future.'
    case 'stable':
      return 'This endpoint is considered stable for this API version.'
    default:
      return 'This endpoint has no status associated with it.'
  }
}
