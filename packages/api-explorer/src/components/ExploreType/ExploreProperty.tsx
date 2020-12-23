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
import {
  FlexItem,
  IconNames,
  Icon,
  Tree,
  TreeItem,
  Tooltip,
  Space,
} from '@looker/components'
import { IProperty } from '@looker/sdk-codegen'
import ReactMarkdown from 'react-markdown'
import { ExploreTypeLink, pickType, pickTypeProps, typeIcon } from '.'

interface TipIconProps {
  show: boolean
  tip: string
  icon: IconNames
}

export const TipIcon: FC<TipIconProps> = ({ show, tip, icon }) => {
  if (!show) return null
  return (
    <Tooltip content={tip}>
      <Icon name={icon} size="xsmall" content={tip} />
    </Tooltip>
  )
}

interface ExplorePropertyProps {
  property: IProperty
}

export const ExplorePropertyRequired: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is required`
  return <TipIcon show={property.required} icon="Check" tip={tip} />
}

export const ExplorePropertyDeprecated: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is deprecated`
  return <TipIcon show={property.deprecated} icon="Minus" tip={tip} />
}

export const ExplorePropertyReadOnly: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is read-only`
  return <TipIcon show={property.readOnly} icon="LockClosed" tip={tip} />
}

export const ExplorePropertyDescription: FC<ExplorePropertyProps> = ({
  property,
}) => {
  if (!property.description) return <></>
  return <ReactMarkdown source={property.description} />
}

/**
 * Show the details of the property
 * @param property
 * @constructor
 */
export const ExplorePropertyDetail: FC<ExplorePropertyProps> = ({
  property,
}) => {
  return (
    <Space>
      <FlexItem width="10rem">
        <ExploreTypeLink type={property.type} />
      </FlexItem>
      <FlexItem width="5rem">
        <ExplorePropertyRequired property={property} />
        <ExplorePropertyReadOnly property={property} />
        <ExplorePropertyDeprecated property={property} />
      </FlexItem>
      <FlexItem width="30rem">
        <ExplorePropertyDescription property={property} />
      </FlexItem>
    </Space>
  )
}

/**
 * Render the Tree or TreeItem for this property
 * @param property to display
 * @constructor
 */
export const ExploreProperty: FC<ExplorePropertyProps> = ({ property }) => {
  const picked = pickType(property.type)
  if (!picked.intrinsic) {
    return <ExplorePropertyType property={property} open={false} />
  }
  return (
    <TreeItem
      icon={typeIcon(property.type)}
      detail={<ExplorePropertyDetail property={property} />}
    >
      {property.jsonName}
    </TreeItem>
  )
}

interface ExplorePropertyTypeProps {
  property: IProperty
  open?: boolean
}

export const ExplorePropertyType: FC<ExplorePropertyTypeProps> = ({
  property,
  open = true,
}) => {
  const type = property.type
  const props = pickTypeProps(type)
  return (
    <Tree
      border
      label={`${property.jsonName}`}
      icon={typeIcon(type)}
      defaultOpen={open}
      detail={
        <>
          {' '}
          {!!type.description && (
            <TreeItem key={type.name}>{type.description}</TreeItem>
          )}
          <ExploreTypeLink type={property.type} />
        </>
      }
    >
      {Object.values(props).map((property) => (
        <ExploreProperty key={property.fullName} property={property} />
      ))}
    </Tree>
  )
}
