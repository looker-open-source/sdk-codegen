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

import type { FC } from 'react';
import React from 'react';
import {
  Accordion2,
  Box2,
  Heading,
  Table,
  TableBody,
  useToggle,
} from '@looker/components';
import type { IHackerProps } from '../../../models';
import type { AgendaItems } from './agendaUtils';
import { AgendaRow } from './AgendaRow';
import { eraColor } from './agendaUtils';

/**
 * Capitalize first letter of each word
 * @param value to capitalize
 */
const enTitle = (value: string) => {
  return value.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

interface AgendaProps {
  era: string;
  agenda: AgendaItems;
  hacker: IHackerProps;
  defaultOpen?: boolean;
}

export const AgendaEra: FC<AgendaProps> = ({
  era,
  agenda,
  hacker,
  defaultOpen,
}) => {
  const { value, toggle } = useToggle(defaultOpen);
  if (agenda.length < 1) return null;
  const color = eraColor(era);
  return (
    <Accordion2
      indicatorPosition="left"
      isOpen={value}
      toggleOpen={toggle}
      label={
        <Box2
          px="u4"
          py="u3"
          bg={`${color}Accent`}
          borderRadius="medium"
          width="100%"
        >
          <Heading fontSize="xlarge" color={color} fontWeight="medium">
            {enTitle(era)}
          </Heading>
        </Box2>
      }
    >
      <Box2 pl="u6">
        <Table>
          <TableBody>
            {agenda &&
              agenda.map((item, index) => (
                <AgendaRow
                  key={`agenda${index}`}
                  item={item}
                  hacker={hacker}
                  color={color}
                />
              ))}
          </TableBody>
        </Table>
      </Box2>
    </Accordion2>
  );
};
