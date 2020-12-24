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
import { Code, Tree, TreeItem } from '@looker/components'
import { NavLink } from 'react-router-dom'
import { IType, TypeOfType, typeOfType } from '@looker/sdk-codegen'
import { buildTypePath } from '../../utils'
import {
  ExploreProperty,
  pickType,
  pickTypeProps,
  typeIcon,
  typeLinkPrefix,
  typeLinkSuffix,
} from '.'

interface ExploreTypeLinkProps {
  type: IType
}

export const ExploreTypeLink: FC<ExploreTypeLinkProps> = ({ type }) => {
  const picked = pickType(type)
  const name = picked.name
  const prefix = typeLinkPrefix(type)
  const suffix = typeLinkSuffix(type)
  const typed = typeOfType(picked)
  switch (typed) {
    case TypeOfType.Intrinsic:
      return <Code fontSize="small">{type.jsonName}</Code>
    default: {
      // TODO get the real spec key to put in here
      return (
        <>
          {prefix}
          <NavLink key={type.fullName} to={buildTypePath('4.0', name)}>
            {name}
          </NavLink>
          {suffix}
        </>
      )
    }
  }
}

interface ExploreTypeProps {
  type: IType
  open?: boolean
  link?: boolean
}

export const ExploreType: FC<ExploreTypeProps> = ({
  type,
  open = true,
  link = false,
}) => {
  const props = pickTypeProps(type)
  return (
    <Tree
      border
      label={type.name}
      icon={typeIcon(type)}
      defaultOpen={open}
      detail={
        <>
          {!!type.description && (
            <TreeItem key={type.name}>{type.description}</TreeItem>
          )}
          {link && <ExploreTypeLink type={type} />}
        </>
      }
    >
      {Object.values(props).map((property) => (
        <ExploreProperty key={property.fullName} property={property} />
      ))}
    </Tree>
  )
}
