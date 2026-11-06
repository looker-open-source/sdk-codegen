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
import React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { screen } from '@testing-library/react';
import {
  registerTestEnvAdaptor,
  unregisterEnvAdaptor,
} from '@looker/extension-utils';

import { api } from '../../test-data';
import { renderWithRouter } from '../../test-utils';
import { ErrorDetailScene } from './ErrorDetailScene';

const LocationEcho = () => {
  const location = useLocation();
  return (
    <div data-testid="dest">{`${location.pathname}${location.search}`}</div>
  );
};

describe('ErrorDetailScene', () => {
  beforeAll(() => {
    registerTestEnvAdaptor();
  });

  afterAll(() => {
    unregisterEnvAdaptor();
  });

  test('resolves wildcard method route and preserves valid 3-digit status code', () => {
    renderWithRouter(
      <Switch>
        <Route path="/:specKey/err/:statusCode/:verb/*">
          <ErrorDetailScene api={api} />
        </Route>
        <Route path="*">
          <LocationEcho />
        </Route>
      </Switch>,
      ['/4.0/err/404/post/login']
    );
    expect(screen.getByTestId('dest')).toHaveTextContent(
      /^\/4\.0\/methods\/ApiAuth\/login\?e=404$/
    );
  });

  test('omits error query param when statusCode is not a 3-digit code', () => {
    renderWithRouter(
      <Switch>
        <Route path="/:specKey/err/:statusCode/:verb/*">
          <ErrorDetailScene api={api} />
        </Route>
        <Route path="*">
          <LocationEcho />
        </Route>
      </Switch>,
      ['/4.0/err/404%3Cb%3E/post/login']
    );
    expect(screen.getByTestId('dest')).toHaveTextContent(
      /^\/4\.0\/methods\/ApiAuth\/login$/
    );
  });
});
