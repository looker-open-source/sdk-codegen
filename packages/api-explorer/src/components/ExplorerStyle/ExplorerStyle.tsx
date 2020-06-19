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

import { css, createGlobalStyle } from 'styled-components'

const reset = css`
  html {
    color: #4c535b;
    font-size: 100%;
    font-weight: 400;
  }

  html,
  body {
    height: 100%;
  }

  html,
  div,
  object,
  iframe,
  blockquote,
  li,
  form,
  legend,
  label,
  table,
  header,
  footer,
  nav,
  section,
  figure {
    margin: 0;
    padding: 0;
  }

  header,
  footer,
  nav,
  section,
  article,
  hgroup,
  figure {
    display: block;
  }

  em,
  i {
    font-style: italic;
  }

  b,
  strong {
    font-weight: 700;
  }
`

const typography = css`
  .mainColumn {
    --default-bottom-margin: 1.375rem;
  }

  .mainColumn h1,
  .mainColumn h2,
  .mainColumn h3,
  .mainColumn h4,
  .mainColumn h5,
  .mainColumn h6 {
    color: ${(props) => props.theme.colors.palette.charcoal700};
    font-weight: 600;
    margin-bottom: 0.35rem;
  }

  .mainColumn h1 {
    line-height: 1.1944444444;
    margin-bottom: ${(props) => props.theme.space.large};
  }

  /* Max-width here keeps line lengths in check */
  .mainColumn p,
  .mainColumn ul,
  .mainColumn ol {
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: var(--default-bottom-margin);
    max-width: 580px;
  }

  .mainColumn li ul,
  .mainColumn li ol {
    margin-bottom: 0;
  }

  .mainColumn pre {
    background-color: ${(props) => props.theme.colors.palette.charcoal700};
    border-radius: 8px;
    color: #fff;
    font-size: 0.875rem;
    margin-bottom: var(--default-bottom-margin);
    overflow: auto;
    padding: ${(props) => props.theme.space.large};
    width: 100%;
    max-width: 580px;
  }

  .mainColumn code {
    font-family: 'Roboto Mono', monospace !important;
    line-height: 1.5;
  }

  .mainColumn p code {
    background-color: ${(props) => props.theme.colors.palette.charcoal100};
    border-radius: 4px;
    color: ${(props) => props.theme.colors.palette.charcoal700};
    padding: 0 0.125rem;
  }
`

const links = css`
  .mainColumn a {
    color: ${(props) => props.theme.colors.palette.blue500};
    text-decoration: underline;
  }
`

const tables = css`
  .mainColumn table {
    border: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    border-collapse: collapse;
    margin-bottom: var(--default-bottom-margin);
    overflow: auto;
    width: 100%;
  }

  .mainColumn th {
    background-color: ${(props) => props.theme.colors.palette.charcoal100};
    border-right: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    font-weight: 600;
    padding: 0.5rem;
  }

  .mainColumn td {
    border-top: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    border-right: 1px solid ${(props) => props.theme.colors.palette.charcoal200};
    text-align: left;
    vertical-align: top;
    padding: 0.5rem;
  }
`

export const ExplorerStyle = createGlobalStyle`
  ${reset}
  ${links}
  ${typography}
  ${tables}
`
