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
import type { ReactElement } from 'react';
import React from 'react';
import type { IRawResponse } from '@looker/sdk-rtl';
import { ResponseMode, responseMode } from '@looker/sdk-rtl';
import {
  MessageBar,
  Paragraph,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  useTabs,
} from '@looker/components';
import { CodeCopy, Markdown } from '@looker/code-editor';
import { DataGrid, json2Csv, parseCsv } from '../DataGrid';

/**
 * Are all items this array "simple"
 * @param data to check for simplicity
 */
export const allSimple = (data: any[]) => {
  if (!Array.isArray(data)) return false;
  for (let i = 0; i < data.length; i++) {
    const col = data[i];
    if (col) {
      if (/\[object Object]/gi.test(col)) return false;
      if (Array.isArray(col)) return false;
      if (col instanceof Object && !(col instanceof Date)) return false;
    }
  }
  return true;
};

const copyRaw = (code: string, language = 'unknown') => {
  return (
    <CodeCopy language={language} code={code} lineNumbers={false} transparent />
  );
};

/**
 * Is every array in this array a "simple" data row?
 * @param data to check for columnarity
 */
export const isColumnar = (data: any[]) => {
  if (data.length === 0) return false;
  if (data.length === 1 && data[0].length === 0) return false;
  const complex = Object.values(data).find((row: any[]) => !allSimple(row));
  return !complex;
};

enum ItemType {
  Array = 'a',
  Object = 'o',
  Simple = 's',
  Undefined = 'u',
}

/**
 * Is this an array, an object, a value, or undefined
 * @param value to check
 */
const itemType = (value: any): ItemType => {
  if (!value) return ItemType.Undefined;
  if (Array.isArray(value)) return ItemType.Array;
  if (value instanceof Object) return ItemType.Object;
  return ItemType.Simple;
};

/**
 * Get the 2D type mapping for the object
 * @param json to analyze
 */
const getTypes = (json: any) => {
  const types = [new Set<ItemType>(), new Set<ItemType>()];
  if (!json) {
    types[0].add(ItemType.Undefined);
    return types;
  }
  for (const key of Object.keys(json)) {
    const value = json[key];
    const type = itemType(value);
    types[0].add(type);
    switch (type) {
      case ItemType.Array:
      case ItemType.Object:
        Object.keys(value).forEach((k) => {
          const v = value[k];
          types[1].add(itemType(v));
        });
        break;
    }
  }
  return types;
};

/**
 * Is this a uniform object that can be converted into a table?
 * @param json to analyze
 */
export const canTabulate = (json: any) => {
  const types = getTypes(json);
  return (
    types[0].size === 1 &&
    (types[0].has(ItemType.Array) || types[0].has(ItemType.Object)) &&
    types[1].size <= 1
  );
};

/**
 * Show JSON responses
 *
 * Shows the JSON in a syntax-highlighted fashion
 * If the JSON is parseable as 2D row/column data it will also be shown in grid
 * If JSON cannot be parsed it will be shown as is
 * @param response
 */
const ShowJSON = (response: IRawResponse) => {
  const content = response.body.toString();
  const parsed = JSON.parse(response.body);
  const data = canTabulate(parsed) ? json2Csv(content) : undefined;
  const showGrid = data && isColumnar(data.data);
  const json = JSON.stringify(parsed, null, 2);
  const raw = copyRaw(json, 'json');
  if (showGrid) return <DataGrid data={data.data} raw={raw} />;
  return raw;
};

/** A handler for text type responses */
const ShowText = (response: IRawResponse) => (
  <>
    {response.statusMessage !== 'OK' && response.statusMessage}
    {copyRaw(response.body.toString())}
  </>
);

/**
 * Show CSV grid and raw data
 * @param response HTTP response to parse and display
 */
const ShowCSV = (response: IRawResponse) => {
  const raw = copyRaw(response.body.toString());
  const data = parseCsv(response.body.toString());
  return <DataGrid data={data.data} raw={raw} />;
};

const ShowMD = (response: IRawResponse) => {
  const tabs = useTabs();
  const raw = copyRaw(response.body.toString(), 'markup');
  const data = response.body.toString();
  return (
    <>
      <TabList {...tabs}>
        <Tab key="md">Markdown</Tab>
        <Tab key="raw">Raw</Tab>
      </TabList>
      <TabPanels {...tabs} pt="0">
        <TabPanel key="doc">
          <Markdown source={data} />
        </TabPanel>
        <TabPanel key="text">{raw}</TabPanel>
      </TabPanels>
    </>
  );
};

