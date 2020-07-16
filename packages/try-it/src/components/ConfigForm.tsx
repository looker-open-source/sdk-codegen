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

import React, { BaseSyntheticEvent, FC } from 'react'
import {
  Box,
  Button,
  FieldRadioGroup,
  Fieldset,
  FieldText,
  Form,
  Heading,
  Text,
} from '@looker/components'
import { getConfig, setConfig, TryItConfigKey } from './configUtils'

interface ConfigFormProps {
  title?: string
  dialogue?: boolean
}

export const ConfigForm: FC<ConfigFormProps> = ({
  title,
  dialogue = false,
}) => {
  // const handleChange = (e: BaseSyntheticEvent) => {
  //   setRequestContent({ ...requestContent, [e.target.name]: e.target.value })
  // }
  const storage = getConfig(TryItConfigKey)
  let config = { base_url: '', looker_url: '' }
  const location = storage.location
  if (storage.value) config = JSON.parse(storage.value)
  const { base_url, looker_url } = config
  const storageOptions = [
    { label: 'Session', value: 'session' },
    { label: 'Local', value: 'local' },
  ]
  const handleSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault()
    setConfig(
      TryItConfigKey,
      JSON.stringify({ base_url, looker_url }),
      location
    )
  }
  title = title || 'Options'
  return (
    <Box>
      <Heading>
        <Text>{title}</Text>
      </Heading>
      <Form onSubmit={handleSubmit}>
        <Fieldset inline legend="Server locations">
          <FieldText
            label="API Server url"
            placeholder="typically https://myserver.looker.com:19999"
            name="base_url"
            defaultValue={base_url}
          />
          <FieldText
            label="OAuth server url"
            placeholder="typically https://myserver.looker.com:9999"
            name="looker_url"
            defaultValue={looker_url}
          />
        </Fieldset>
        <FieldRadioGroup
          description="Configuration storage location"
          label="Save to ..."
          name="storage"
          options={storageOptions}
          defaultValue={location}
          inline
          required
        />
        {!dialogue && <Button>Save</Button>}
      </Form>
    </Box>
  )
}
