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

import { AuthToken } from './authToken';

describe('AccessToken', () => {
  it('defaults with empty token', () => {
    const actual = new AuthToken();
    expect(actual.access_token).toEqual('');
    expect(actual.token_type).toEqual('');
    expect(actual.expires_in).toEqual(0);
    expect(actual.isActive()).toEqual(false);
  });

  it('is active with full token', () => {
    const actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 3600,
      token_type: 'backstage',
    });
    expect(actual.access_token).toEqual('all-access');
    expect(actual.token_type).toEqual('backstage');
    expect(actual.expires_in).toEqual(3600);
    expect(actual.isActive()).toEqual(true);
  });

  it('has a 10 second lag time for expiration', () => {
    let actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 9,
      token_type: 'backstage',
    });
    expect(actual.access_token).toEqual('all-access');
    expect(actual.token_type).toEqual('backstage');
    expect(actual.expires_in).toEqual(9);
    expect(actual.isActive()).toEqual(false);
    actual = new AuthToken({
      access_token: 'all-access',
      expires_in: 11,
      token_type: 'backstage',
    });
    expect(actual.expires_in).toEqual(11);
    expect(actual.isActive()).toEqual(true);
  });

  it('uses UTC epoch milliseconds and is unaffected by DST fall back', () => {
    // 2026-11-01T05:30:00Z is 01:30:00 EDT (30 mins before DST fall back to EST)
    const startMs = Date.parse('2026-11-01T05:30:00.000Z');
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(startMs);
    try {
      const token = new AuthToken({
        access_token: 'dst-token',
        expires_in: 3600,
        token_type: 'Bearer',
        refresh_token: 'refresh-1',
      });
      // Exact elapsed duration must be (3600 - 10) * 1000 ms = 3,590,000 ms
      expect(token.expiresAt.getTime() - startMs).toEqual(3590 * 1000);
      expect(token.isActive()).toEqual(true);

      // Advance 3591 seconds in UTC (past the 06:00:00Z DST fall back boundary)
      nowSpy.mockReturnValue(startMs + 3591 * 1000);
      expect(token.isActive()).toEqual(false);

      // Reset clears access_token and expiresAt while keeping refresh_token
      nowSpy.mockReturnValue(startMs);
      const activeAgain = new AuthToken({
        access_token: 'dst-token-2',
        expires_in: 3600,
        refresh_token: 'refresh-2',
      });
      expect(activeAgain.isActive()).toEqual(true);
      activeAgain.reset();
      expect(activeAgain.isActive()).toEqual(false);
      expect(activeAgain.refresh_token).toEqual('refresh-2');
    } finally {
      nowSpy.mockRestore();
    }
  });
});
