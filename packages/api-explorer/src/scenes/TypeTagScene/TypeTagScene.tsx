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
import React, { useEffect, useState } from 'react';
import { ButtonItem, ButtonToggle, Grid } from '@looker/components';
import type { ApiModel } from '@looker/sdk-codegen';
import { useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ApixSection, DocTitle, DocTypeSummary, Link } from '../../components';
import { buildTypePath, isValidFilter, useNavigation } from '../../utils';
import { selectTagFilter, useSettingActions } from '../../state';
import { useTagStoreSync } from '../utils';
import { getMetaTypes } from './utils';

interface TypeTagSceneProps {
  api: ApiModel;
}

interface TypeTagSceneParams {
  specKey: string;
  typeTag: string;
}

export const TypeTagScene: FC<TypeTagSceneProps> = ({ api }) => {
  const { specKey, typeTag } = useParams<TypeTagSceneParams>();
  const location = useLocation();
  const { navigate, buildPathWithGlobalParams, navigateWithGlobalParams } =
    useNavigation();
  const selectedTagFilter = useSelector(selectTagFilter);
  const { setTagFilterAction } = useSettingActions();
  const [tagFilter, setTagFilter] = useState(selectedTagFilter);
  useTagStoreSync();

  const handleChange = (filter: string) => {
    navigate(location.pathname, {
      t: filter === 'ALL' ? null : filter.toLowerCase(),
    });
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let verbParam = searchParams.get('t') || 'ALL';
    verbParam = isValidFilter(location.pathname, verbParam)
      ? verbParam.toUpperCase()
      : 'ALL';
    setTagFilterAction({
      tagFilter: verbParam,
    });
  }, [location.search]);

  const types = api.typeTags[typeTag];
  useEffect(() => {
    if (!types) {
      navigateWithGlobalParams(`/${specKey}/types`);
    }
  }, [types]);

  useEffect(() => {
    setTagFilter(selectedTagFilter);
  }, [selectedTagFilter]);

  if (!types) {
    return <></>;
  }

  const tag = Object.values(api.spec.tags!).find(tag => tag.name === typeTag)!;
  const metaTypes = getMetaTypes(types);
  return (
    <ApixSection>
      <DocTitle>{`${tag.name}: ${tag.description}`}</DocTitle>
      <ButtonToggle
        mb="small"
        mt="xlarge"
        value={tagFilter}
        onChange={handleChange}
      >
        <ButtonItem key="ALL" px="large" py="xsmall">
          ALL
        </ButtonItem>
        {metaTypes.map(op => (
          <ButtonItem key={op} px="large" py="xsmall">
            {op}
          </ButtonItem>
        ))}
      </ButtonToggle>
      {Object.values(types).map(
        (type, index) =>
          (selectedTagFilter === 'ALL' ||
            selectedTagFilter === type.metaType.toString().toUpperCase()) && (
            <Link
              key={index}
              to={buildPathWithGlobalParams(
                buildTypePath(specKey, tag.name, type.name)
              )}
            >
              <Grid columns={1} py="xsmall">
                <DocTypeSummary key={index} type={type} />
              </Grid>
            </Link>
          )
      )}
    </ApixSection>
  );
};
