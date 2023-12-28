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
import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import { getCore40SDK } from '@looker/extension-sdk-react';
import type {
  IUser,
  IWriteUser,
  IRole,
  IGroup,
  IGroupSearch,
  IUserAttribute,
} from '@looker/sdk';
import { actionMessage } from '../common/actions';
import { parseCsv as parseCsvUtil } from '../../utils';
import { getCurrentHackathonState } from '../hack_session/selectors';
import type { UserToAdd, parseCsv } from './actions';
import {
  Actions,
  addUsers,
  incrementUsersAdded,
  resetAddUsers,
} from './actions';

const HACKATHON_ROLE_NAME = 'Hackathon';
const HACKATHON_USER_ATTR_NAME = 'hackathon'; // case sensitive
const HACKATHON_USER_ATTR_LABEL = 'Hackathon';
const HACKATHON_GROUP_PREFIX = 'Looker_Hack: ';
const LANDING_PAGE_ATTR_NAME = 'landing_page';
const LANDING_PAGE_PATH = '/extensions/hackathon::hackathon';

function* parseCsvSaga(action: ReturnType<typeof parseCsv>): SagaIterator {
  try {
    const rows: Array<UserToAdd> = yield call(parseCsvUtil, action.payload);
    const validationErrors = validateRows(rows);
    if (validationErrors.length === 0) {
      yield put(addUsers(rows));
    } else {
      throw new Error(`Invalid csv rows: ${validationErrors}`);
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(
      actionMessage(
        'A problem occurred loading and parsing the csv',
        'critical'
      )
    );
  }
}

// Only checks for non empty fields
const validateRows = (rows: Array<UserToAdd>): Array<string> => {
  const validationErrors: Array<string> = [];
  rows.forEach((r, i) => {
    if (!r.first || !r.last || !r.email) {
      validationErrors.push(`Row ${i + 1} field empty`);
    }
  });
  return validationErrors;
};

function* addUsersSaga(action: ReturnType<typeof addUsers>): SagaIterator {
  try {
    const lookerSdk = getCore40SDK();
    const hackathonRole: IRole = yield call(getHackathonRole);
    const hackathonGroup: IGroup = yield call(
      setupHackathonGroup,
      hackathonRole
    );

    for (let i = 0; i < action.payload.length; i++) {
      const { first, last, email } = action.payload[i];
      const user: IUser = yield call(
        createUpdateEnableUserByEmail,
        first,
        last,
        email
      );

      if (!user.credentials_email) {
        let result = yield call(
          [lookerSdk, lookerSdk.create_user_credentials_email],
          user.id as string,
          { email }
        );
        yield call([lookerSdk, lookerSdk.ok], result);
        result = yield call(
          [lookerSdk, lookerSdk.send_user_credentials_email_password_reset],
          user.id as string
        );
        yield call([lookerSdk, lookerSdk.ok], result);
      }

      if (!user.credentials_api3 || user.credentials_api3.length === 0) {
        const result = yield call(
          [lookerSdk, lookerSdk.create_user_credentials_api3],
          user.id as string
        );
        yield call([lookerSdk, lookerSdk.ok], result);
      }

      const result = yield call(
        [lookerSdk, lookerSdk.add_group_user],
        hackathonGroup.id as string,
        { user_id: user.id }
      );
      yield call([lookerSdk, lookerSdk.ok], result);

      yield call(setUserHackathonAttribute, user);
      yield put(incrementUsersAdded());
    }
    yield put(
      actionMessage(
        `Successfully added ${action.payload.length} user(s). Please reload the site to see added users.`,
        'positive'
      )
    );
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    yield put(actionMessage('A problem occurred adding users', 'critical'));
    yield put(resetAddUsers());
  }
}

// User identity based off email. If email exists, then user's first and last
// name are updated, if not, user is created. User is always enabled.
function* createUpdateEnableUserByEmail(
  first: string,
  last: string,
  email: string
): SagaIterator {
  const lookerSdk = getCore40SDK();
  const fieldsToUpdate: IWriteUser = {
    first_name: first,
    last_name: last,
    is_disabled: false, // enable the user
  };

  let result = yield call([lookerSdk, lookerSdk.search_users], { email });
  const userResults: Array<IUser> = yield call(
    [lookerSdk, lookerSdk.ok],
    result
  );

  let lookerUser: IUser;
  if (userResults.length > 0) {
    lookerUser = userResults[0];
    if (
      lookerUser.first_name !== first ||
      lookerUser.last_name !== last ||
      lookerUser.is_disabled
    ) {
      result = yield call(
        [lookerSdk, lookerSdk.update_user],
        lookerUser.id as string,
        fieldsToUpdate
      );
      lookerUser = yield call([lookerSdk, lookerSdk.ok], result);
    }
  } else {
    result = yield call([lookerSdk, lookerSdk.create_user], fieldsToUpdate);
    lookerUser = yield call([lookerSdk, lookerSdk.ok], result);
  }
  return lookerUser;
}

function* getHackathonRole(): SagaIterator {
  const lookerSdk = getCore40SDK();
  const result = yield call([lookerSdk, lookerSdk.search_roles], {
    name: HACKATHON_ROLE_NAME,
  });
  const roles: IRole[] = yield call([lookerSdk, lookerSdk.ok], result);

  if (roles.length === 0) {
    throw new Error(
      `No Hackathon Role exists. Please create role with 'Hackathon' name`
    );
  } else {
    return roles[0];
  }
}

function* setupHackathonGroup(hackathonRole: IRole): SagaIterator {
  const lookerSdk = getCore40SDK();
  const { _id: currentHackathonId } = yield select(getCurrentHackathonState);

  let result = yield call([lookerSdk, lookerSdk.search_groups_with_roles], {
    name: `${HACKATHON_GROUP_PREFIX}${currentHackathonId}`,
  });
  const groups: IGroupSearch[] = yield call([lookerSdk, lookerSdk.ok], result);

  if (groups.length > 1) {
    throw Error("Multiple 'Looker_Hack:' groups with same name");
  } else if (groups.length === 1) {
    return groups[0];
  } else {
    result = yield call([lookerSdk, lookerSdk.create_group], {
      name: `${HACKATHON_GROUP_PREFIX}${currentHackathonId}`,
    });
    const newGroup: IGroup = yield call([lookerSdk, lookerSdk.ok], result);

    result = yield call(
      [lookerSdk, lookerSdk.role_groups],
      hackathonRole.id as string
    );
    const oldRoleGroups: IGroup[] = yield call(
      [lookerSdk, lookerSdk.ok],
      result
    );

    const newRoleGroupIds: string[] = oldRoleGroups
      .map((g) => g.id as string)
      .concat(newGroup.id as string);

    result = yield call(
      [lookerSdk, lookerSdk.set_role_groups],
      hackathonRole.id as string,
      newRoleGroupIds
    );
    yield call([lookerSdk, lookerSdk.ok], result);

    const landingPageAttrId = yield call(
      getUserAttributeId,
      LANDING_PAGE_ATTR_NAME
    );

    result = yield call(
      [lookerSdk, lookerSdk.set_user_attribute_group_values],
      landingPageAttrId,
      [
        {
          group_id: newGroup.id,
          value: LANDING_PAGE_PATH,
        },
      ]
    );
    yield call([lookerSdk, lookerSdk.ok], result);

    return newGroup;
  }
}

function* setUserHackathonAttribute(user: IUser): SagaIterator {
  const lookerSdk = getCore40SDK();
  let hackathonAttrId: string = yield call(
    getUserAttributeId,
    HACKATHON_USER_ATTR_NAME
  );

  if (!hackathonAttrId) {
    const result = yield call([lookerSdk, lookerSdk.create_user_attribute], {
      name: HACKATHON_USER_ATTR_NAME,
      label: HACKATHON_USER_ATTR_LABEL,
      type: 'string',
    });
    const newAttribute: IUserAttribute = yield call(
      [lookerSdk, lookerSdk.ok],
      result
    );
    hackathonAttrId = newAttribute.id as string;
  }

  const { _id: currentHackathonId } = yield select(getCurrentHackathonState);
  const result = yield call(
    [lookerSdk, lookerSdk.set_user_attribute_user_value],
    user.id as string,
    hackathonAttrId,
    { value: currentHackathonId }
  );
  yield call([lookerSdk, lookerSdk.ok], result);
}

function* getUserAttributeId(name: string): SagaIterator<string | undefined> {
  const lookerSdk = getCore40SDK();

  const result = yield call([lookerSdk, lookerSdk.all_user_attributes], {
    fields: 'id,name',
  });
  const userAttributes: IUserAttribute[] = yield call(
    [lookerSdk, lookerSdk.ok],
    result
  );

  return userAttributes.find((a) => a.name === name)?.id;
}

export function* registerAddUserSagas() {
  yield all([takeLeading(Actions.PARSE_CSV, parseCsvSaga)]);
  yield all([takeLeading(Actions.ADD_USERS, addUsersSaga)]);
}
