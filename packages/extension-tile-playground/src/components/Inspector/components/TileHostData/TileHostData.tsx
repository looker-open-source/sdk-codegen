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
  const { isEditing, dashboardRunState, filters, isCrossFiltersEnabled } =
    tileHostData

  const printingMessage = lookerHostData?.isRendering
    ? 'Dashboard is printing'
    : 'Dashboard is NOT printing'

  const editingMessage = isEditing
    ? 'Dashboard is editing'
    : 'Dashboard is NOT editing'

  let dashboardRunStateMessage
  switch (dashboardRunState) {
    case DashboardRunState.LOADED:
      dashboardRunStateMessage = 'Dashboard has not started running'
      break
    case DashboardRunState.RUNNING:
      dashboardRunStateMessage = 'Dashboard is running'
      break
    case DashboardRunState.COMPLETE:
      dashboardRunStateMessage = 'Dashboard is NOT running'
      break

    default:
      dashboardRunStateMessage = 'Dashboard run state is unknown'
      break
  }
  const crossFiltersEnabledMessage = isCrossFiltersEnabled
    ? 'Cross filters are enabled'
    : 'Cross filters are NOT enabled'
  const filtersArray = Object.entries(filters)
    .map(([key, value]) => `${key}=${value}`)
    .join(', ')

  return (
    <Card>
      <CardContent>
        <Accordion2 label="Tile host data" defaultOpen>
          <SpaceVertical gap="small" mt="medium">
            <Paragraph>{printingMessage}</Paragraph>
            <Paragraph>{editingMessage}</Paragraph>
            <Paragraph>{dashboardRunStateMessage}</Paragraph>
            <Paragraph>{crossFiltersEnabledMessage}</Paragraph>
            <Paragraph>
              {filtersArray.length
                ? `Dashboard filters are ${filtersArray}`
                : 'Dashboard has no filters'}
            </Paragraph>
          </SpaceVertical>
        </Accordion2>
      </CardContent>
    </Card>
  )
}
