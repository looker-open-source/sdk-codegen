import { IMethodResponse } from '@looker/sdk-codegen'
import React, { FC } from 'react'
import { Tooltip } from '@looker/components'

export interface DocPrimaryResponseProps {
  response: IMethodResponse
}

export const DocPrimaryResponse: FC<DocPrimaryResponseProps> = ({
  response,
}) => (
  <Tooltip
    content={`${response.description} ${response.mediaType}`}
    placement="bottom"
  >
    <span>{response.type.name}</span>
  </Tooltip>
)
