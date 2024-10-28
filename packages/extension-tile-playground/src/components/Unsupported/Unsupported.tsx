/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import { Box, Flex } from '@looker/components';
import styled from 'styled-components';
import type { MountPoint } from '@looker/extension-sdk';
import { UnsupportedGraphic } from './components/UnsupportedGraphic';

export const Unsupported: React.FC<{ mountPoint?: MountPoint }> = ({
  mountPoint,
}) => (
  <OuterFlex>
    <UnsupportedGraphic altText="This component must be mounted in a dashboard!" />
    <HeaderText>Unsupported mount point</HeaderText>
    <Box width={520}>
      <ActionMessage>
        This extension does not support the {mountPoint || 'standalone'} mount
        point!
      </ActionMessage>
    </Box>
  </OuterFlex>
);

const OuterFlex = styled(Flex)`
  width: 100%;
  margin-top: ${props => props.theme.space.xxxxlarge};
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const HeaderText = styled.h1`
  margin-top: ${props => props.theme.space.large};
  text-align: center;
  font-family: ${props => props.theme.fonts.brand};
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.xxxxlarge};
  color: ${props => props.theme.colors.text5};
`;

const ActionMessage = styled.h3`
  margin-top: ${props => props.theme.space.small};
  text-align: center;
  font-family: ${props => props.theme.fonts.brand};
  font-weight: ${props => props.theme.fontWeights.normal};
  font-size: ${props => props.theme.fontSizes.large};
  color: ${props => props.theme.colors.text3};
`;
