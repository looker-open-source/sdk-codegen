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
import React, { useCallback, useContext, useState } from 'react'
import type { MouseEvent } from 'react'
import {
  Space,
  Accordion2,
  Card,
  CardContent,
  Grid,
  ButtonOutline,
  FieldToggleSwitch,
} from '@looker/components'
import { ExtensionContext40 } from '@looker/extension-sdk-react'

export const EventTester: React.FC = () => {
  const {
    extensionSDK,
    tileSDK,
    visualizationSDK,
    tileHostData: { dashboardFilters },
  } = useContext(ExtensionContext40)
  const [runDashboard, setRunDashboard] = useState(false)

  const addErrorClick = useCallback(() => {
    tileSDK.addError({
      title: 'Oh no',
      message: "I've fallen and I can't get up!",
      group: 'error_group_1',
    })
  }, [tileSDK])

  const clearErrorClick = useCallback(() => {
    tileSDK.clearError()
  }, [tileSDK])

  const toggleCrossFilterClick = useCallback(
    (event: MouseEvent) => {
      // TODO pivot and row data needs to be populated
      tileSDK.toggleCrossFilter({ pivot: {} as any, row: {} as any }, event)
    },
    [tileSDK]
  )

  const openDrillMenuClick = useCallback(
    (event: MouseEvent) => {
      // TODO links data needs to be populated
      tileSDK.openDrillMenu({ links: [] }, event)
    },
    [tileSDK]
  )

  const runDashboardClick = useCallback(() => {
    tileSDK.runDashboard()
  }, [tileSDK])

  const stopDashboardClick = useCallback(() => {
    tileSDK.stopDashboard()
  }, [tileSDK])

  const updateFiltersClick = useCallback(() => {
    const updatedFilter = {}
    Object.entries(dashboardFilters || {}).forEach(([key, value]) => {
      updatedFilter[key] = value
      if (key === 'State') {
        updatedFilter[key] =
          value === 'California' ? 'Washington' : 'California'
      } else if (typeof value === 'string') {
        updatedFilter[key] = value.split('').reverse().join('')
      }
    })
    tileSDK.updateFilters(updatedFilter, runDashboard)
  }, [tileSDK, dashboardFilters, runDashboard])

  const openScheduleDialogClick = useCallback(() => {
    tileSDK.openScheduleDialog()
  }, [tileSDK])

  const updateTileClick = useCallback(() => {
    extensionSDK.updateTitle(`Update tile title ${new Date().getSeconds()}`)
  }, [extensionSDK])

  const updateRowLimit = useCallback(() => {
    visualizationSDK.updateRowLimit(100)
  }, [visualizationSDK])

  return (
    <Card>
      <CardContent>
        <Accordion2 label="Event Tester" defaultOpen>
          <Grid columns={2} mt="medium">
            <ButtonOutline onClick={addErrorClick} width="100%">
              Test add error
            </ButtonOutline>
            <ButtonOutline onClick={clearErrorClick} width="100%">
              Test clear error
            </ButtonOutline>
            <ButtonOutline onClick={updateRowLimit} width="100%">
              Test Update Row Limit
            </ButtonOutline>
            <ButtonOutline onClick={openDrillMenuClick} width="100%">
              Test open drill menu
            </ButtonOutline>
            <ButtonOutline onClick={runDashboardClick} width="100%">
              Test run dashboard
            </ButtonOutline>
            <ButtonOutline onClick={stopDashboardClick} width="100%">
              Test stop dashboard
            </ButtonOutline>
            <Space width="100%">
              <ButtonOutline onClick={updateFiltersClick} width="50%">
                Test update filters
              </ButtonOutline>
              <FieldToggleSwitch
                label="Run dashboard"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setRunDashboard(event.target.checked)
                }
                on={runDashboard}
              ></FieldToggleSwitch>
            </Space>
            <ButtonOutline onClick={toggleCrossFilterClick} width="100%">
              Test toggle cross filter
            </ButtonOutline>
            <ButtonOutline onClick={openScheduleDialogClick} width="100%">
              Test open schedule dialog
            </ButtonOutline>
            <ButtonOutline onClick={updateTileClick} width="100%">
              Update title title
            </ButtonOutline>
          </Grid>
        </Accordion2>
      </CardContent>
    </Card>
  )
}
