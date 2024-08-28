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

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '@looker/components-test-utils';
import userEvent from '@testing-library/user-event';
import type { BaseSyntheticEvent } from 'react';

import type { RunItInput } from '../../RunIt';
import {
  BODY_HINT,
  createComplexItem,
  createSimpleItem,
  showDataChangeWarning,
  updateNullableProp,
  validateBody,
} from './formUtils';

describe('formUtils', () => {
  describe('Simple Items', () => {
    let requestContent = {};
    const handleChange = jest.fn();
    const handleNumberChange = jest.fn();
    const handleBoolChange = (e: BaseSyntheticEvent) => {
      requestContent = { ...requestContent, [e.target.name]: e.target.checked };
    };
    const handleDateChange = jest.fn();
    const initSimpleTestItem = (input: RunItInput) =>
      createSimpleItem(
        input,
        handleChange,
        handleNumberChange,
        handleBoolChange,
        handleDateChange,
        requestContent
      );

    afterEach(() => {
      handleNumberChange.mockClear();
      handleDateChange.mockClear();
      handleChange.mockClear();
    });

    describe('Boolean Items', () => {
      test('it creates a boolean item', () => {
        const name = 'Item name';
        const description = 'A simple item of type boolean';
        const BoolItem = initSimpleTestItem({
          name,
          location: 'query',
          type: 'boolean',
          required: true,
          description,
        });
        renderWithTheme(BoolItem);
        expect(screen.getByText(description)).toBeInTheDocument();
        const item = screen.getByRole('switch', { name });
        expect(item).not.toBeChecked();
      });

      test('a boolean items state changes when clicked', () => {
        const name = 'Item name';
        const description = 'A simple item of type boolean';
        const BoolItem = initSimpleTestItem({
          name,
          location: 'query',
          type: 'boolean',
          required: true,
          description,
        });
        renderWithTheme(BoolItem);

        const item = screen.getByRole('switch', { name });
        expect(item).not.toBeChecked();
        fireEvent.change(item, { target: { checked: true } });
        expect(item).toBeChecked();
      });
    });

    const expectInput = async (
      input: HTMLInputElement,
      value: any,
      handler: any
    ) => {
      await userEvent.type(input, value.toString());
      expect(handler).toHaveBeenCalled();
      expect(input).toHaveValue(value);
    };

    describe.each(['int64', 'integer', 'float', 'double'])(
      '%s input type',
      type => {
        const name = `Type ${type} item`;
        const description = `A simple item of type ${type}`;
        const NumberItem = initSimpleTestItem({
          name,
          location: 'query',
          type,
          required: true,
          description,
        });

        test('it creates a number item', () => {
          renderWithTheme(NumberItem);
          expect(
            screen.getByLabelText(name, { exact: false })
          ).toBeInTheDocument();
          const input = screen.getByRole('spinbutton', { name });
          expect(input).toHaveAttribute('name', name);
          expect(input).toHaveAttribute('type', 'number');
          expect(input).toHaveAttribute(
            'placeholder',
            `(number) ${description}`
          );
          expect(input).toBeRequired();
        });

        test.skip(`it takes ${type} input`, async () => {
          renderWithTheme(NumberItem);
          const input = screen.getByRole('spinbutton', {
            name,
          }) as HTMLInputElement;
          await expectInput(input, '123.456', handleNumberChange);
          // await userEvent.type(input, '123.456')
          // await waitFor(() => {
          //   expect(handleNumberChange).toHaveBeenCalled()
          //   expect(input).toHaveValue(123.456)
          // })
        });

        test('it does not allow non numeric inputs', async () => {
          renderWithTheme(NumberItem);
          const input = screen.getByRole('spinbutton', { name });
          await userEvent.type(input, 'not a number!');
          expect(input).not.toHaveValue('not a number!');
          expect(handleNumberChange).not.toHaveBeenCalled();
        });
      }
    );

    describe.each`
      inputType     | createdItemType
      ${'string'}   | ${'text'}
      ${'hostname'} | ${'text'}
      ${'uuid'}     | ${'text'}
      ${'uri'}      | ${'text'}
      ${'ipv4'}     | ${'text'}
      ${'ipv6'}     | ${'text'}
      ${'email'}    | ${'email'}
      ${'password'} | ${'password'}
    `('$inputType type input item', ({ inputType, createdItemType }) => {
      const name = `Type ${inputType} item`;
      const description = `A simple item of type ${inputType}`;
      const TextItem = initSimpleTestItem({
        name,
        location: 'path',
        type: inputType,
        required: false,
        description,
      });

      test(`it creates a ${createdItemType} item`, () => {
        renderWithTheme(TextItem);
        const input = screen.getByLabelText(name);
        expect(input).toHaveAttribute('name', name);
        expect(input).toHaveAttribute('type', createdItemType);
        expect(input).toHaveAttribute('placeholder', `(string) ${description}`);
        expect(input).not.toBeRequired();
      });

      test.skip(`it takes ${inputType} input`, async () => {
        renderWithTheme(TextItem);
        const input = screen.getByRole('textbox', { name });
        const text = 'Text123';
        await userEvent.type(input, text);
        expect(handleChange).toHaveBeenCalled();
        expect(input).toHaveValue(text);
      });
    });

    describe('Datetime item', () => {
      const DateItem = initSimpleTestItem({
        name: 'Type datetime item',
        location: 'path',
        type: 'datetime',
        required: false,
        description: 'A simple item of type datetime',
      });

      test('it creates a datetime item', async () => {
        renderWithTheme(DateItem);
        expect(screen.getByTestId('text-input')).toBeInTheDocument();
        expect(screen.getByText('Open calendar')).toBeInTheDocument();
      });
    });

    describe('updateNullableProp', () => {
      test.each`
        label             | value
        ${'empty string'} | ${''}
        ${'undefined'}    | ${undefined}
        ${'NaN'}          | ${NaN}
        ${'null'}         | ${null}
      `('it pops key from collection if updated with $label', ({ value }) => {
        const state = { foo: 'bar' };
        const actual = updateNullableProp(state, 'foo', value);
        /** State is not modified directly. */
        expect(state).toHaveProperty('foo');
        expect(actual).not.toHaveProperty('foo');
      });
    });
  });

  describe('Complex Item', () => {
    const handleComplexChange = jest.fn();

    test('it creates a complex item', async () => {
      const body = {
        query_id: 'string',
        fields: 'string[]',
        limit: 1,
      };
      const requestContent = { 'A complex item': {} };
      const ComplexItem = createComplexItem(
        {
          name: 'A complex item',
          location: 'body',
          type: body,
          required: true,
          description: 'A complex item with an object type',
        },
        handleComplexChange,
        requestContent
      );
      renderWithTheme(ComplexItem);
      expect(screen.getByText('A complex item')).toBeInTheDocument();
      await userEvent.hover(screen.getByTestId('body-param-tooltip'));
      await waitFor(() => {
        expect(screen.getByText(BODY_HINT)).toBeInTheDocument();
      });
    });

    describe('validateBody', () => {
      const requiredKeys = ['model', 'view'];
      test.each`
        value                                                      | expected                                                                           | requiredKeys
        ${{
  view: 'users',
  fields: ['users.id', 'users.first_name'],
}} | ${'Error: Required properties "model" must be provided in the body'} | ${requiredKeys}
        ${{
  model: 'thelook',
  view: 'users',
  fields: ['users.id', 'users.first_name'],
}} | ${''} | ${requiredKeys}
        ${'na.-_me=Vapor&age=3&luckyNumbers[]=5&luckyNumbers[]=7'} | ${''}                                                                              | ${[]}
        ${'name=Vapor&age=3&luckyNumbers[]=5&luckyNumbers[]7'}     | ${'Syntax error in the body: luckyNumbers[]7'}                                     | ${[]}
        ${'{'}                                                     | ${"Syntax error in the body: Expected property name or '}' in JSON at position 1"} | ${[]}
        ${'}'}                                                     | ${'Syntax error in the body: Unexpected token \'}\', "}" is not valid JSON'}       | ${[]}
        ${'['}                                                     | ${'Syntax error in the body: Unexpected end of JSON input'}                        | ${[]}
        ${'"'}                                                     | ${'Syntax error in the body: Unterminated string in JSON at position 1'}           | ${[]}
        ${'"foo"'}                                                 | ${''}                                                                              | ${[]}
        ${''}                                                      | ${''}                                                                              | ${[]}
        ${'{}'}                                                    | ${''}                                                                              | ${[]}
      `(
        'it validates a body value of "$value"',
        ({ value, expected, requiredKeys }) => {
          const actual = validateBody(value, requiredKeys);
          expect(actual).toEqual(expected);
        }
      );
    });
  });

  describe('createWarning', () => {
    test('it creates a required checkbox with a warning label', async () => {
      renderWithTheme(showDataChangeWarning());
      const warningCheckbox = screen.getByRole('checkbox');
      expect(warningCheckbox).toBeRequired();
      expect(
        screen.getByLabelText(
          'I understand that this API endpoint will change data.',
          { exact: false }
        )
      ).toBeInTheDocument();
      expect(warningCheckbox).not.toBeChecked();
      await userEvent.click(warningCheckbox);
      expect(warningCheckbox).toBeChecked();
    });
  });
});
