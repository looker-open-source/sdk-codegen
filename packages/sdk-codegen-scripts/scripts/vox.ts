/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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

import * as path from 'path'
import * as fs from 'fs'
import { LookerNodeSDK } from '@looker/sdk-node'
import type { IArtifact, IGroup, IUser } from '@looker/sdk'
import {
  add_group_user,
  create_group,
  create_user,
  purge_artifacts,
  search_groups,
  search_users,
  update_artifacts,
} from '@looker/sdk'

const root = path.join(__dirname, '/../../../')
const indexFile = path.join(root, 'hackathons.json')
const compareFile = path.join(root, 'hackCompare.json')
const utf8 = { encoding: 'utf-8' }
const content = fs.readFileSync(indexFile, utf8)
const artifacts = JSON.parse(content) as IArtifact[]
const sdk = LookerNodeSDK.init40()
const groupName = 'Looker_hack: Hackathon:cloudbi'
const namespace = 'Hackathon'
let group: IGroup

/** gets all user records from the json snapshot */
const getUsers = () => {
  return artifacts.filter((x) => x.key.startsWith('User:')).map((x) => x)
}

/**
 * make or create the group for the hackathon identified by `groupName`
 * also sets the global `group` variable, so it can be referenced without a bunch
 * of extra API calls
 */
const findOrMakeGroup = async () => {
  if (group) return group
  const groups = await sdk.ok(search_groups(sdk, { name: groupName }))
  if (groups.length > 0) group = groups[0]
  else group = await sdk.ok(create_group(sdk, { name: groupName }))
  return group
}

/**
 * find all references for this user id in all artifact's value collection and update it
 * @param oldKey to match
 * @param newKey to use for replacement
 */
const swapUserId = (oldKey: string, newKey: string) => {
  if (oldKey === newKey) return // no swap required
  const _user_id = '_user_id'
  const user_id = 'user_id'
  artifacts.forEach((a) => {
    const val = JSON.parse(a.value)
    const uid = user_id in val ? user_id : _user_id
    if (uid in val && val[uid] === oldKey) {
      // console.log(`Swapping ${a.key} ${uid} ${oldKey} to ${newKey}`)
      val[uid] = newKey
      a.value = JSON.stringify(val)
    }
  })
}

/**
 * Finds or makes a user represented by the artifact
 * - creates if not found
 * - adds hackathon group if not registered
 *
 * @param art
 */
const findOrMakeUser = async (art: IArtifact) => {
  const f = JSON.parse(art.value)
  const users = await sdk.ok(
    search_users(sdk, {
      first_name: f.first_name,
      last_name: f.last_name,
      fields: 'id,first_name,last_name,group_ids',
    })
  )
  let user: IUser
  if (users.length > 0) {
    user = users[0]
  } else {
    user = await sdk.ok(
      create_user(sdk, { first_name: f.first_name, last_name: f.last_name })
    )
  }
  if (!user?.group_ids?.includes(group.id!)) {
    await sdk.ok(add_group_user(sdk, group.id!, { user_id: user.id! }))
  }
  const newKey = `User:${user.id}`
  swapUserId(art.key, newKey)
  art.key = newKey
}

// const removeHackUsers = async () => {
//   return
//   const hacks = await sdk.ok(search_users(sdk, { group_id: group.id! }))
//   for (const hack of hacks) {
//     await sdk.ok(delete_user(sdk, hack.id!))
//   }
// }

/** populate the missing users by name */
const populi = async () => {
  group = await findOrMakeGroup()
  // await removeHackUsers()
  const users = getUsers()
  for (const user of users) {
    await findOrMakeUser(user)
  }
}

/** set artifact versions to 0 so creating the artifact will work */
const prepArtifacts = () => {
  const keys = artifacts.map((o) => o.key)
  const prepped = artifacts.filter(
    ({ key }, index) => !keys.includes(key, index + 1)
  )
  prepped.forEach((a) => {
    a.version = 0
    const vals = JSON.parse(a.value)
    const keys = Object.keys(vals)
    for (const key of keys) {
      vals[key] =
        typeof vals[key] === 'string' ? encodeURI(vals[key]) : vals[key]
    }

    a.value = JSON.stringify(vals)
  })
  return prepped
}

;(async () => {
  await populi()
  const prepped = prepArtifacts()
  fs.writeFileSync(compareFile, JSON.stringify(artifacts, null, 2), utf8)
  console.log(
    `${artifacts.length} entries from ${indexFile}, ${prepped.length} prepped`
  )
  await sdk.ok(purge_artifacts(sdk, namespace))
  await sdk.ok(update_artifacts(sdk, namespace, prepped))
})()
