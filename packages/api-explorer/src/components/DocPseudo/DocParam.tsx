import React, { FC } from 'react'
import { IParameter } from '@looker/sdk-codegen'
import { Tooltip } from '@looker/components'

export interface DocArgProps {
  parameter: IParameter
}

export const DocParam: FC<DocArgProps> = ({ parameter }) => (
  <Tooltip
    content={`${parameter.type.name} ${parameter.description}`}
    placement="bottom"
  >
    <span>{parameter.required ? parameter.name : `[${parameter.name}]`}</span>
  </Tooltip>
)
