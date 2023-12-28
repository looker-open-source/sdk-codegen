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
import type { IconType } from '@looker/components';
import {
  Box,
  Icon,
  Tree,
  TreeItem,
  Tooltip,
  Space,
  Paragraph,
} from '@looker/components';
import { Done } from '@styled-icons/material/Done';
import { Lock } from '@styled-icons/material/Lock';
import { Remove } from '@styled-icons/material/Remove';
import type { IProperty, ApiModel } from '@looker/sdk-codegen';
import { Markdown } from '@looker/code-editor';
import {
  expandable,
  ExploreTypeLink,
  pickType,
  pickTypeProps,
  typeIcon,
} from '.';

interface TipIconProps {
  show: boolean;
  tip: string;
  icon: IconType;
  title: string;
}

/**
 * Show a tip with icon if show is true
 * @param show true to show tip and icon
 * @param tip to display on hover
 * @param icon name to use
 * @param title for icon
 * @constructor
 */
export const TipIcon: FC<TipIconProps> = ({ show, tip, icon, title }) => {
  if (!show) return <></>;
  return (
    <Tooltip content={tip}>
      <Icon icon={icon} size="xsmall" content={tip} title={title} />
    </Tooltip>
  );
};

/**
 * Interface shared by several ExploreProperty components
 */
interface ExplorePropertyProps {
  /** property to explore */
  property: IProperty;
  /** the current level of the hierarchy */
  level?: number;
  /** the maximum depth to expanded nested types. -1 = all (default), 0 = no expansion */
  maxDepth?: number;
  /** open all nodes immediately? */
  openAll?: boolean;
}

/**
 * Show required status if a property is required
 * @param property to describe
 * @constructor
 */
export const ExplorePropertyRequired: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is required`;
  return (
    <TipIcon
      show={property.required}
      icon={<Done />}
      tip={tip}
      title="required property"
    />
  );
};

/**
 * Show deprecated status if a property is deprecated
 * @param property to describe
 * @constructor
 */
export const ExplorePropertyDeprecated: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is deprecated`;
  return (
    <TipIcon
      show={property.deprecated}
      icon={<Remove />}
      tip={tip}
      title="deprecated property"
    />
  );
};

/**
 * Show read-only status if a property is read-only
 * @param property to describe
 * @constructor
 */
export const ExplorePropertyReadOnly: FC<ExplorePropertyProps> = ({
  property,
}) => {
  const tip = `${property.fullName} is read-only`;
  return (
    <TipIcon
      show={property.readOnly}
      icon={<Lock />}
      tip={tip}
      title="read-only property"
    />
  );
};

/**
 * Display the property description if it's assigned
 * @param property to describe
 * @constructor
 */
const DescriptionParagraph: FC = (props) => (
  <Paragraph fontSize="small" m="none" {...props} />
);

const ExplorePropertyDescription: FC<ExplorePropertyProps> = ({ property }) =>
  property.description ? (
    <Markdown
      source={property.description}
      paragraphOverride={DescriptionParagraph}
    />
  ) : null;

interface ExploreApiPropertyProps extends ExplorePropertyProps {
  /** parsed api */
  api: ApiModel;
}

/**
 * Show the details of the property
 * @param property
 * @constructor
 */
export const ExplorePropertyDetail: FC<ExploreApiPropertyProps> = ({
  property,
  api,
}) => (
  <Space style={{ fontSize: 'small', marginLeft: '10rem' }}>
    <Box width="10rem">
      <ExploreTypeLink type={property.type} api={api} />
    </Box>
    <Box width="5rem">
      <ExplorePropertyRequired property={property} />
      <ExplorePropertyReadOnly property={property} />
      <ExplorePropertyDeprecated property={property} />
    </Box>
    <Box width="30rem">
      <ExplorePropertyDescription property={property} />
    </Box>
  </Space>
);

/**
 * Render a potentially complex property as a non-expanding node
 * @param property to display
 * @constructor
 */
export const ExplorePropertyNode: FC<ExploreApiPropertyProps> = ({
  property,
  api,
}) => {
  const legend = typeIcon(property.type);
  return (
    <TreeItem
      {...legend}
      detail={<ExplorePropertyDetail api={api} property={property} />}
    >
      {property.jsonName}
    </TreeItem>
  );
};

/**
 * Render the Tree or TreeItem for this property
 * @param property to display
 * @param level current nesting level
 * @param maxDepth maximum depth to expand
 * @param openAll expands entire tree if true
 * @constructor
 */
export const ExploreProperty: FC<ExploreApiPropertyProps> = ({
  property,
  api,
  level = 0,
  maxDepth = -1,
  openAll = false,
}) => {
  const picked = pickType(property.type);
  if (!picked.intrinsic) {
    return (
      <ExplorePropertyType
        api={api}
        property={property}
        open={false}
        level={level + 1}
        maxDepth={maxDepth}
        openAll={openAll}
      />
    );
  }
  return <ExplorePropertyNode api={api} property={property} />;
};

interface ExplorePropertyTypeProps extends ExploreApiPropertyProps {
  /** Open the node display immediately? */
  open?: boolean;
}

export const ExplorePropertyType: FC<ExplorePropertyTypeProps> = ({
  property,
  api,
  open = true,
  level = 0,
  maxDepth = -1,
  openAll = false,
}) => {
  const type = property.type;
  const props = pickTypeProps(type);
  const nest = expandable(level, maxDepth);
  const legend = typeIcon(type);
  if (!nest) {
    return <ExplorePropertyNode api={api} property={property} />;
  }
  return (
    <Tree
      border
      label={`${property.jsonName}`}
      icon={legend.icon}
      defaultOpen={open || openAll}
      density={-3}
      detail={<ExplorePropertyDetail api={api} property={property} />}
    >
      {Object.values(props).map((property) => (
        <ExploreProperty
          api={api}
          key={property.fullName}
          property={property}
          level={level + 1}
          maxDepth={maxDepth}
          openAll={openAll}
        />
      ))}
    </Tree>
  );
};
