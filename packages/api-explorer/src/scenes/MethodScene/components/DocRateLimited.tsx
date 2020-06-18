import React, { FC } from 'react'
import { Code, Tooltip } from '@looker/components'

export const DocRateLimited: FC = () => (
  <Tooltip
    placement="right"
    textAlign="left"
    content={'This endpoint is rate limited.'}
  >
    <Code color="palette.charcoal500">{'rate_limited'}</Code>
  </Tooltip>
)
