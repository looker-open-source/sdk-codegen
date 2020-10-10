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
  updateAttributeValues,
  saveUserAttributes,
} from '../../../data/admin/actions'
import { getUserAttributesState } from '../../../data/admin/selectors'
import { isLoadingState } from '../../../data/common/selectors'

export interface UserAttributesProps {}

const isFormClean = (userAttributes: AdminUserAttributes): boolean => {
  if (userAttributes) {
    return (
      userAttributes.lookerClientId.value ===
        userAttributes.lookerClientId.originalValue &&
      userAttributes.lookerClientSecret.value ===
        userAttributes.lookerClientSecret.originalValue &&
      userAttributes.sheetId.value === userAttributes.sheetId.originalValue &&
      userAttributes.tokenServerUrl.value ===
        userAttributes.tokenServerUrl.originalValue
    )
  }
  return true
}

const isFormInvalid = (userAttributes: AdminUserAttributes): boolean => {
  if (userAttributes) {
    return (
      userAttributes.lookerClientId.value.trim() === '' ||
      userAttributes.lookerClientSecret.value.trim() === '' ||
      userAttributes.sheetId.value.trim() === '' ||
      userAttributes.tokenServerUrl.value.trim() === ''
    )
  }
  return true
}

export const UserAttributes: FC<UserAttributesProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(loadUserAttributesRequest())
  }, [dispatch])
  const userAttributes = useSelector(getUserAttributesState)
  const isLoading = useSelector(isLoadingState)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    dispatch(saveUserAttributes(userAttributes!))
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedUserAttributes = { ...userAttributes! }
    if (e.target.name === 'lookerClientId') {
      updatedUserAttributes.lookerClientId = {
        ...updatedUserAttributes.lookerClientId,
        value: e.target.value,
      }
    } else if (e.target.name === 'lookerClientSecret') {
      updatedUserAttributes.lookerClientSecret = {
        ...updatedUserAttributes.lookerClientSecret,
        value: e.target.value,
      }
    } else if (e.target.name === 'sheetId') {
      updatedUserAttributes.sheetId = {
        ...updatedUserAttributes.sheetId,
        value: e.target.value,
      }
    } else if (e.target.name === 'tokenServerUrl') {
      updatedUserAttributes.tokenServerUrl = {
        ...updatedUserAttributes.tokenServerUrl,
        value: e.target.value,
      }
    }
    dispatch(updateAttributeValues(updatedUserAttributes))
  }

  return (
    <>
      {userAttributes && (
        <Form onSubmit={onSubmit} width="40vw" mt="large">
          <Fieldset legend="Configure extension user attributes">
            <FieldText
              required
              label="Looker client id"
              name="lookerClientId"
              value={userAttributes.lookerClientId.value}
              onChange={onChange}
              type="password"
              disabled={isLoading}
            />
            <FieldText
              required
              label="Looker client secret"
              name="lookerClientSecret"
              value={userAttributes.lookerClientSecret.value}
              onChange={onChange}
              type="password"
              disabled={isLoading}
            />
            <FieldText
              required
              label="Google sheet id"
              name="sheetId"
              value={userAttributes.sheetId.value}
              onChange={onChange}
              disabled={isLoading}
            />
            <FieldText
              required
              label="Google access token server URL"
              name="tokenServerUrl"
              value={userAttributes.tokenServerUrl.value}
              onChange={onChange}
              disabled={isLoading}
            />
          </Fieldset>
          <Button
            disabled={
              isLoading ||
              isFormClean(userAttributes) ||
              isFormInvalid(userAttributes)
            }
          >
            {isLoading ? 'Loading...' : 'Save Extension User Attributes'}
          </Button>
        </Form>
      )}
    </>
  )
}
