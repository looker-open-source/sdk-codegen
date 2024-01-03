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
import { theme } from '@looker/components';
import type { Language } from 'prism-react-renderer';
import { Prism } from 'prism-react-renderer';
import blockTheme from 'prism-react-renderer/themes/vsDark';
import inlineTheme from 'prism-react-renderer/themes/github';

/**
 * checks whether input is supported syntax highlighting language
 * @param languageName - string lang name to test
 * @returns boolean
 */
export const instanceOfPrismLanguage = (languageName: string) => {
  const extraHighlightingEngines = ['kotlin', 'csharp', 'swift', 'ruby'];
  return (
    Object.keys(Prism.languages).includes(languageName) ||
    extraHighlightingEngines.includes(languageName)
  );
};

/**
 * gets highlighter language type for input language name
 * @param language sdk language to be highlighted
 * @returns prism language if it exists
 */
export const getPrismLanguage = (language: string): Language => {
  language = language.toLowerCase();
  // TODO revert back to `go` in generator language definitions instead of using this
  if (language === 'golang') {
    language = 'go';
  } else if (language === 'c#') {
    language = 'csharp';
  }
  return instanceOfPrismLanguage(language) ? (language as Language) : 'markup';
};

/**
 * applies package overrides to the default theme. Inline CodeDisplay uses githubLight theme, else uses vsCodeDark theme.
 * @returns modified prism theme object
 */
export const getOverriddenTheme = (transparent: boolean, inline: boolean) => {
  if (inline) {
    inlineTheme.plain.backgroundColor = theme.colors.ui1;
    inlineTheme.plain.border = `1px solid ${theme.colors.ui2}`;
    inlineTheme.plain.borderRadius = '4px';
    inlineTheme.plain.padding = '4px';
    inlineTheme.plain.fontSize = theme.fontSizes.small;
    return inlineTheme;
  } else if (transparent) {
    blockTheme.plain.backgroundColor = 'none';
    blockTheme.plain.padding = '0px';
  } else {
    blockTheme.plain.backgroundColor = theme.colors.text;
    blockTheme.plain.padding = '1rem';
  }
  return blockTheme;
};
