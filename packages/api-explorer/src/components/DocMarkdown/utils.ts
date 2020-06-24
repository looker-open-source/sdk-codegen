/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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

/**
 * Returns a markdown string with matches wrapped with mark tags
 * @param pattern The regex pattern to match
 * @param content The content to search
 * @returns content with highlighted matches
 */
export const highlightMarkdown = (pattern: string, content: string): string => {
  let highlightedContent
  if (!pattern) {
    highlightedContent = content
  } else {
    try {
      const replacement = (match: string) => `<mark>${match}</mark>`
      const target = new RegExp(pattern, 'gi')
      highlightedContent = content.replace(target, replacement)
    } catch (e) {
      highlightedContent = content
    }
  }
  return highlightedContent
}

/**
 * Remove mark tags from url
 * @param url
 * @returns a clean url
 */
const cleanURL = (url: string) =>
  url.replace(/<mark>/gi, '').replace(/<\/mark>/gi, '')

/**
 * Remaps tag/method a hashbang url to match the MethodScene route.
 * @param url
 * @param specKey A string to identify the spec in the URL
 * @returns the cleaned and remapped hashbang url
 */
export const remapHashURL = (specKey: string, url: string) =>
  url
    // #!/:navVersion?/:methodTag/:methodName
    .replace(/#!\/(:?\d+\.\d+\/)?(\w+)\/(\w+)/gi, `/${specKey}/methods/$2/$3`)
    // #!/:navVersion/:methodTag
    .replace(/#!\/(:?\d+\.\d+\/)?(\w+)/gi, `/${specKey}/methods/$2`)

/**
 * Clean urls from mark tags and remap tag/method hashbang urls to match the MethodScene route
 * @param specKey A string to identify the spec in the URL
 * @param url
 * Returns transformed url
 */
export const transformURL = (specKey: string, url: string) =>
  remapHashURL(specKey, cleanURL(url))
