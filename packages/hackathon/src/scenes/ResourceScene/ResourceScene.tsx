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
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  Field,
  Grid,
  Heading,
  Link,
  Paragraph,
  SelectMulti,
  Space,
  Text,
} from '@looker/components';
import { getExtensionSDK } from '@looker/extension-sdk';
import { Routes } from '../../routes/AppRouter';
import { ResourceTag, ResourceType, resources } from './resource_data';

interface ResourceSceneProps {}

const DOMAIN_PARAM = 'domain';
const TYPE_PARAM = 'type';

export const ResourceScene: FC<ResourceSceneProps> = () => {
  const history = useHistory();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);

  const domainFilterValues: string[] = urlParams.get(DOMAIN_PARAM)
    ? urlParams
        .get(DOMAIN_PARAM)!
        .split(',')
        .filter((v) => v !== '')
    : [];
  const typeFilterValues: string[] = urlParams.get(TYPE_PARAM)
    ? urlParams
        .get(TYPE_PARAM)!
        .split(',')
        .filter((v) => v !== '')
    : [];

  let selectedResources = resources;

  if (domainFilterValues.length !== 0) {
    selectedResources = selectedResources.filter(({ tag }) => {
      return domainFilterValues.includes(tag);
    });
  }

  if (typeFilterValues.length !== 0) {
    selectedResources = selectedResources.filter(({ type }) => {
      return typeFilterValues.includes(type);
    });
  }

  const updateFilterValues = (
    parameter: string,
    values: string[] | undefined
  ) => {
    const urlParams = new URLSearchParams(location.search);
    urlParams.set(parameter, values ? values.join(',') : '');
    history.push(`${Routes.RESOURCES}?${urlParams.toString()}`);
  };

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    getExtensionSDK().openBrowserWindow(e.currentTarget.href);
  };

  return (
    <>
      <Heading as="h2" fontSize="xxxlarge" fontWeight="medium">
        Resources
      </Heading>
      <Paragraph mb="medium">
        Here are videos, tutorials, demos, apis, datasets, and dev tools for
        your hacking needs. You can find more resources in our{' '}
        <Link href={'https://developers.looker.com'} onClick={onClick}>
          developer portal
        </Link>
        .
      </Paragraph>
      <Space>
        <Field
          label="Filter by type:"
          description="Defaults to all types when none selected."
          width="40vh"
        >
          <SelectMulti
            options={Object.keys(ResourceType).map((k) => ({
              value: ResourceType[k],
              label: ResourceType[k],
            }))}
            values={typeFilterValues}
            onChange={updateFilterValues.bind(null, TYPE_PARAM)}
          />
        </Field>
        <Field
          label="Filter by domain:"
          description="Defaults to all domains when none selected."
          width="40vh"
        >
          <SelectMulti
            options={Object.keys(ResourceTag).map((k) => ({
              value: ResourceTag[k],
              label: ResourceTag[k],
            }))}
            values={domainFilterValues}
            onChange={updateFilterValues.bind(null, DOMAIN_PARAM)}
          />
        </Field>
      </Space>
      <Grid pt="medium" columns={4}>
        {selectedResources.map((_k, index) => (
          <Link
            href={selectedResources[index].shortenedLink}
            key={index}
            onClick={onClick}
          >
            <Card raised key={index} height="25vh">
              <CardContent>
                <Text
                  fontSize="xxsmall"
                  textTransform="uppercase"
                  fontWeight="semiBold"
                  color="subdued"
                >
                  {selectedResources[index].type} —{' '}
                  {selectedResources[index].tag}
                </Text>
                <Heading fontSize="xlarge">
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
  );
};
