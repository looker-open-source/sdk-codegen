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
import { instanceOfPrismLanguage } from '../utils';

export const regReplaceAll = (
  content: string,
  pattern: string,
  replacementFunc: any
) => {
  const target = new RegExp(pattern, 'gi');
  return content.replace(target, replacementFunc);
};
/**
 * Adds <mark> tags around text if search pattern is detected
 * @param content - the main content to render
 * @param searchPattern - the search pattern to consider
 * @returns - a 'marked' string to be rendered by markdown component
 */
export const addMarkTags = (content: string, searchPattern: string) => {
  let markedContent;
  try {
    const replacement = (match: string) => `<mark>${match}</mark>`;
    markedContent = regReplaceAll(content, searchPattern, replacement);
  } catch (e) {
    markedContent = content;
  }
  return markedContent;
};

/**
 * Removes <mark><mark/> tags from markdown text. The mark tag is removed from code styled
 * text as the code renderer cannot differentiate <mark><mark/> from the code text.
 * @param markedText - the markdown text input that contains <mark /> tags
 */
export const removeMarkTags = (markedText: string) => {
  return markedText.replace(/<\/?mark>/g, '');
};

/**
 * Checks the input for code block decorators, the programming language used (```json), and returns a language tag
 * that is later used to inform syntax highlighting rules
 * @param content - the code blob to render
 * @returns - code blob string with code language tag
 */
export const addCodeLanguageTags = (content: string) => {
  let languageTaggedContent: string;
  try {
    const searchPattern = /```([A-Za-z]+)$/gm;
    const match = searchPattern.exec(content);
    const language = match && match[1];
    const replacement = () => `\`\`\`\n<${language}/>`;
    languageTaggedContent = content.replace(searchPattern, replacement);
  } catch (e) {
    languageTaggedContent = content;
  }
  return languageTaggedContent;
};

/**
 * Removes the code language tag from the code blob text before text presentation to screen
 * @param content - code blob text with language tag
 * @returns - code blob text without language tag
 */
export const removeCodeLanguageTags = (content: string) => {
  let untaggedContent;
  try {
    const replacement = () => '';
    const searchPattern = /<(.*)\/>$/gm;
    const match = searchPattern.exec(content);
    const language = match && match[1];
    if (language && instanceOfPrismLanguage(language)) {
      untaggedContent = regReplaceAll(
        content,
        '<' + language + '/>\n',
        replacement
      );
    } else {
      untaggedContent = content;
    }
  } catch (e) {
    untaggedContent = content;
  }
  return untaggedContent;
};

/**
 * Extracts the syntax highlighting language, if specified
 * @param content - language tagged code blob
 * @returns - syntax highlighting language
 */
export const getCodeLanguageFromTaggedText = (content: string): string => {
  const searchPattern = /<(.*)\/>$/gm;
  const match = searchPattern.exec(content);
  return match ? match[1] : 'markup';
};

/**
 * Removes tags that were applied for syntax highlighting or search pattern matching and returns just the code blob text
 * @param content - code blob text to render
 * @returns - rendered code text
 */
export const prepareCodeText = (content: string) => {
  let text = content;
  const language = getCodeLanguageFromTaggedText(text);
  text = removeCodeLanguageTags(text);
  text = removeMarkTags(text);
  text = text.trim();
  return { text, language };
};

/**
 * Returns a 'qualified markdown' text, a string which contains search pattern match and syntax highlighting qualifiers used by this package
 * @param content The content to qualify
 * @param pattern The regex pattern to search
 * @returns qualified content
 */
export const qualifyMarkdownText = (
  content: string,
  pattern: string
): string => {
  let qualifiedContent;
  if (pattern !== '') {
    qualifiedContent = addMarkTags(content, pattern);
  }
  qualifiedContent = addCodeLanguageTags(qualifiedContent || content);
  return qualifiedContent;
};
