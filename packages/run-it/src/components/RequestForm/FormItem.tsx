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
import type { FC, ReactElement } from 'react';
import React from 'react';
import { Box, Label, Space } from '@looker/components';

interface FormItemProps {
  /** ID of input item for label */
  id: string;
  /** Optional label. Defaults to an empty string so spacing is preserved */
  label?: string | ReactElement;
  /** Nested react elements */
  children: ReactElement;
}

/**
 * basic input form layout component
 * @param id of input item
 * @param children embedded react elements
 * @param label optional label
 */
export const FormItem: FC<FormItemProps> = ({ id, children, label = ' ' }) => {
  const key = `space_${id}`;
  return (
    <Space id={key} key={key}>
      <Box key={`${key}_box`} width="120px" flexShrink={0}>
        <Label key={`${key}_label_for`} htmlFor={id}>
          {label}
        </Label>
      </Box>
      {children}
    </Space>
  );
};
