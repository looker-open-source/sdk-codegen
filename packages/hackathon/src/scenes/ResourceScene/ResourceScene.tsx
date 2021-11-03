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
import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  Card,
  Grid,
  Link,
  Text,
  ButtonGroup,
  Heading,
  CardContent,
  ButtonItem,
  Paragraph,
  Field,
} from '@looker/components'
import { getExtensionSDK } from '@looker/extension-sdk'
import { Routes } from '../../routes/AppRouter'
import { resources, ResourceTag } from './resource_data'

interface ResourceSceneProps {}

export const ResourceScene: FC<ResourceSceneProps> = () => {
  const history = useHistory()
  const location = useLocation()

  const filterValues = (
    location.search
      ? new URLSearchParams(location.search.slice(1)).get('fv') || ''
      : ''
  )
    .split(',')
    .filter((fv) => fv !== '')

  const selectedResources =
    filterValues.length === 0
      ? resources
      : resources.filter((resource) => {
          return filterValues.includes(resource.tag)
        })

  const updateFilterValue = (values: string[]) => {
    const search = values.length === 0 ? '' : `?fv=${values.join(',')}`
    if (history.location.search !== search) {
      history.push(`${Routes.RESOURCES}${search}`)
    }
  }

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    getExtensionSDK().openBrowserWindow(e.currentTarget.href)
  }

  return (
    <>
      <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
        Resources
      </Heading>
      <Paragraph mb="medium">
        Here are videos, tutorials, demos, apis, datasets, and dev tools for
        your hacking needs.
      </Paragraph>
      <Field
        label="Filter by areas of interest:"
        description="Select 1 or more areas"
      >
        <ButtonGroup value={filterValues} onChange={updateFilterValue}>
          {Object.keys(ResourceTag).map((k) => (
            <ButtonItem key={k} value={ResourceTag[k]}>
              {ResourceTag[k]}
            </ButtonItem>
          ))}
        </ButtonGroup>
      </Field>
      <Grid pt="medium" columns={3}>
        {selectedResources.map((_k, index) => (
          <Link
            href={selectedResources[index].shortenedLink}
            key={index}
            onClick={onClick}
          >
            <Card raised key={index} height="25vh">
              <CardContent>
                <Text
                  fontSize="xsmall"
                  textTransform="uppercase"
                  fontWeight="semiBold"
                  color="subdued"
                >
                  {selectedResources[index].type} —{' '}
                  {selectedResources[index].tag}
                </Text>
                <Heading fontSize="xxxlarge">
                  {selectedResources[index].title}
                </Heading>
                <Heading as="h4" fontSize="small">
                  {selectedResources[index].content}
                </Heading>
              </CardContent>
            </Card>
          </Link>
        ))}
      </Grid>
    </>
  )
}
