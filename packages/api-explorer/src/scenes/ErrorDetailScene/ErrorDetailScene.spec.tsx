/*

 Copyright 2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

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
