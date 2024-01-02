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

import type { FC } from 'react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FieldText, Fieldset, Form, Space } from '@looker/components';
import {
  loadUserAttributesRequest,
  saveUserAttributesRequest,
  updateAttributeValues,
} from '../../../data/admin/actions';
import { getUserAttributesState } from '../../../data/admin/selectors';
import { isLoadingState } from '../../../data/common/selectors';

export interface UserAttributesProps {}

export const UserAttributes: FC<UserAttributesProps> = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadUserAttributesRequest());
  }, [dispatch]);
  const userAttributes = useSelector(getUserAttributesState);
  const isLoading = useSelector(isLoadingState);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(saveUserAttributesRequest(userAttributes!));
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedUserAttributes: any = { ...userAttributes! };
    updatedUserAttributes[e.target.name] = e.target.value;
    dispatch(updateAttributeValues(updatedUserAttributes));
  };

  return (
    <Form onSubmit={onSubmit} width="40vw" mt="large">
      <Fieldset legend="Configure Hackathon Application">
        <FieldText
          required
          label="Looker client id"
          name="lookerClientId"
          value={userAttributes?.lookerClientId}
          onChange={onChange}
          type="password"
          disabled={isLoading}
        />
        <FieldText
          required
          label="Looker client secret"
          name="lookerClientSecret"
          value={userAttributes?.lookerClientSecret}
          onChange={onChange}
          type="password"
          disabled={isLoading}
        />
        <FieldText
          required
          label="Google sheet id"
          name="sheetId"
          value={userAttributes?.sheetId}
          onChange={onChange}
          disabled={isLoading}
        />
        <FieldText
          required
          label="Google access token server URL"
          name="tokenServerUrl"
          value={userAttributes?.tokenServerUrl}
          onChange={onChange}
          disabled={isLoading}
        />
      </Fieldset>
      <Space>
        <Button disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Save configuration'}
        </Button>
      </Space>
    </Form>
  );
};
