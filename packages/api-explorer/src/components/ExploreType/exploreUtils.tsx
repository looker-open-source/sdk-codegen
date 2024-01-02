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

import React from 'react';
import type { IconType } from '@looker/components';
import { FieldString, IdeFileManifest, IdeParameter } from '@looker/icons';
import { CalendarToday } from '@styled-icons/material/CalendarToday';
import { Check } from '@styled-icons/material/Check';
import { Code } from '@styled-icons/material/Code';
import { Link } from '@styled-icons/material/Link';
import { Toc } from '@styled-icons/material/Toc';
import { VpnKey } from '@styled-icons/material/VpnKey';
import { Tag } from '@styled-icons/material-rounded';
import { Email } from '@styled-icons/material-outlined';
import type { IType } from '@looker/sdk-codegen';
import { TypeOfType, typeOfType } from '@looker/sdk-codegen';

/**
 * Get the type or element type if this type is a collection
 * @param value type to pick
 */
export const pickType = (value: IType) => {
  const typed = typeOfType(value);
  switch (typed) {
    case TypeOfType.Intrinsic:
    case TypeOfType.Complex:
      return value;
    default:
      return value.elementType!;
  }
};

/**
 * Is this an expandable node?
 * @param level is the current level of the hierarchy
 * @param maxDepth is the maximum depth to expanded nested types. -1 = all (default), 0 = no expansion
 */
export const expandable = (level: number, maxDepth = -1) =>
  maxDepth === -1 || level <= maxDepth;

/**
 * Gets the properties for the "exploring" type
 * @param value type to pick
 */
export const pickTypeProps = (value: IType) => pickType(value).properties;

/**
 * Get the link prefix for the type
 * @param value type to link to
 */
export const typeLinkPrefix = (value: IType) => {
  const typed = typeOfType(value);
  switch (typed) {
    case TypeOfType.Hash:
      return 'Hash[';
    default:
      return '';
  }
};

/**
 * Get the link suffix for the type
 * @param value type to link to
 */
export const typeLinkSuffix = (value: IType) => {
  const typed = typeOfType(value);
  switch (typed) {
    case TypeOfType.Array:
    case TypeOfType.DelimArray:
      return '[]';
    case TypeOfType.Hash:
      return ']';
    default:
      return '';
  }
};

interface TypedIcon {
  icon: IconType;
  title: string;
}

/**
 * Determines the icon name for the type
 * @param value to iconize
 */
export const typeIcon = (value: IType): TypedIcon => {
  switch (value.className) {
    case 'ArrayType':
      return { icon: <Toc />, title: value.jsonName };
    case 'DelimArrayType':
      return { icon: <Toc />, title: value.jsonName };
    case 'HashType':
      return { icon: <IdeFileManifest />, title: value.jsonName };
    case 'EnumType':
      return { icon: <IdeParameter />, title: value.jsonName };
  }

  const type = pickType(value);
  switch (type.jsonName) {
    case 'boolean':
      return { icon: <Check />, title: type.jsonName };
    case 'int64':
    case 'integer':
    case 'float':
    case 'double':
      return { icon: <Tag />, title: type.jsonName };
    case 'string':
    case 'hostname':
    case 'uuid':
    case 'ipv4':
    case 'ipv6':
      return { icon: <FieldString />, title: type.jsonName };
    case 'email':
      return { icon: <Email />, title: type.jsonName };
    case 'password':
      return { icon: <VpnKey />, title: type.jsonName };
    case 'uri':
      return { icon: <Link />, title: type.jsonName };
    case 'datetime':
      return { icon: <CalendarToday />, title: type.jsonName };
    default:
      return { icon: <Code />, title: type.jsonName };
  }
};
