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

import type { FC } from 'react'
import React, { useState, useEffect } from 'react'
import {
  Aside,
  Button,
  ButtonOutline,
  Space,
  useToggle,
  ExtendComponentsThemeProvider,
} from '@looker/components'
import { Beaker } from '@looker/icons'
import { useHistory, useParams } from 'react-router-dom'
import { RunIt, RunItFormKey } from '@looker/run-it'
import type { ApiModel } from '@looker/sdk-codegen'
import { typeRefs } from '@looker/sdk-codegen'
import { useSelector } from 'react-redux'
import type { IEnvironmentAdaptor } from '@looker/extension-utils'

import { getApixAdaptor, getLanguageByAlias, useNavigation } from '../../utils'
import {
  ApixSection,
  DocActivityType,
  DocMarkdown,
  DocRateLimited,
  DocReferences,
  DocResponses,
  DocSDKs,
  DocSdkUsage,
  DocSource,
  DocStatus,
  DocTitle,
  DocSchema,
} from '../../components'
import { selectSdkLanguage } from '../../state'
import { DocOperation, DocRequestBody } from './components'

interface MethodSceneProps {
  api: ApiModel
}

interface MethodSceneParams {
  methodName: string
  methodTag: string
  specKey: string
}

const showRunIt = async (adaptor: IEnvironmentAdaptor) => {
  const data = await adaptor.localStorageGetItem(RunItFormKey)
  return !!data
}

export const MethodScene: FC<MethodSceneProps> = ({ api }) => {
  const adaptor = getApixAdaptor()
  const history = useHistory()
  const navigate = useNavigation()
  const alias = useSelector(selectSdkLanguage)
  const sdkLanguage = getLanguageByAlias(alias)
  const { specKey, methodTag, methodName } = useParams<MethodSceneParams>()
  const { value, toggle, setOn } = useToggle()
  const [method, setMethod] = useState(api.methods[methodName])
  const seeTypes = typeRefs(api, method?.customTypes)

  const RunItButton = value ? Button : ButtonOutline

  useEffect(() => {
    const foundMethod = api.methods[methodName]
    if (foundMethod) {
      setMethod(api.methods[methodName])
    } else {
      // Invalid method
      if (api.tags[methodTag]) {
        // Found tag though
        navigate(`/${specKey}/methods/${methodTag}`)
      } else {
        navigate(`/${specKey}/methods`)
      }
    }
  }, [api, history, methodName, methodTag, specKey])

  useEffect(() => {
    const checkRunIt = async () => {
      try {
        const show = await showRunIt(adaptor)
        if (show) {
          setOn()
        }
      } catch (error) {
        console.error(error)
      }
    }
    checkRunIt()
  }, [adaptor, setOn])

  const runItToggle = (
    <RunItButton
      color={value ? 'key' : 'neutral'}
      iconBefore={<Beaker />}
      onClick={toggle}
    >
      Run It
    </RunItButton>
  )

  return (
    <>
      {method && (
        <ApixSection>
          <Space between>
            <Space>
              <DocTitle>{method.summary}</DocTitle>
              <DocSource method={method} />
            </Space>
            {runItToggle}
          </Space>
          <Space mb="large" gap="small">
            <DocStatus method={method} />
            <DocActivityType method={method} />
            <DocRateLimited method={method} />
          </Space>
          <DocOperation method={method} />
          <DocMarkdown source={method.description} specKey={specKey} />
          <DocSDKs api={api} method={method} />
          <DocRequestBody api={api} method={method} />
          <DocSdkUsage method={method} />
          <DocReferences typesUsed={seeTypes} api={api} specKey={specKey} />
          <DocResponses api={api} responses={method.responses} />
          <DocSchema object={method.schema} />
        </ApixSection>
      )}
      {value && (
        <Aside width="50rem">
          <ExtendComponentsThemeProvider
            themeCustomizations={{
              colors: {
                background: '#262D33',
                key: '#8AB4F8',
                text: '#fff',
                link: '#8AB4F8',
                critical: '#FF877C',
              },
            }}
          >
            <RunIt
              adaptor={adaptor}
              key={method.operationId}
              sdkLanguage={getLanguageByAlias(sdkLanguage)}
              api={api}
              method={method}
            />
          </ExtendComponentsThemeProvider>
        </Aside>
      )}
    </>
  )
}
