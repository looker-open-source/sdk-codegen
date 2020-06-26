import { Icon, Status, Tooltip } from '@looker/components'
import React, { FC } from 'react'
import { IMethod } from '@looker/sdk-codegen'

const pickTooltipContent = (status: string) => {
  switch (status.toLocaleLowerCase()) {
    case 'beta':
      return 'This beta endpoint is under development and subject to change.'
    case 'experimental':
      return 'This experimental endpoint will very likely change.'
    case 'deprecated':
      return 'This endpoint has been deprecated and will be removed in the future.'
    case 'stable':
      return 'This endpoint is considered stable for this API version.'
    default:
      return 'This endpoint has no status associated with it.'
  }
}

const pickStatus = (status: string) => {
  switch (status.toLocaleLowerCase()) {
    case 'beta':
      return <Status intent="warn" />
    case 'experimental':
      return <Icon name="Beaker" />
    case 'deprecated':
      return <Status intent="critical" />
    case 'stable':
      return <Status intent="positive" />
    default:
      return <Status intent="neutral" />
  }
}

interface DocSummaryStatusProps {
  method: IMethod
}
export const DocSummaryStatus: FC<DocSummaryStatusProps> = ({ method }) => {
  const status = pickStatus(method.status)
  const tooltipContent = pickTooltipContent(method.status)
  return <Tooltip content={<>{tooltipContent}</>}>{status}</Tooltip>
}
