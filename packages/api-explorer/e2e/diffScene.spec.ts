/*

 MIT License

 Copyright (c) 2021 Looker Data Sciences, Inc.

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
import '@testing-library/jest-dom'

import { goToPage, BASE_URL } from './helpers'

// https://github.com/smooth-code/jest-puppeteer/tree/master/packages/expect-puppeteer
// https://github.com/puppeteer/puppeteer/blob/main/docs/api.md

jest.setTimeout(120000)

const resultCardsSelector =
  'section#top div[class*=SpaceVertical] div[class*=Card]'
const baseInputSelector = 'input#listbox-input-base'
const compInputSelector = 'input#listbox-input-compare'
const globalOptionsSelector = '#modal-root [role=option] span'
const switchButtonSelector = '.switch-button'

describe.skip('Diff Scene', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
    await page.setDefaultNavigationTimeout(120000)
  })

  afterEach(async () => {
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  it('loads the default scene (/3.1/diff)', async () => {
    await goToPage(`${BASE_URL}/3.1/diff`)
    const body = await page.$('body')

    // "Base" input element
    {
      await body?.click()
      const baseInputElement = await page.$(baseInputSelector)
      expect(baseInputElement).not.toBeNull()
      const baseInputValue = await page.evaluate(
        (e) => e.value,
        baseInputElement
      )
      expect(baseInputValue).toMatch('3.1')

      const baseOptionsOnLoad = await page.$(globalOptionsSelector)
      expect(baseOptionsOnLoad).toBeNull()

      await baseInputElement?.click()
      const baseOptionsOnClick = await page.$$(globalOptionsSelector)
      expect(baseOptionsOnClick).not.toHaveLength(0)

      await body?.click()
      const baseOptionsOnClose = await page.$(globalOptionsSelector)
      expect(baseOptionsOnClose).toBeNull()
    }

    // "Comparison" input element
    {
      await body?.click()
      const compInputElement = await page.$(compInputSelector)
      expect(compInputElement).not.toBeNull()
      const compInputValue = await page.evaluate(
        (e) => e.value,
        compInputElement
      )
      expect(compInputValue).toEqual('')

      const compOptionsOnLoad = await page.$(globalOptionsSelector)
      expect(compOptionsOnLoad).toBeNull()

      await compInputElement?.click()
      const compOptionsOnClick = await page.$$(globalOptionsSelector)
      expect(compOptionsOnClick).not.toHaveLength(0)

      await body?.click()
      const compOptionsOnClose = await page.$(globalOptionsSelector)
      expect(compOptionsOnClose).toBeNull()
    }

    // Switch button (disabled)
    {
      const switchButtonElement = await page.$(switchButtonSelector)
      expect(switchButtonElement).not.toBeNull()
      const switchButtonDisabled = await page.evaluate(
        (e) => e.disabled,
        switchButtonElement
      )
      expect(switchButtonDisabled).toEqual(true)
    }
  })

  it('loads a comparison scene (/3.1/diff/4.0) and navigates from it', async () => {
    await goToPage(`${BASE_URL}/3.1/diff/4.0`)
    // "Base" input element
    {
      const baseInputElement = await page.$(baseInputSelector)
      expect(baseInputElement).not.toBeNull()
      const baseInputValue = await page.evaluate(
        (e) => e.value,
        baseInputElement
      )
      expect(baseInputValue).toMatch('3.1')
    }

    // "Comparison" input element
    {
      const compInputElement = await page.$(compInputSelector)
      expect(compInputElement).not.toBeNull()
      const compInputValue = await page.evaluate(
        (e) => e.value,
        compInputElement
      )
      expect(compInputValue).toMatch('4.0')
    }

    // Switch button
    {
      const switchButtonElement = await page.$(switchButtonSelector)
      expect(switchButtonElement).not.toBeNull()
      const switchButtonDisabled = await page.evaluate(
        (e) => e.disabled,
        switchButtonElement
      )
      expect(switchButtonDisabled).toEqual(false)
    }

    // Diff results
    {
      const diffResultCards = await page.$$(resultCardsSelector)
      expect(diffResultCards).not.toHaveLength(0)
      const page1Methods = await Promise.all(
        diffResultCards.map((resultCard) =>
          page.evaluate((el) => el.innerText.match(/^[a-z_]*/)[0], resultCard)
        )
      )
      expect(page1Methods).toHaveLength(15)
      expect(page1Methods).toContain('delete_board_item')
    }

    // Expand a result
    {
      const expandedSelector =
        resultCardsSelector + `>div[class*=Accordion2]>div[aria-expanded=true]`

      // Initially not expanded
      const expandedCardBefore = await page.$(expandedSelector)
      expect(expandedCardBefore).toBeNull()

      // Click a card
      const firstResultCard = (await page.$$(resultCardsSelector))[0]
      await firstResultCard.click()

      // Expanded
      const expandedCardAfter = await page.$(expandedSelector)
      expect(expandedCardAfter).not.toBeNull()

      // Find and validate method link
      const methodLink = await page.$(`${resultCardsSelector} a[role=link]`)
      expect(methodLink).not.toBeNull()
      const methodText = await page.evaluate((e) => e.innerText, methodLink)
      expect(methodText).toMatch(`delete_alert for 4.0`)

      // Click and validate destination
      await methodLink?.click()
      await page.waitForSelector(`div[class*=MethodBadge]`, { timeout: 5000 })
      const compUrl = page.url()
      expect(compUrl).toEqual(
        `${BASE_URL}/4.0/methods/Alert/delete_alert?sdk=py`
      )
    }
  })

  it('updates when a comparison is chosen or switched', async () => {
    await goToPage(`${BASE_URL}/3.1/diff`)

    // "Base" input element
    const baseInputElement = await page.$(baseInputSelector)
    expect(baseInputElement).not.toBeNull()

    // "Comparison" input element
    const compInputElement = await page.$(compInputSelector)
    expect(compInputElement).not.toBeNull()

    // Click comparison input
    await compInputElement?.click()
    const compOptionsOnClick = await page.$$(globalOptionsSelector)
    expect(compOptionsOnClick).not.toHaveLength(0)
    expect(compOptionsOnClick).not.toHaveLength(1)

    // Find an option containing the text 4.0
    const option40Index = await page.$$eval(globalOptionsSelector, (els) =>
      els.findIndex((el) => el?.textContent?.match(/4\.0/))
    )
    const option40 = compOptionsOnClick[option40Index]
    expect(option40).not.toBeUndefined()

    // Click that option
    await option40.click()
    await page.waitForSelector(resultCardsSelector, { timeout: 5000 })

    // Check the URL
    // Would like to do this earlier, but not sure what to wait on
    const compUrl = page.url()
    expect(compUrl).toEqual(`${BASE_URL}/3.1/diff/4.0?sdk=py`)

    // Check the results
    const diffResultCards = await page.$$(resultCardsSelector)
    expect(diffResultCards).not.toHaveLength(0)
    const diff31to40Page1Methods = await Promise.all(
      diffResultCards.map((resultCard) =>
        page.evaluate((el) => el.innerText.match(/^[a-z_]*/)[0], resultCard)
      )
    )

    expect(diff31to40Page1Methods).toHaveLength(15)
    expect(diff31to40Page1Methods).toContain('delete_board_item')

    // Click the switch button
    const switchButtonElement = await page.$(switchButtonSelector)
    expect(switchButtonElement).not.toBeNull()
    const switchButtonDisabled = await page.evaluate(
      (e) => e.disabled,
      switchButtonElement
    )
    expect(switchButtonDisabled).toEqual(false)
    await switchButtonElement?.click()

    // A more precise timing mechanism would be better: https://github.com/puppeteer/puppeteer/issues/5328
    await page.waitForTimeout(150)

    const switchUrl = page.url()
    expect(switchUrl).toEqual(`${BASE_URL}/4.0/diff/3.1?sdk=py`)

    // Check the results again, even though they should be the same
    const diff40to31Page1Methods = await Promise.all(
      diffResultCards.map((resultCard) =>
        page.evaluate((el) => el.innerText.match(/^[a-z_]*/)[0], resultCard)
      )
    )

    expect(diff40to31Page1Methods).toHaveLength(15)
    expect(diff40to31Page1Methods).toContain('delete_board_item')
  })
})
