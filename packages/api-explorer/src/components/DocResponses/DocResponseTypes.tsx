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
import React, { FC, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  ButtonToggle,
  ButtonItem,
  Tree,
  TreeItem,
  Code,
  Flex,
  FlexItem,
  IconNames,
} from '@looker/components'
import { KeyedCollection, IMethodResponse } from '@looker/sdk-codegen'

import { buildTypePath } from '../../utils'
import { copyAndCleanResponse, ICleanType } from './utils'

interface DocTypeLinkProps {
  name: string
}

const nodeIcon = (type: string): IconNames => {
  switch (type) {
    case 'boolean':
      return 'FieldYesNo'
    case 'int64':
    case 'integer':
    case 'float':
    case 'double':
      return 'FieldNumber'
    case 'string':
    case 'hostname':
    case 'uuid':
    case 'ipv4':
    case 'ipv6':
      return 'FieldString'
    case 'email':
      return 'SendEmail'
    case 'password':
      return 'Key'
    case 'uri':
      return 'Link'
    case 'datetime':
      return 'FieldDate'
    default:
      return 'Code'
  }
}

const DocTypeLink: FC<DocTypeLinkProps> = ({ name }) => {
  switch (name) {
    case 'boolean':
    case 'int64':
    case 'integer':
    case 'float':
    case 'double':
    case 'string':
    case 'hostname':
    case 'uuid':
    case 'ipv4':
    case 'ipv6':
    case 'email':
    case 'password':
    case 'uri':
    case 'datetime':
      return <Code fontSize="small">{name}</Code>
    default: {
      if (name.startsWith('Hash[')) return <Code fontSize="small">{name}</Code>
      const link = name.endsWith('[]') ? name.substr(0, name.length - 2) : name
      // TODO get the real spec key to put in here
      return (
        <NavLink key={name} to={buildTypePath('4.0', name)}>
          {link}
        </NavLink>
      )
    }
  }
}

interface DocResponsePropProps {
  name: string
  val: string | ICleanType
}

const DocResponseProp: FC<DocResponsePropProps> = ({ name, val }) => {
  if (typeof val === 'object') {
    // It must be ICleanType to get here
    val = { ...val, ...{ name: `${name}: ${val.name}` } }
    return <DocResponseType response={val} open={false} />
  }
  return (
    <TreeItem icon={nodeIcon(val)}>
      <Flex flexWrap="nowrap" alignItems="baseline">
        <FlexItem width="20%" fontSize="small">
          <strong>{name}</strong>
        </FlexItem>
        <FlexItem width="40%">
          <DocTypeLink name={val} />
        </FlexItem>
      </Flex>
    </TreeItem>
  )
}

interface DocResponseTypeProps {
  response: ICleanType
  open?: boolean
}

export const DocResponseType: FC<DocResponseTypeProps> = ({
  response,
  open = true,
}) => {
  return (
    <Tree border label={response.name} icon="Code" defaultOpen={open}>
      {!!response.description && (
        <>
          <TreeItem key={response.name}>{response.description}</TreeItem>
        </>
      )}
      {Object.entries(response.properties).map(([name, val]) => (
        <>
          <DocResponseProp key={name} name={name} val={val} />
        </>
      ))}
    </Tree>
  )
}

interface DocResponseTypesProps {
  responses: KeyedCollection<IMethodResponse>
}

/**
 * Given a collection of media types (keys) and responses (values) for a response code, generate a group of buttons for
 * toggling media type and render the response
 * @param response
 */
export const DocResponseTypes: FC<DocResponseTypesProps> = ({ responses }) => {
  const mediaTypes = Object.keys(responses)
  const [selectedMediaType, setSelectedMediaType] = useState(mediaTypes[0])
  const [resps, setResps] = useState(responses)

  useEffect(() => {
    /** When new responses are passed, update the default selected media type */
    setSelectedMediaType(mediaTypes[0])
    setResps(responses)
  }, [responses])

  // TODO: Account for endpoints with no responses (e.g. delete a custom cmd)
  return (
    <>
      <ButtonToggle
        value={selectedMediaType}
        onChange={setSelectedMediaType}
        mt="large"
        mb="large"
      >
        {mediaTypes.map((mediaType) => (
          <ButtonItem key={mediaType}>{mediaType}</ButtonItem>
        ))}
      </ButtonToggle>
      <DocResponseType
        key={selectedMediaType}
        response={copyAndCleanResponse(resps[selectedMediaType], 2)}
      />
    </>
  )
}
