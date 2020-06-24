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
import React, { FC } from 'react'
import { IMethod } from '@looker/sdk-codegen'
import { Badge, Code, Flex, SpaceVertical, Text } from '@looker/components'
import { HttpMethod } from '@looker/sdk/src'
import styled from 'styled-components'
import { DocPseudo } from '../../../components'

interface DocOperationProps {
  method: IMethod
}

function getMethodColor(method: HttpMethod) {
  switch (method) {
    case 'DELETE':
      return 'critical'
    case 'GET':
      return 'inform'
    case 'HEAD':
      return 'neutral'
    case 'PATCH':
      return 'warn'
    case 'POST':
      return 'positive'
    case 'PUT':
      return 'key'
    case 'TRACE':
      return 'warn'
  }
}
const StyledBadge = styled(Badge)`
  border-radius: 4px;
  padding-top: ${({ theme }) => theme.space.xxsmall};
  padding-bottom: ${({ theme }) => theme.space.xxsmall};
`

const StyledEndpointLabel = styled(Text)``
StyledEndpointLabel.defaultProps = {
  fontSize: 'xsmall',
  fontWeight: 'semiBold',
  mr: 'xxsmall',
  textTransform: 'uppercase',
}

export const DocOperation: FC<DocOperationProps> = ({ method }) => (
  <SpaceVertical mb="xlarge" gap="xsmall">
    <div>
      <StyledBadge intent={getMethodColor(method.httpMethod)}>
        <Flex alignItems="center">
          <StyledEndpointLabel>SDK:</StyledEndpointLabel>
          <DocPseudo method={method} />
        </Flex>
      </StyledBadge>
    </div>
    <div>
      <StyledBadge intent={getMethodColor(method.httpMethod)}>
        <Flex alignItems="center">
          <StyledEndpointLabel>{method.httpMethod}:</StyledEndpointLabel>
          <Code fontSize="small" fontWeight="normal">
            {method.endpoint}
          </Code>
        </Flex>
      </StyledBadge>
    </div>
  </SpaceVertical>
)
