import React, { ReactElement } from 'react'
import {
  IRawResponse,
  ResponseMode,
  responseMode,
} from '@looker/sdk/lib/browser'
import { Paragraph } from '@looker/components'

import { CodeStructure } from './CodeStructure'

const ShowJSON = (response: IRawResponse) => (
  <CodeStructure
    code={JSON.stringify(JSON.parse(response.body), null, 2)}
    language={'json'}
  />
)

const ShowText = (response: IRawResponse) => (
  <pre>
    {response.statusMessage !== 'OK' && response.statusMessage}
    {response.body.toString()}
  </pre>
)

/**
 * Get image content from response
 * @param response Basic HTTP response type
 * @returns Image content
 */
const imageContent = (response: IRawResponse) => {
  let content
  if (response.body instanceof Blob) {
    content = URL.createObjectURL(response.body)
  } else {
    content = `data:${response.contentType};base64,${btoa(response.body)}`
  }
  return content
}

const ShowImage = (response: IRawResponse) => (
  <img src={imageContent(response)} />
)

const ShowHTML = (response: IRawResponse) => (
  <CodeStructure language={'html'} code={response.body.toString()} />
)

const ShowUnknown = (response: IRawResponse) => (
  <Paragraph>
    {`Received ${
      response.body instanceof Blob
        ? response.body.size
        : response.body.toString().length
    } bytes of ${response.contentType} data.`}
  </Paragraph>
)

interface Responder {
  label: string
  isRecognized: (contentType: string) => boolean
  component: (response: IRawResponse) => ReactElement
}

// TODO: Add support for content type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet and pdf
export const responseHandlers: Responder[] = [
  {
    label: 'json',
    isRecognized: (contentType) =>
      RegExp(/application\/json/g).test(contentType),
    component: (response) => ShowJSON(response),
  },
  {
    label: 'html',
    isRecognized: (contentType) => RegExp(/text\/html/g).test(contentType),
    component: (response) => ShowHTML(response),
  },
  {
    label: 'text',
    isRecognized: (contentType) =>
      responseMode(contentType) === ResponseMode.string ||
      contentType === 'text',
    component: (response) => ShowText(response),
  },
  {
    label: 'img',
    isRecognized: (contentType) =>
      RegExp(/image\/(png|jpg|jpeg)/).test(contentType),
    component: (response) => ShowImage(response),
  },
  {
    label: 'unknown',
    isRecognized: (contentType: string) => !!contentType,
    component: (response) => ShowUnknown(response),
  },
]
