import React, { FC } from 'react'
import { Code, Tooltip } from '@looker/components'
import { IMethod } from '@looker/sdk-codegen'

interface DocRateLimitedProps {
  method: IMethod
}
export const DocRateLimited: FC<DocRateLimitedProps> = ({ method }) => (
  <>
    {method.rateLimited && (
      <>
        <Tooltip
          placement="right"
          textAlign="left"
          content={'This endpoint is rate limited.'}
        >
          <Code color="palette.charcoal500">{'rate_limited'}</Code>
        </Tooltip>
      </>
    )}
  </>
)
