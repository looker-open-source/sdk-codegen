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

import React, { FC } from 'react'
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
} from '@looker/components'
import { Routes } from '../../routes/AppRouter'
import { resources } from './resource_data'

interface ResourceSceneProps {}

export const ResourceScene: FC<ResourceSceneProps> = () => {
  const history = useHistory()
  const location = useLocation()

  const filterValues = (location.search
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

  return (
    <>
      <Heading as="h4" fontWeight="bold" px="medium">
        Select a technology:
      </Heading>
      <ButtonGroup
        px="medium"
        pt="small"
        value={filterValues}
        onChange={updateFilterValue}
      >
        <ButtonItem value="embed">Embed</ButtonItem>
        <ButtonItem value="extension">Extensions</ButtonItem>
        <ButtonItem value="lookml">LookML</ButtonItem>
        <ButtonItem value="action">Actions</ButtonItem>
        <ButtonItem value="api">API</ButtonItem>
        <ButtonItem value="viz">Custom Viz</ButtonItem>
        <ButtonItem value="devtool">Dev Tools</ButtonItem>
        <ButtonItem value="other">Other</ButtonItem>
      </ButtonGroup>
      <Grid padding="medium" columns={3}>
        {selectedResources.map((_k, index) => (
          <Link
            href={selectedResources[index].link}
            target="_blank"
            key={index}
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
