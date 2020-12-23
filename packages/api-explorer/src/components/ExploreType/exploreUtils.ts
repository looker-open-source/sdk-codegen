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

import { IconNames } from '@looker/components'
import { IType, TypeOfType, typeOfType } from '@looker/sdk-codegen'

/**
 * Get the type or element type if this type is a collection
 * @param value type to pick
 */
export const pickType = (value: IType) => {
  const typed = typeOfType(value)
  switch (typed) {
    case TypeOfType.Intrinsic:
    case TypeOfType.Complex:
      return value
    default:
      return value.elementType!
  }
}

/**
 * Gets the properties for the "exploring" type
 * @param value type to pick
 */
export const pickTypeProps = (value: IType) => pickType(value).properties

/**
 * Get the link prefix for the type
 * @param value type to link to
 */
export const typeLinkPrefix = (value: IType) => {
  const typed = typeOfType(value)
  switch (typed) {
    case TypeOfType.Hash:
      return 'Hash['
    default:
      return ''
  }
}

/**
 * Get the link suffix for the type
 * @param value type to link to
 */
export const typeLinkSuffix = (value: IType) => {
  const typed = typeOfType(value)
  switch (typed) {
    case TypeOfType.Array:
    case TypeOfType.DelimArray:
      return '[]'
    case TypeOfType.Hash:
      return ']'
    default:
      return ''
  }
}

/**
 * Determines the icon name for the type
 * @param value to iconize
 */
export const typeIcon = (value: IType): IconNames => {
  switch (value.className) {
    case 'ArrayType':
    case 'DelimArrayType':
      return 'ChartSingleRecord'
    case 'HashType':
      return 'IdeFileManifest'
    case 'EnumType':
      return 'IdeParameter'
  }

  const type = pickType(value)
  switch (type.jsonName) {
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
