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
import type { FC, ReactElement } from 'react';
import React from 'react';
import { useToggle, Accordion2, Divider, Box2 } from '@looker/components';
import { ArrowRight, ArrowDropDown } from '@styled-icons/material';
import { ConfigHeading } from './ConfigHeading';

interface CollapserCardProps {
  id?: string;
  heading: string;
  children: ReactElement;
  defaultOpen?: boolean;
  divider?: boolean;
}

/**
 * Render a collapsable header and children
 */
export const CollapserCard: FC<CollapserCardProps> = ({
  id,
  heading,
  children,
  defaultOpen = true,
  divider = true,
}) => {
  const level = divider ? 'h3' : 'h4';
  const { value, toggle } = useToggle(defaultOpen);

  return (
    <Box2 display="flex" flexDirection="column">
      {divider && <Divider appearance="light" />}
      <Accordion2
        id={id}
        indicatorPosition="left"
        isOpen={value}
        toggleOpen={toggle}
        indicatorIcons={{ close: <ArrowRight />, open: <ArrowDropDown /> }}
        label={<ConfigHeading as={level}>{heading}</ConfigHeading>}
      >
        <Box2 pb="xlarge">{children}</Box2>
      </Accordion2>
    </Box2>
  );
};
