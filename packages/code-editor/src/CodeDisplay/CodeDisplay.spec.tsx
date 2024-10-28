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
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@looker/components-test-utils';

import { CodeDisplay } from './CodeDisplay';

describe('CodeDisplay', () => {
  const code = `
  # GET /lookml_models -> Sequence[models.LookmlModel]
  def all_lookml_models(
      self,
      # Requested fields.
      fields: Optional[str] = None,
      transport_options: Optional[transport.TransportOptions] = None,
  ) -> Sequence[models.LookmlModel]:
      """Get All LookML Models"""
      response = self.get(
                      f"/lookml_models",
              Sequence[models.LookmlModel],
              query_params={"fields": fields},
              transport_options=transport_options
      )
      assert isinstance(response, list)
      return response
  `;
  test('it syntax highlights', () => {
    renderWithTheme(<CodeDisplay code={code} language="python" />);
    expect(screen.getByText('all_lookml_models').closest('span')).toHaveClass(
      'function'
    );
    expect(screen.getByText('def').closest('span')).toHaveClass('keyword');
    expect(
      screen
        .getByText('# GET /lookml_models -> Sequence[models.LookmlModel]')
        .closest('span')
    ).toHaveClass('comment');
  });

  test('it highlights text matching search pattern', () => {
    const highlightPattern = 'lookml_models';
    renderWithTheme(
      <CodeDisplay code={code} language="python" pattern={highlightPattern} />
    );
    expect(screen.getByText('all_lookml_models').closest('span')).toHaveClass(
      'match'
    );
  });
});
