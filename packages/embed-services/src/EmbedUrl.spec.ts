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

import { ContentType, EmbedUrl } from './EmbedUrl';

describe('EmbedUrl', () => {
  const dashboardUrl = 'https://example.com/dashboards/123';
  const dashboardEmbedUrl = 'https://example.com/embed/dashboards/123';
  const exploreUrl = 'https://example.com/explore/456';
  const lookUrl = 'https://example.com/embed/looks/789';
  const invalidUrl = 'https://example.com';

  describe('constructor', () => {
    it('should set searchParams and path properties if present', () => {
      const url = `${dashboardUrl}?param1=value1`;
      const targetUrl = new EmbedUrl(url);
      expect(targetUrl.searchParams).toEqual({ param1: 'value1' });
      expect(targetUrl.path).toBe('/dashboards/123');
    });

    it('should support a target url without search params', () => {
      const targetUrl = new EmbedUrl(lookUrl);
      expect(targetUrl.searchParams).toEqual({});
      expect(targetUrl.path).toBe('/embed/looks/789');
    });

    it('should correctly determine isDashboard, isExplore and isLook properties', () => {
      const dashboardTargetUrl = new EmbedUrl(dashboardUrl);
      const exploreTargetUrl = new EmbedUrl(exploreUrl);
      const lookTargetUrl = new EmbedUrl(lookUrl);

      expect(dashboardTargetUrl.isDashboard).toBe(true);
      expect(dashboardTargetUrl.isExplore).toBe(false);
      expect(dashboardTargetUrl.isLook).toBe(false);

      expect(exploreTargetUrl.isDashboard).toBe(false);
      expect(exploreTargetUrl.isExplore).toBe(true);
      expect(exploreTargetUrl.isLook).toBe(false);

      expect(lookTargetUrl.isDashboard).toBe(false);
      expect(lookTargetUrl.isExplore).toBe(false);
      expect(lookTargetUrl.isLook).toBe(true);
    });

    it('should set content type to invalid for invalid urls', () => {
      const targetUrl = new EmbedUrl(invalidUrl);
      expect(targetUrl.contentType).toEqual(ContentType.Invalid);
    });

    it('should correctly determine contentType property', () => {
      const dashboardTargetUrl = new EmbedUrl(dashboardUrl);
      const exploreTargetUrl = new EmbedUrl(exploreUrl);
      const lookTargetUrl = new EmbedUrl(lookUrl);

      expect(dashboardTargetUrl.contentType).toBe(ContentType.Dashboard);
      expect(exploreTargetUrl.contentType).toBe(ContentType.Explore);
      expect(lookTargetUrl.contentType).toBe(ContentType.Look);
    });

    it('should set isThemable property based on contentType', () => {
      const dashboardTargetUrl = new EmbedUrl(dashboardUrl);
      const exploreTargetUrl = new EmbedUrl(exploreUrl);
      const lookTargetUrl = new EmbedUrl(lookUrl);

      expect(dashboardTargetUrl.isThemable).toBe(true);
      expect(exploreTargetUrl.isThemable).toBe(true);
      expect(lookTargetUrl.isThemable).toBe(false);
    });
  });

  describe('embedUrl', () => {
    const overrides = { theme: 'dark' };

    it('should return the correct embed URL if target url has no search params', () => {
      const targetUrl = new EmbedUrl(dashboardUrl);

      expect(targetUrl.embedUrl()).toBe(dashboardEmbedUrl);
    });

    it('should be able to exclude search params from target url', () => {
      const targetUrl = new EmbedUrl(`${dashboardUrl}?foo=bar`);

      expect(targetUrl.embedUrl(false)).toBe(dashboardEmbedUrl);
    });

    it('should be able to include search params from target url', () => {
      const url = new EmbedUrl(`${dashboardUrl}?foo=bar`);
      const expectedEmbedUrl = `${dashboardEmbedUrl}?foo=bar`;

      expect(url.embedUrl(true)).toBe(expectedEmbedUrl);
    });

    it('should return the correct embed URL with search param overrides', () => {
      const url = new EmbedUrl(`${dashboardUrl}?foo=bar`);
      const expectedEmbedUrl = `${dashboardEmbedUrl}?theme=dark`;

      expect(url.embedUrl(false, overrides)).toBe(expectedEmbedUrl);
    });

    it('should return the correct embed URL with target url search params and overrides', () => {
      const url = new EmbedUrl(`${dashboardUrl}?Cool+Filter=Item+Count`);
      const expectedEmbedUrl = `${dashboardEmbedUrl}?Cool+Filter=Item+Count&theme=dark`;

      expect(url.embedUrl(true, overrides)).toBe(expectedEmbedUrl);
    });

    it('supports json target url search param values', () => {
      const url = new EmbedUrl(
        `${dashboardEmbedUrl}?_theme={"show_filters_bar":false}`
      );
      const expectedUrl = `${dashboardEmbedUrl}?_theme=%7B%22show_filters_bar%22%3Afalse%7D&theme=dark`;
      expect(url.searchParams).toEqual({
        _theme: '{"show_filters_bar":false}',
      });
      expect(url.embedUrl(true, overrides)).toEqual(expectedUrl);
    });

    it('supports overrides with json values', () => {
      const url = new EmbedUrl(`${dashboardEmbedUrl}?theme=dark`);
      const overrides = { _theme: { show_filters_bar: false } };
      expect(url.embedUrl(true, overrides)).toEqual(
        `${dashboardEmbedUrl}?theme=dark&_theme=%7B%22show_filters_bar%22%3Afalse%7D`
      );
    });

    it('overrides should take precedence over the same existing param', () => {
      const targetUrl = new EmbedUrl(`${dashboardUrl}?theme=foo`);
      const overrides = { theme: 'overrideTheme' };
      expect(targetUrl.embedUrl(true, overrides)).toEqual(
        `${dashboardEmbedUrl}?theme=overrideTheme`
      );
    });

    it('should throw for invalid urls', () => {
      const targetUrl = new EmbedUrl(invalidUrl);
      expect(() => targetUrl.embedUrl()).toThrow('Invalid content type');
    });
  });
});
