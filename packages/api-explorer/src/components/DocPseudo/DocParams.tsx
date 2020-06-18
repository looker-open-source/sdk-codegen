import { IParameter } from '@looker/sdk-codegen'
import React, { FC } from 'react'
import { Flex, FlexItem } from '@looker/components'

import { DocParam } from './DocParam'

export interface DocArgsProps {
  parameters: IParameter[]
}

export const DocParams: FC<DocArgsProps> = ({ parameters }) => (
  <Flex flexWrap="wrap">
    {parameters.map((a, index) => (
      <FlexItem key={index}>
        {index ? ', ' : ''}
        <DocParam parameter={a} key={index} />
      </FlexItem>
    ))}
  </Flex>
)
