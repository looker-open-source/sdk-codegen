import React, { FC } from 'react'
import { Code, Tooltip, Badge } from '@looker/components'

export const DocActivityType: FC = () => (
  <>
    <Code color="palette.charcoal500">{'db_query'}</Code>
    <Tooltip
      placement="right"
      textAlign="left"
      content={
        <>
          Call volume for this endpoint counts toward the "db_query" API
          activity category.
        </>
      }
    >
      <span>
        <Badge intent="neutral" fontWeight="light">
          $
        </Badge>
      </span>
    </Tooltip>
  </>
)
