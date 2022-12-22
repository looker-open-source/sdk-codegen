/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useContext } from 'react'
import {
  Accordion2,
  Card,
  CardContent,
  SpaceVertical,
  Paragraph,
} from '@looker/components'
import { ExtensionContext40 } from '@looker/extension-sdk-react'
import { DashboardRunState } from '@looker/extension-sdk'

export const TileHostData: React.FC = () => {
  const { tileHostData, lookerHostData } = useContext(ExtensionContext40)
  const {
    dashboardId,
    elementId,
    queryId,
    querySlug,
    isExploring,
    isDashboardEditing,
    dashboardRunState,
    dashboardFilters,
    isDashboardCrossFilteringEnabled,
    lastRunStartTime,
    lastRunEndTime,
    lastRunSuccess,
    lastRunSourceElementId,
  } = tileHostData

  const dashboardIdMessage = `Dashboard id is "${
    dashboardId || ''
  }". Element id is "${elementId || ''}".`

  const queryIdMessage = `Query id is "${queryId || ''}". Query slug is "${
    querySlug || ''
  }".`

  const dashboardPrintingMessage =
    lookerHostData?.isRendering && dashboardId
      ? 'Dashboard is printing'
      : 'Dashboard is NOT printing'

  const exploringMessage =
    isExploring && 'Extension visualization is being configured in exlore'

  const dashboardEditingMessage = isDashboardEditing
    ? 'Dashboard is editing'
    : 'Dashboard is NOT editing'

  let dashboardRunStateMessage
  switch (dashboardRunState) {
    case DashboardRunState.RUNNING:
      dashboardRunStateMessage = 'Dashboard queries are running'
      break
    case DashboardRunState.NOT_RUNNING:
      dashboardRunStateMessage = 'Dashboard queries are not running'
      break
    default:
      dashboardRunStateMessage = 'Query run state is unknown'
      break
  }

  const lastDashboardRunMessage = lastRunStartTime
    ? `Last start time: ${lastRunStartTime || ''}, last end time: ${
        lastRunEndTime || ''
      }, last success: ${lastRunSuccess || ''}, initiated by: ${
        lastRunSourceElementId || ''
      }`
    : 'The dashboard has not run yet'

  const dashboardCrossFiltersEnabledMessage = isDashboardCrossFilteringEnabled
    ? 'Dashboard cross filters are enabled'
    : 'DashboardCross filters are NOT enabled'

  const filtersArray = Object.entries(dashboardFilters || {})
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')

  return (
    <Card>
      <CardContent>
        <Accordion2 label="Tile host data" defaultOpen>
          <SpaceVertical gap="small" mt="medium">
            {isExploring && <Paragraph>{exploringMessage}</Paragraph>}
            {!isExploring && (
              <>
                <Paragraph>{dashboardIdMessage}</Paragraph>
                <Paragraph>{queryIdMessage}</Paragraph>
                <Paragraph>{dashboardPrintingMessage}</Paragraph>
                <Paragraph>{dashboardEditingMessage}</Paragraph>
                <Paragraph>{dashboardRunStateMessage}</Paragraph>
                <Paragraph>{lastDashboardRunMessage}</Paragraph>
                <Paragraph>{dashboardCrossFiltersEnabledMessage}</Paragraph>
                <Paragraph>
                  {filtersArray.length
                    ? `Dashboard filters are ${filtersArray}`
                    : 'Dashboard has no filters'}
                </Paragraph>
              </>
            )}
          </SpaceVertical>
        </Accordion2>
      </CardContent>
    </Card>
  )
}
