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
import React from 'react';
import styled from 'styled-components';
import { Icon, Status } from '@looker/components';
import { Beaker } from '@looker/icons';
import { VisibilityOff } from '@styled-icons/material/VisibilityOff';

/**
 * Return a Status react element based on an endpoint's status
 * @param status Endpoint status
 */
export const pickStatus = (status: string) => {
  const title = `${status.toLowerCase()} item`;
  switch (status.toLowerCase()) {
    case 'beta':
      return <StatusBeta aria-label={title}>&beta;</StatusBeta>;
    case 'experimental': {
      return <Icon title={title} aria-label={title} icon={<Beaker />} />;
    }
    case 'alpha': {
      return <Icon title={title} aria-label={title} icon={<Beaker />} />;
    }
    case 'undocumented': {
      return <Icon title={title} aria-label={title} icon={<VisibilityOff />} />;
    }
    case 'deprecated':
      return <Status aria-label={title} intent="critical" size="small" />;
    case 'stable':
      return <Status aria-label={title} intent="positive" size="small" />;
    default:
      return (
        <Status
          aria-label="unknown status endpoint"
          intent="neutral"
          size="small"
        />
      );
  }
};

/**
 * Returns tooltip content based on status
 * @param status item status
 */
export const pickTooltipContent = (status: string) => {
  switch (status.toLowerCase()) {
    case 'alpha':
      return 'This alpha item is either for internal use, or not fully developed and may be significantly changed or completely removed in future releases.';
    case 'beta':
      return 'This beta item is under development and subject to change.';
    case 'experimental':
      return 'This experimental item is not fully developed and may be significantly changed or completely removed in future releases.';
    case 'deprecated':
      return 'This item has been deprecated and will be removed in the future.';
    case 'stable':
      return 'This item is considered stable for this API version.';
    case 'undocumented':
      return 'This is an internal-only item.';
    default:
      return 'This item has no status associated with it.';
  }
};

const StatusBeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xxsmall};
  color: ${({ theme }) => theme.colors.neutral};
  width: 1.125rem;
  height: 1.125rem;
`;
