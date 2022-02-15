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

import { goToPage, pageReload } from './helpers'

// https://github.com/smooth-code/jest-puppeteer/tree/master/packages/expect-puppeteer
// https://github.com/puppeteer/puppeteer/blob/main/docs/api.md

jest.setTimeout(120000)

const BASE_URL = 'https://localhost:8080'
const v31 = `${BASE_URL}/3.1`
const v40 = `${BASE_URL}/4.0`

describe('API Explorer', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  describe('general', () => {
    beforeEach(async () => {
      await goToPage(v31)
    })

    it('renders a method page', async () => {
      await expect(page).toClick('h4', { text: 'Dashboard' })
      await Promise.all([
        page.waitForNavigation(),
        expect(page).toClick('a', { text: 'Get All Dashboards' }),
      ])
      await expect(page.url()).toEqual(
        `${v31}/methods/Dashboard/all_dashboards`
      )

      // title
      await expect(page).toMatchElement('h2', { text: 'Get All Dashboards' })

      // markdown
      await expect(page).toMatchElement('div', {
        text: 'Get information about all active dashboards',
      })

      // sdk declaration
      await expect(page).toMatchElement('h3', { text: 'Python Declaration' })

      // sdk examples
      await expect(page).toMatchElement('h3', { text: 'SDK Examples' })
      const examples = await page.$$(
        'table[aria-label="SDK Examples"] > tbody > tr'
      )
      expect(examples.length).toBeGreaterThan(0)

      // type references
      await expect(page).toMatchElement('h3', { text: 'References' })
      const docLinks = await page.$$('.doc-link')
      expect(docLinks.length).toBeGreaterThan(0)
      await docLinks[0].click()
      const typeName = await page.evaluate((e) => e.innerText, docLinks[0])
      await expect(page).toMatchElement('h2', { text: typeName })
      await page.goBack()

      // response models
      await expect(page).toMatchElement('h3', { text: 'Response Models' })

      // original schema
      await expect(page).toMatchElement('h3', { text: 'Original Schema' })
    })

    it('renders a type page', async () => {
      await expect(page).toClick('button', { text: /^Types/ })
      await expect(page).toClick('h4', { text: 'ApiAuth' })
      await expect(page).toClick('a', { text: 'AccessToken' })

      // title
      await expect(page).toMatchElement('h2', { text: 'AccessToken' })

      // references
      await expect(page).toMatchElement('h3', { text: 'References' })
      const docLinks = await page.$$('.doc-link')
      expect(docLinks.length).toBeGreaterThan(0)

      // sdk declaration
      await expect(page).toMatchElement('h3', { text: 'Python Declaration' })

      // original schema
      await expect(page).toMatchElement('h3', { text: 'Original Schema' })
    })

    it('renders a tag scene and filters by operation', async () => {
      await expect(page).toClick('h4', { text: 'ApiAuth' })
      await expect(page).toMatchElement('h2', {
        text: 'ApiAuth: API Authentication',
      })
      await expect(page.url()).toMatch(`${v31}/methods/ApiAuth`)

      await expect(page).toMatchElement(
        'button[value="ALL"][aria-pressed=true]'
      )
      await expect(page).toMatchElement('div[type="DELETE"]')
      await expect(page).toMatchElement('div[type="POST"]')

      await page.click('button[value="POST"]')
      await expect(page).not.toMatchElement('div[type="DELETE"]')
      await expect(page).toMatchElement('div[type="POST"]')

      await page.click('button[value="DELETE"]')
      await expect(page).toMatchElement('div[type="DELETE"]')
      await expect(page).not.toMatchElement('div[type="POST"]')
    })

    it('toggles sidenav', async () => {
      const searchSelector = 'input[aria-label="Search"]'
      const navToggleSelector = 'button[aria-label="nav toggle"]'
      await expect(page).toMatchElement(searchSelector)
      await expect(page).toClick(navToggleSelector)
      await expect(page).not.toMatchElement(searchSelector)
      await expect(page).toClick(navToggleSelector)
      await expect(page).toMatchElement(searchSelector)
    })

    it('remembers the chosen language', async () => {
      const selector = 'input[aria-label="sdk language selector"]'
      let languageHandle = await page.$(`${selector}[value="Python"]`)
      expect(languageHandle).not.toBeNull()
      expect(await page.evaluate((x) => x.value, languageHandle)).toEqual(
        'Python'
      )
      await expect(page).toClick('h4', { text: 'Dashboard' })
      await expect(page).toClick('a', { text: 'Get All Dashboards' })
      await expect(page).toMatchElement('h3', { text: 'Python Declaration' })

      await languageHandle?.click()
      await expect(page).toClick('li', { text: 'Kotlin' })
      await pageReload()
      languageHandle = await page.$(`${selector}[value="Kotlin"]`)
      expect(languageHandle).not.toBeNull()
      expect(await page.evaluate((x) => x.value, languageHandle)).toEqual(
        'Kotlin'
      )
      await expect(page).toMatchElement('h3', { text: 'Kotlin Declaration' })
    })

    it('changes specs', async () => {
      await expect(page).toMatchElement('h2', {
        text: 'Looker API 3.1 Reference',
      })
      await expect(page).toClick('input[value="3.1"]')
      await expect(page).toClick(
        'ul[aria-label="spec selector"] > li:last-child'
      )
      await expect(page).toMatchElement('h2', {
        text: 'Looker API 4.0 (Beta) Reference',
      })
    })
  })

  describe('navigation', () => {
    it('should be able to navigate directly to a spec home', async () => {
      await goToPage(v31)
      await expect(page).toMatchElement('h2', {
        text: 'Looker API 3.1 Reference',
      })
      await expect(page).toMatchElement('input[value="3.1"]')
    })

    it('should be able to navigate directly to a tag scene', async () => {
      await goToPage(`${v31}/methods/Dashboard`)
      await expect(page).toMatchElement('h2', {
        text: 'Dashboard: Manage Dashboards',
      })
    })

    it('should be able to navigate directly to a method', async () => {
      await goToPage(`${v40}/methods/Dashboard/all_dashboards`)
      await expect(page).toMatchElement('h2', { text: 'Get All Dashboards' })
      await expect(page).toMatchElement('div', {
        text: 'Get information about all active dashboards',
      })
    })

    it('should be able to navigate directly to a type', async () => {
      await goToPage(`${v31}/types/Query/Query`)
      await expect(page).toMatchElement('h2', { text: 'Query' })
      await expect(page).toMatchElement('button', { text: 'Query' })
    })
  })

  describe('search', () => {
    beforeEach(async () => {
      await goToPage(v31)
    })

    it('searches methods', async () => {
      await expect(page).toFill('input[aria-label="Search"]', 'get workspace')
      // TODO: find a better way to avoid the scenario where L215 executes before search returns
      await page.waitForTimeout(250)
      await expect(page).toMatchElement('button', {
        text: 'Methods (1)',
      })
      await expect(page).toMatchElement('button', { text: 'Types (0)' })
      await expect(page).toClick('a', { text: 'Get Workspace' })
      await expect(page).toMatchElement('h2', { text: 'Get Workspace' })
      await expect(page.url()).toEqual(`${v31}/methods/Workspace/workspace`)
    })

    it('searches types', async () => {
      await expect(page).toFill('input[aria-label="Search"]', 'writetheme')
      await page.waitForTimeout(250)
      await expect(page).toMatchElement('button', {
        text: 'Methods (0)',
      })
      await expect(page).toClick('button', { text: 'Types (1)' })
      await expect(page).toClick('a', { text: 'WriteTheme' })
      await expect(page).toMatchElement('h2', { text: 'WriteTheme' })
      await expect(page.url()).toEqual(`${v31}/types/Theme/WriteTheme`)
    })
  })
})
