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

import React, { FC } from 'react'
import { Code, Tree, TreeItem } from '@looker/components'
import { IType, TypeOfType, typeOfType } from '@looker/sdk-codegen'
import { useLocation } from 'react-router'
import { Link } from '../Link'
import { buildTypePath } from '../../utils'
import { getSpecKey } from '../../reducers'
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
  const location = useLocation()
  const picked = pickType(type)
  const name = picked.name
  const prefix = typeLinkPrefix(type)
  const suffix = typeLinkSuffix(type)
  const typed = typeOfType(picked)
  if (typed === TypeOfType.Intrinsic)
    return <Code fontSize="small">{type.jsonName}</Code>

  const specKey = getSpecKey(location)
  return (
    <>
      {prefix}
      <Link key={type.fullName} to={buildTypePath(specKey, name)}>
        {name}
      </Link>
      {suffix}
    </>
  )
}

interface ExploreTypeProps {
  /** Type to explore */
  type: IType
  /** Open the node display immediately */
  open?: boolean
  /** Create a link to the type? */
  link?: boolean
  /** the nesting level of the type */
  level?: number
  /** the maximum depth to expanded nested types. -1 = all (default), 0 = no expansion */
  maxDepth?: number
  /** open all nodes immediately? */
  openAll?: boolean
}

export const ExploreType: FC<ExploreTypeProps> = ({
  type,
  open = true,
  link = false,
  level = 0,
  maxDepth = -1,
  openAll = false,
}) => {
  const props = pickTypeProps(type)
  const nest = maxDepth === -1 || level < maxDepth
  const legend = typeIcon(type)
  return (
    <Tree
      border
      label={type.name}
      icon={legend.icon}
      defaultOpen={open || openAll}
      density={-3}
      detail={
        <>
          {!!type.description && (
            <TreeItem key={type.name}>{type.description}</TreeItem>
          )}
          {link && <ExploreTypeLink type={type} />}
        </>
      }
    >
      {nest &&
        Object.values(props).map((property) => (
          <ExploreProperty
            key={property.fullName}
            property={property}
            level={level + 1}
            maxDepth={maxDepth}
            openAll={openAll}
          />
        ))}
    </Tree>
  )
}
