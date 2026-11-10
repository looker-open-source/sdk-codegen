/*

 Copyright 2021-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import React from 'react';
import { screen } from '@testing-library/react';
import { createTestStore, renderWithReduxProvider } from '../../test-utils';

import { DocMarkdown } from './DocMarkdown';

describe('DocMarkdown', () => {
  test('it renders markdown', () => {
    renderWithReduxProvider(
      <DocMarkdown
        source={
          '# Markdown Component \n Renders markdown using [ReactMarkdown](https://github.com/rexxars/react-markdown)'
        }
        specKey={'4.0'}
      />
    );
    const heading = screen.getByRole('heading');
    expect(heading).toHaveTextContent('Markdown Component');
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('ReactMarkdown');
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/rexxars/react-markdown'
    );
  });

  test('it remaps hashbang urls found in markdown input', () => {
    const input =
      'A link to the [create_dashboard](#!/Dashboard/create_dashboard) endpoint';
    renderWithReduxProvider(<DocMarkdown source={input} specKey={'4.0'} />);
    expect(screen.getByText(/A link to the/)).toBeInTheDocument();
    expect(screen.getByText('create_dashboard')).toHaveAttribute(
      'href',
      '/4.0/methods/Dashboard/create_dashboard'
    );
  });

  test('it leaves external urls untouched', () => {
    renderWithReduxProvider(
      <DocMarkdown
        source={'[external_link](https://www.foo.com)'}
        specKey={'4.0'}
      />
    );
    expect(screen.getByText('external_link')).toHaveAttribute(
      'href',
      'https://www.foo.com'
    );
  });

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'spec';
    const store = createTestStore({
      settings: { searchPattern: highlightPattern },
    });
    renderWithReduxProvider(
      <DocMarkdown
        source={'An API Explorer to explore your OpenAPI spec'}
        specKey={'4.0'}
      />,
      store
    );
    const mark = screen.getByText(highlightPattern);
    expect(mark.tagName).toEqual('MARK');
  });

  test('it only highlights search matches in the display text of link', () => {
    const highlightPattern = 'dashboard';
    const store = createTestStore({
      settings: { searchPattern: highlightPattern },
    });
    renderWithReduxProvider(
      <DocMarkdown
        source={
          'An inline styled link with matching text in both the link text and the href: [create_dashboard](/4.0/methods/Dashboard/create_dashboard)'
        }
        specKey={'4.0'}
      />,
      store
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/4.0/methods/Dashboard/create_dashboard'
    );
    expect(link).toContainHTML('create_<mark>dashboard</mark>');
  });

  test('it renders code blocks', () => {
    const code =
      '```\nAuthorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4\n```';
    renderWithReduxProvider(<DocMarkdown source={code} specKey={'4.0'} />);
    expect(
      screen.getByText(
        'Authorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4'
      )
    ).toBeInTheDocument();
  });

  test('it renders inline code', () => {
    const markdown = 'Some text with code: `const noop = () => null`';
    renderWithReduxProvider(<DocMarkdown source={markdown} specKey={'4.0'} />);
    expect(screen.getByText('const noop = () => null')).toBeInTheDocument();
  });

  test('it validates link URIs when search highlights overlap scheme or path', () => {
    const store = createTestStore({
      settings: { searchPattern: 'script' },
    });
    renderWithReduxProvider(
      <DocMarkdown
        source={
          '[matched scheme](javascript:void(0)) [encoded mark](java%3Cmark%3Escript:void(0)) <a href="/<mark>/example.com/path">host relative</a>'
        }
        specKey={'4.0'}
      />,
      store
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
