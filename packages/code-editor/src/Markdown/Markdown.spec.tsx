/*

 Copyright 2021-2026 Google LLC

 Use of this source code is governed by an MIT-style
 license that can be found in the LICENSE file or at
 https://opensource.org/licenses/MIT

 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from '@looker/components-test-utils';

import { Markdown } from './Markdown';
import { rehypeSanitizeMarkdown } from './sanitize';

describe('Markdown', () => {
  test('it renders markdown', () => {
    renderWithTheme(
      <Markdown
        source={
          '# Markdown Component \n Renders markdown using [ReactMarkdown](https://github.com/rexxars/react-markdown)'
        }
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

  test('it renders path links', () => {
    const input =
      'A link to the [create_dashboard](/4.0/methods/Dashboard/create_dashboard) endpoint';
    renderWithTheme(<Markdown source={input} />);
    expect(screen.getByText(/A link to the/)).toBeInTheDocument();
    expect(screen.getByText('create_dashboard')).toHaveAttribute(
      'href',
      '/4.0/methods/Dashboard/create_dashboard'
    );
  });

  test('it renders url links', () => {
    renderWithTheme(
      <Markdown source={'[external_link](https://www.foo.com)'} />
    );
    expect(screen.getByText('external_link')).toHaveAttribute(
      'href',
      'https://www.foo.com'
    );
  });

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'OpenAPI';
    renderWithTheme(
      <Markdown
        source={'An API Explorer to explore your OpenAPI spec'}
        pattern={highlightPattern}
      />
    );
    const mark = screen.getByText(highlightPattern);
    expect(mark.tagName).toEqual('MARK');
  });

  test('it renders code blocks', () => {
    const code =
      '```\nAuthorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4\n```';
    renderWithTheme(<Markdown source={code} />);
    expect(
      screen.getByText(
        'Authorization: token 4QDkCyCtZzYgj4C2p2cj3csJH7zqS5RzKs2kTnG4'
      )
    ).toBeInTheDocument();
  });

  test('it renders syntax highlighted code blocks', () => {
    const code = '```json\n{\n"model":"thelook"}```';
    renderWithTheme(<Markdown source={code} />);
    expect(screen.getByText('"model"')).toHaveClass('property');
  });

  test('it renders search matches in syntax highlighted code blocks', () => {
    const code = '```json\n{\n"model":"thelook"}```';
    renderWithTheme(<Markdown source={code} pattern={'model'} />);
    expect(screen.getByText('"model"')).toHaveClass('match');
  });

  test('it renders inline code', () => {
    const markdown = 'Some text with code: `const noop = () => null`';
    renderWithTheme(<Markdown source={markdown} />);
    expect(screen.getByText('const noop = () => null')).toBeInTheDocument();
  });

  test('it renders table', () => {
    const markdown = `
Before.

| Search Parameters | Description |
| :-------------------: | :------ |
| \`begin_at\` only | Find themes active at or after \`begin_at\` |
| \`end_at\` only | Find themes active at or before \`end_at\` |
| both set | Find themes with an active inclusive period between \`begin_at\` and \`end_at\` |

After.
    `;
    const { container } = renderWithTheme(<Markdown source={markdown} />);
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('th')?.innerHTML).toContain(
      'Search Parameters'
    );
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('td')?.innerHTML).toContain('begin_at');
  });

  test('it filters disallowed raw HTML elements and inline event attributes', () => {
    const { container } = renderWithTheme(
      <Markdown
        source={
          '### Section Heading\n<iframe>embedded</iframe><script>noop()</script><svg onload="noop()"></svg><img src="https://example.com/a.png" onerror="noop()">'
        }
      />
    );
    expect(
      screen.getByRole('heading', {
        name: 'Section Heading',
      })
    ).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('iframe')).toBeNull();
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('script')).toBeNull();
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('svg')).toBeNull();
    // eslint-disable-next-line testing-library/no-container
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).not.toHaveAttribute('onerror');
  });

  test('it unwraps links and omits images with disallowed URI schemes', () => {
    const { container } = renderWithTheme(
      <Markdown
        source={
          '<a href="javascript:void(0)" onclick="noop()">inline link</a> <a href="  JaVa\nScRiPt:void(0)">mixed case</a> [markdown link](javascript:void(0)) [highlighted scheme](java%3Cmark%3Escript:void(0)) [double backslash](\\\\\\\\example.com/path) <a href="/\\example.com/path">mixed slash</a> <img src="data:text/plain,hello">'
        }
      />
    );
    expect(screen.getByText(/inline link/)).toBeInTheDocument();
    expect(screen.getByText(/mixed case/)).toBeInTheDocument();
    expect(screen.getByText(/markdown link/)).toBeInTheDocument();
    expect(screen.getByText(/highlighted scheme/)).toBeInTheDocument();
    expect(screen.getByText(/double backslash/)).toBeInTheDocument();
    expect(screen.getByText(/mixed slash/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('a')).toBeNull();
    // eslint-disable-next-line testing-library/no-container
    expect(container.querySelector('img')).toBeNull();
  });

  test('it validates URIs returned by transformLinkUri and preserves GFM task lists', () => {
    renderWithTheme(
      <Markdown
        source={'- [x] done\n- [ ] todo\n\n[relative link](/docs)'}
        transformLinkUri={() => 'javascript:void(0)'}
      />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[0]).toBeDisabled();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[1]).toBeDisabled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  test('it passes internal pathname to linkClickHandler for relative links and empty pathname for external links', () => {
    const linkClickHandler = jest.fn();
    renderWithTheme(
      <Markdown
        source={
          '[internal](/4.0/methods/Dashboard/create_dashboard?sdk=py) [external](https://example.com/4.0/methods/Dashboard/create_dashboard)'
        }
        linkClickHandler={linkClickHandler}
      />
    );
    fireEvent.click(screen.getByText('internal'));
    expect(linkClickHandler).toHaveBeenLastCalledWith(
      '/4.0/methods/Dashboard/create_dashboard',
      '/4.0/methods/Dashboard/create_dashboard?sdk=py'
    );

    fireEvent.click(screen.getByText('external'));
    expect(linkClickHandler).toHaveBeenLastCalledWith(
      '',
      'https://example.com/4.0/methods/Dashboard/create_dashboard'
    );
  });

  test('rehypeSanitizeMarkdown preserves language-* classes from both string and array className properties', () => {
    const sanitize = rehypeSanitizeMarkdown();
    const tree = sanitize({
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'code',
          properties: { className: 'language-json custom-class' },
          children: [],
        },
        {
          type: 'element',
          tagName: 'code',
          properties: { className: ['language-ts', 'other-class'] },
          children: [],
        },
      ],
    });
    expect(tree.children?.[0]?.properties?.className).toEqual([
      'language-json',
    ]);
    expect(tree.children?.[1]?.properties?.className).toEqual(['language-ts']);
  });
});
