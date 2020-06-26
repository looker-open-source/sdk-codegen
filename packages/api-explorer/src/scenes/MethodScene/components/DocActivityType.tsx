import React, { FC } from 'react'
import { Code, Tooltip, Badge } from '@looker/components'
import { IMethod } from '@looker/sdk-codegen'

interface DocActivityTypeProps {
  method: IMethod
}
export const DocActivityType: FC<DocActivityTypeProps> = ({ method }) => (
  <>
    {method.activityType === 'db_query' && (
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
    )}
  </>
)
