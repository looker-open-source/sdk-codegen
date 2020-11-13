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

import React from 'react'
import { renderWithTheme } from '@looker/components-test-utils'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiModel, IMethod } from '@looker/sdk-codegen'

import { RunIt, RunItInput } from './RunIt'
import { api, testTextResponse } from './test-data'
import { initRunItSdk, RunItSettings } from './utils'
import {
  defaultConfigurator,
  StandaloneConfigurator,
} from './components/ConfigForm/configUtils'
import { RunItProvider } from './RunItProvider'

const sdk = initRunItSdk(new StandaloneConfigurator())

describe('RunIt', () => {
  const run = 'Run'
  const runItInputs: RunItInput[] = [
    {
      name: 'result_format',
      location: 'path',
      type: 'string',
      required: true,
      description: 'Format of result',
    },
    {
      name: 'limit',
      location: 'query',
      type: 'integer',
      required: true,
      description: 'Row limit',
    },
    {
      name: 'cache',
      location: 'query',
      type: 'boolean',
      required: false,
      description: 'Get results from cache if available',
    },
    {
      name: 'body',
      location: 'body',
      type: {
        model: 'string',
        view: 'string',
        fields: ['string'],
        limit: 'string',
      },
      description: 'body',
      required: true,
    },
  ]

  const renderRunIt = (
    _api: ApiModel = api,
    inputs = runItInputs,
    method: IMethod = api.methods.run_inline_query
  ) => {
    renderWithTheme(
      <RunItProvider
        sdk={sdk}
        configurator={defaultConfigurator}
        basePath="/api/4.0"
      >
        <RunIt api={_api} inputs={inputs} method={method} />
      </RunItProvider>
    )
  }

  describe('configured and authenticated', () => {
    beforeEach(() => {
      jest.spyOn(sdk.authSession, 'isAuthenticated').mockReturnValue(true)
      jest.spyOn(RunItSettings.prototype, 'getStoredConfig').mockReturnValue({
        base_url: 'https://foo:19999',
        looker_url: 'https://foo:9999',
      })
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    test('it renders endpoint, request and response tabs, and form inputs', () => {
      renderRunIt()
      // TODO fix this
      // expect(screen.getByRole('heading')).toHaveTextContent(
      //   'POST /queries/run/{result_format}'
      // )
      expect(screen.getByRole('tab', { name: 'Request' })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Response' })).toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: 'result_format' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('spinbutton', { name: 'limit' })
      ).toBeInTheDocument()
      expect(screen.getByRole('switch', { name: 'cache' })).toBeInTheDocument()
      expect(screen.getByText('body')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: run })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Login' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
    })

    test('the form submit handler invokes the request callback on submit', async () => {
      const defaultRequestCallback = jest
        .spyOn(sdk.authSession.transport, 'rawRequest')
        .mockResolvedValueOnce(testTextResponse)
      renderRunIt()
      userEvent.click(screen.getByRole('button', { name: run }))
      await waitFor(() => {
        expect(defaultRequestCallback).toHaveBeenCalled()
        expect(
          screen.queryByText(testTextResponse.body.toString())
        ).toBeInTheDocument()
      })
    })
  })

  describe('not configured or authenticated', () => {
    beforeEach(() => {
      jest.spyOn(sdk.authSession, 'isAuthenticated').mockReturnValue(false)
      jest.spyOn(RunItSettings.prototype, 'getStoredConfig').mockReturnValue({
        base_url: '',
        looker_url: '',
      })
    })

    test('it renders ConfigForm', () => {
      renderRunIt()
      expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: run })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Login' })).toBeNull()
    })
  })

  describe('configured but not authenticated', () => {
    beforeEach(() => {
      jest.spyOn(sdk.authSession, 'isAuthenticated').mockReturnValue(false)
      jest.spyOn(RunItSettings.prototype, 'getStoredConfig').mockReturnValue({
        base_url: 'https://foo:19999',
        looker_url: 'https://foo:9999',
      })
    })

    test('it renders LoginForm', () => {
      renderRunIt()
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Remove' })).toBeNull()
      expect(screen.queryByRole('button', { name: run })).toBeNull()
    })
  })
})
