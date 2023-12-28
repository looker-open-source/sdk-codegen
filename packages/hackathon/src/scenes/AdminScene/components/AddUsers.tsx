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
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Form,
  Fieldset,
  Button,
  ProgressCircular,
  Space,
  SpaceVertical,
  Span,
  FieldText,
  MessageBar,
  Divider,
} from '@looker/components';
import type { UserToAdd } from '../../../data/add_user/actions';
import { parseCsv, addUsers } from '../../../data/add_user/actions';
import {
  getStage,
  getUsersAddedState,
  getNumUsersToAddState,
} from '../../../data/add_user/selectors';
import { ADD_STAGES } from '../../../data/add_user/reducer';

export interface AddUsersProps {}

export const AddUsers: FC<AddUsersProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [user, setUser] = useState<UserToAdd>({
    first: '',
    last: '',
    email: '',
  });
  const dispatch = useDispatch();
  const currentAddStage = useSelector(getStage);
  const numUsersToAdd = useSelector(getNumUsersToAddState);
  const numUsersAdded = useSelector(getUsersAddedState);

  const onMultiSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file !== null) {
      dispatch(parseCsv(file));
    }
  };

  const onSingleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(addUsers([user]));
  };

  const onMultiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const onSingleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUser = Object.assign({}, user);
    switch (e.target.name) {
      case 'userFirstName':
        newUser.first = e.target.value;
        break;
      case 'userLastName':
        newUser.last = e.target.value;
        break;
      case 'userEmail':
        newUser.email = e.target.value;
        break;
    }
    setUser(newUser);
  };

  return (
    <SpaceVertical width="40vw">
      <MessageBar noActions>
        {
          'These forms will check for existing Hackathon role, check/create group for default hackathon, attach Hackathon role to the group, create or enable and update user, add the user to the group, and set user attributes. Please reload the site after adding users.'
        }
      </MessageBar>
      {currentAddStage === ADD_STAGES.USERS_ADDING ? (
        <Space>
          <ProgressCircular size="small" />
          <div>{`${numUsersAdded} of ${numUsersToAdd} user added`}</div>
        </Space>
      ) : null}
      <Form onSubmit={onMultiSubmit} mt="large">
        <Fieldset legend="Add multiple users with CSV">
          <Span>{`First row should contain these column headers in order: 'first', 'last', 'email'`}</Span>
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            onChange={onMultiChange}
          />
        </Fieldset>
        <Space>
          <Button disabled={currentAddStage !== ADD_STAGES.INIT}>
            {'Add multiple users'}
          </Button>
        </Space>
      </Form>
      <Divider />
      <Form onSubmit={onSingleSubmit} mt="large">
        <Fieldset legend="Add single user">
          <SpaceVertical>
            <FieldText
              required
              label="User first name"
              name="userFirstName"
              onChange={onSingleChange}
              disabled={currentAddStage !== ADD_STAGES.INIT}
            />
            <FieldText
              required
              label="User last name"
              name="userLastName"
              onChange={onSingleChange}
              disabled={currentAddStage !== ADD_STAGES.INIT}
            />
            <FieldText
              required
              label="User email"
              name="userEmail"
              onChange={onSingleChange}
              disabled={currentAddStage !== ADD_STAGES.INIT}
            />
            <Button disabled={currentAddStage !== ADD_STAGES.INIT}>
              {'Add single user'}
            </Button>
          </SpaceVertical>
        </Fieldset>
      </Form>
    </SpaceVertical>
  );
};