/** A handler for image type responses */
const ShowImage = (response: IRawResponse) => {
  let content: string;
  if (response.body instanceof Blob) {
    content = URL.createObjectURL(response.body).toString();
  } else {
    content = `data:${response.contentType};base64,${btoa(response.body)}`;
  }
  return (
    <img
      src={content}
      alt={`${response.url} returned ${response.contentType}`}
    />
  );
};

/** A handler for HTTP type responses */
const ShowHTML = (response: IRawResponse) =>
  copyRaw(response.body.toString(), 'html');

const ShowSQL = (response: IRawResponse) =>
  copyRaw(response.body.toString(), 'sql');

/**
 * A handler for unknown response types. It renders the size of the unknown response and its type.
 */
const ShowUnknown = (response: IRawResponse) => {
  const body = response.body || '';
  const message = `Received ${
    body instanceof Blob ? body.size : body.toString().length
  } bytes of ${response.contentType} data.`;
  return <Paragraph>{message}</Paragraph>;
};

/** Displays a PDF inside the page */
const ShowPDF = (response: IRawResponse) => {
  // TODO display a PDF, maybe similar to https://github.com/wojtekmaj/react-pdf/blob/master/sample/webpack/Sample.jsx
  return ShowUnknown(response);
};

/** A handler for responses that cannot be parsed */
const ShowRaw = (response: IRawResponse) => (
  <>
    {ShowUnknown(response)}
    <MessageBar intent="warn" noActions>
      The response body could not be parsed. Displaying raw data.
    </MessageBar>
    {copyRaw(response?.body?.toString() || '')}
  </>
);

interface Responder {
  /** A label indicating the supported MIME type(s) */
  label: string;
  /** A lambda for determining whether a given MIME type is supported */
  isRecognized: (contentType: string) => boolean;
  /** A component that renders recognized MIME types */
  component: (response: IRawResponse) => ReactElement;
}

/**
 * An array of response handlers, describing currently supported MIME types
 */
export const responseHandlers: Responder[] = [
  // TODO: Add support for content type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet and pdf
  {
    label: 'json',
    isRecognized: (contentType) => /application\/json/g.test(contentType),
    component: (response) => ShowJSON(response),
  },
  {
    label: 'html',
    isRecognized: (contentType) => /text\/html/g.test(contentType),
    component: (response) => ShowHTML(response),
  },
  {
    label: 'csv',
    isRecognized: (contentType) => /text\/csv/g.test(contentType),
    component: (response) => ShowCSV(response),
  },
  {
    label: 'md',
    isRecognized: (contentType) => /text\/markdown/g.test(contentType),
    component: (response) => ShowMD(response),
  },
  // SVG would normally be considered a "string" because of the xml tag, so it must be checked before text
  {
    label: 'img',
    isRecognized: (contentType) =>
      /image\/(png|jpg|jpeg|svg\+xml)/.test(contentType),
    component: (response) => ShowImage(response),
  },
  {
    // render task: 9d52f842b2c3f474970123302b2fa7e0
    label: 'pdf',
    isRecognized: (contentType) => /application\/pdf/g.test(contentType),
    component: (response) => ShowPDF(response),
  },
  {
    label: 'sql',
    isRecognized: (contentType) => /application\/sql/g.test(contentType),
    component: (response) => ShowSQL(response),
  },
  {
    label: 'text',
    isRecognized: (contentType) =>
      responseMode(contentType) === ResponseMode.string ||
      contentType === 'text',
    component: (response) => ShowText(response),
  },
  {
    label: 'unknown',
    isRecognized: (contentType: string) => !!contentType,
    component: (response) => ShowUnknown(response),
  },
];

/** find the response handler or return the default */
export const pickResponseHandler = (response: IRawResponse) => {
  let result = responseHandlers[responseHandlers.length - 1];
  for (const handler of responseHandlers) {
    if (handler.isRecognized(response.contentType)) {
      result = handler;
      break;
    }
  }
  return result;
};

export const fallbackResponseHandler = (): Responder => ({
  label: 'unknown',
  isRecognized: (contentType: string) => !!contentType,
  component: (response) => ShowRaw(response),
});
