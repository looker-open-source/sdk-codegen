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

// TODO: figure out a better way to import the types
/// <reference types="cypress" />

const BASE_URL = 'https://localhost:8080'

describe('Api Explorer', () => {
  describe('general', () => {
    beforeEach(() => {
      cy.visit(BASE_URL)
    })

    it('renders a method page', () => {
      cy.contains('Dashboard').click()
      cy.contains('a', 'Get All Dashboards').click()

      // title
      cy.contains('h2', 'Get All Dashboards')

      // markdown
      cy.contains('div', 'Get information about all active dashboards')

      // sdk declaration
      cy.contains('h3', 'Python Declaration')

      // sdk examples
      cy.contains('h3', 'SDK Examples')
      cy.get('table[aria-label="SDK Examples"] > tbody > tr').should(
        'have.length.greaterThan',
        0
      )

      // type references
      cy.contains('h3', 'References')
      cy.get('.doc-link')
        .should('have.length.greaterThan', 0)
        .within(() => {
          cy.get('a').contains('DashboardBase').click()
          cy.wait(100)
        })
      cy.contains('h2', 'DashboardBase')
      cy.url().should('eq', `${BASE_URL}/4.0/types/DashboardBase`)
      cy.go('back')

      // response models
      cy.contains('h3', 'Response Models')

      // original schema
      cy.contains('h3', 'Original Schema')
    })

    it('renders a type page', () => {
      cy.get('button')
        .contains(/^Types/)
        .click()
      cy.get('a').contains('AccessToken').click()

      // title
      cy.contains('h2', 'AccessToken')

      // references
      cy.contains('h3', 'References')
      cy.get('.doc-link').should('have.length.greaterThan', 0)

      // sdk declaration
      cy.contains('h3', 'Python Declaration')

      // original schema
      cy.contains('h3', 'Original Schema')
    })

    it('renders a tag scene and filters by operation', () => {
      cy.get('h5').contains('ApiAuth').click()
      cy.contains('h2', 'ApiAuth: API Authentication')
      cy.url().should('eq', `${BASE_URL}/4.0/methods/ApiAuth`)

      cy.get('button[value="ALL"][aria-pressed=true]').should('exist')
      cy.get('div[type="DELETE"]').should('exist')
      cy.get('div[type="DELETE"]').should('exist')

      cy.get('button[value="POST"]').click()
      cy.get('div[type="DELETE"]').should('not.exist')
      cy.get('div[type="POST"]').should('exist')

      cy.get('button[value="DELETE"]').click()
      cy.get('div[type="DELETE"]').should('exist')
      cy.get('div[type="POST"]').should('not.exist')
    })

    it('toggles sidenav', () => {
      const searchSelector = 'input[aria-label="Search"]'
      const navToggleSelector = 'button[aria-label="nav toggle"]'
      cy.get(searchSelector).should('exist')
      cy.get(navToggleSelector).click()
      cy.get(searchSelector).should('not.exist')
      cy.get(navToggleSelector).click()
      cy.get(searchSelector).should('exist')
    })

    it('remembers the chosen programming language', () => {
      cy.get('input[aria-label="sdk language selector"]')
        .should('have.value', 'Python')
        .click()

      cy.get('li').contains('Kotlin').trigger('mouseover').click()
      cy.reload()

      cy.get('input[aria-label="sdk language selector"]').should(
        'have.value',
        'Kotlin'
      )
    })

    it('changes specs', () => {
      cy.get('h2').contains('Looker API 4.0 Reference')
      cy.url().should('eq', `${BASE_URL}/4.0/`)

      cy.get('input[aria-label="spec selector"]')
        .should('have.value', '4.0')
        .click()

      cy.get('ul[aria-label="spec selector"] > li:first-child')
        .contains('3.1')
        .trigger('mouseover')
        .click()
      cy.url().should('eq', `${BASE_URL}/3.1`)
      cy.get('h2').contains('Looker API 3.1 Reference')
    })
  })

  describe('navigation', () => {
    it('should be able to navigate directly to a spec home', () => {
      cy.visit(`${BASE_URL}/3.1`)
      cy.get('input[aria-label="spec selector"]').should('have.value', '3.1')
      cy.get('h2').contains('Looker API 3.1 Reference')
    })

    it('should be able to navigate directly to a tag scene', () => {
      cy.visit(`${BASE_URL}/3.1/methods/Dashboard`)
      cy.get('h2').contains('Dashboard: Manage Dashboards')
    })

    it('should be able to navigate directly to a method scene', () => {
      cy.visit(`${BASE_URL}/3.1/methods/Dashboard/all_dashboards`)
      cy.get('h2').contains('Get All Dashboards')
      cy.get('div').contains('Get information about all active dashboards')
    })

    it('should be able to navigate directly to a type scene', () => {
      cy.visit(`${BASE_URL}/3.1/types/WriteTheme`)
      cy.get('h2').contains('WriteTheme')
      cy.get('button').contains(
        'Dynamic writeable type for Theme removes: can, id'
      )
    })
  })

  describe('search', () => {
    beforeEach(() => {
      cy.visit(BASE_URL)
    })

    it('searches methods', () => {
      cy.get('input[aria-label="Search"]').type('get workspace').wait(250)
      cy.get('button').contains('Methods (1)')
      cy.get('button').contains('Types (0)')

      cy.get('a').contains('Get Workspace').click()
      cy.get('h2').contains('Get Workspace')
      cy.url().should('eq', `${BASE_URL}/4.0/methods/Workspace/workspace`)
    })

    it('searches types', () => {
      cy.get('input[aria-label="Search"]').type('writetheme').wait(250)
      cy.get('button').contains('Methods (0)')
      cy.get('button').contains('Types (1)').click()
      cy.get('a').contains('WriteTheme').click()
      cy.get('h2').contains('WriteTheme')
      cy.url().should('eq', `${BASE_URL}/4.0/types/WriteTheme`)
    })
  })
})
