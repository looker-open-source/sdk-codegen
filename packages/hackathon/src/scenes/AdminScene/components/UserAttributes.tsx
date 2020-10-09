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

import React, { FC, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Form, Fieldset, FieldText, Button } from '@looker/components'
import {
  loadUserAttributesRequest,
  AdminUserAttributes,
} from '../../../data/admin/actions'
import { getUserAttributesState } from '../../../data/admin/selectors'
import { isLoadingState } from '../../../data/common/selectors'

export interface UserAttributesProps {}

const isDirty = (userAttributes: AdminUserAttributes): boolean => {
  if (userAttributes) {
    return (
      userAttributes.lookerClientId.dirty ||
      userAttributes.lookerClientSecret.dirty ||
      userAttributes.sheetId.dirty ||
      userAttributes.tokenServerUrl.dirty
    )
  }
  return false
}

export const UserAttributes: FC<UserAttributesProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadUserAttributesRequest())
  }, [dispatch])
  const userAttributes = useSelector(getUserAttributesState)
  const isLoading = useSelector(isLoadingState)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // Need to prevent the default processing for the form submission
    e.preventDefault()
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO
  }

  return (
    <>
      {userAttributes && (
        <Form onSubmit={onSubmit} width="40vw" mt="large">
          <Fieldset legend="Configure extension user attributes">
            <FieldText
              label="Looker client id"
              name="lookerClientId"
              value={userAttributes.lookerClientId.value}
              onChange={onChange}
              type="password"
              disabled={isLoading}
            />
            <FieldText
              label="Looker client secret"
              name="lookerClientSecret"
              value={userAttributes.lookerClientSecret.value}
              onChange={onChange}
              type="password"
              disabled={isLoading}
            />
            <FieldText
              label="Google sheet id"
              name="sheetId"
              value={userAttributes.sheetId.value}
              onChange={onChange}
              disabled={isLoading}
            />
            <FieldText
              label="Google access token server URL"
              name="sheetId"
              value={userAttributes.tokenServerUrl.value}
              onChange={onChange}
              disabled={isLoading}
            />
          </Fieldset>
          <Button disabled={!isDirty(userAttributes)}>
            Save Extension User Attributes
          </Button>
        </Form>
      )}
    </>
  )
}
