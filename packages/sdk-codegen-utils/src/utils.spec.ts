/**
 * Copyright (c) 2023 Google LLC
 * SPDX-License-Identifier: MIT
 */

import { log } from './utils';

describe('utils', () => {
  it('returns log string', () => {
    expect(log('foo')).toEqual('foo');
  });
});
