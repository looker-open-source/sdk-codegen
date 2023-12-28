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
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { IdeFileManifest } from '@looker/icons';
import { Toc } from '@styled-icons/material/Toc';
import { Tag } from '@styled-icons/material-rounded/Tag';

import { api } from '../../test-data';
import { renderWithRouter } from '../../test-utils';
import { ExploreProperty, ExplorePropertyDetail, typeIcon } from '.';

describe('ExploreProperty', () => {
  const type = api.types.CreateDashboardFilter;

  describe('ExplorePropertyDetail', () => {
    describe('CreateDashboardFilter', () => {
      test('Shows read-only property and description', async () => {
        const property = type.properties.id;
        expect(property).toBeDefined();
        renderWithRouter(
          <ExplorePropertyDetail api={api} property={property} />
        );
        expect(property.deprecated).toEqual(false);
        expect(property.readOnly).toEqual(true);
        // eslint-disable-next-line jest-dom/prefer-required
        expect(property.required).toEqual(false);
        expect(screen.getByText(property.description)).toBeInTheDocument();
        await waitFor(() => {
          const statusIcon = screen.getByTitle('read-only property');
          fireEvent.mouseOver(statusIcon);
          expect(screen.getByRole('tooltip')).toHaveTextContent(
            'CreateDashboardFilter.id is read-only'
          );
        });
      });

      test('Shows required property and description', async () => {
        const property = type.properties.dashboard_id;
        expect(property).toBeDefined();
        renderWithRouter(
          <ExplorePropertyDetail api={api} property={property} />
        );
        expect(property.deprecated).toEqual(false);
        expect(property.readOnly).toEqual(false);
        // eslint-disable-next-line jest-dom/prefer-required
        expect(property.required).toEqual(true);
        expect(screen.getByText(property.description)).toBeInTheDocument();
        await waitFor(() => {
          const statusIcon = screen.getByTitle('required property');
          fireEvent.mouseOver(statusIcon);
          expect(screen.getByRole('tooltip')).toHaveTextContent(
            'CreateDashboardFilter.dashboard_id is required'
          );
        });
      });
    });
  });

  describe('property icons', () => {
    test('int64 property icon is correct', () => {
      const property = type.properties.row;
      expect(property.type.jsonName).toEqual('int64');
      renderWithRouter(<ExploreProperty api={api} property={property} />);
      expect(screen.getByTitle('int64')).toBeInTheDocument();
      const legend = typeIcon(property.type);
      expect(legend).toEqual({ icon: <Tag />, title: 'int64' });
    });

    test('array property icon is correct', () => {
      const property = type.properties.listens_to_filters;
      expect(property.type.jsonName).toEqual('string[]');
      renderWithRouter(<ExploreProperty api={api} property={property} />);
      expect(screen.getByTitle(property.type.jsonName)).toBeInTheDocument();
      const legend = typeIcon(property.type);
      expect(legend).toEqual({ icon: <Toc />, title: 'string[]' });
    });

    test('hash property icon is correct', () => {
      const property = type.properties.field;
      expect(property.type.jsonName).toEqual('Hash[any]');
      renderWithRouter(<ExploreProperty api={api} property={property} />);
      expect(screen.getByTitle(property.type.jsonName)).toBeInTheDocument();
      const legend = typeIcon(property.type);
      expect(legend).toEqual({ icon: <IdeFileManifest />, title: 'Hash[any]' });
    });
  });
});
