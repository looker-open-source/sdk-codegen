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
import { Box, Flex } from '@looker/components';
import styled from 'styled-components';
import { SomethingWentWrongGraphic } from './components';

export interface SomethingWentWrongProps {
  header: string;
  actionMessage: string;
  altText?: string;
}

export const SomethingWentWrong: React.FC<SomethingWentWrongProps> = ({
  header,
  actionMessage,
  altText,
}) => (
  <OuterFlex>
    <SomethingWentWrongGraphic altText={altText} />
    <HeaderText>{header}</HeaderText>
    <Box width={520}>
      <ActionMessage>{actionMessage}</ActionMessage>
    </Box>
  </OuterFlex>
);

const OuterFlex = styled(Flex)`
  width: 100%;
  margin-top: ${(props) => props.theme.space.xxxxlarge};
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const HeaderText = styled.h1`
  margin-top: ${(props) => props.theme.space.large};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.brand};
  font-weight: ${(props) => props.theme.fontWeights.normal};
  font-size: ${(props) => props.theme.fontSizes.xxxxlarge};
  color: ${(props) => props.theme.colors.text5};
`;

const ActionMessage = styled.h3`
  margin-top: ${(props) => props.theme.space.small};
  text-align: center;
  font-family: ${(props) => props.theme.fonts.brand};
  font-weight: ${(props) => props.theme.fontWeights.normal};
  font-size: ${(props) => props.theme.fontSizes.large};
  color: ${(props) => props.theme.colors.text3};
`;
