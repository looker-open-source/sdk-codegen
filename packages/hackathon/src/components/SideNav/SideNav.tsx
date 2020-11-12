/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

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
import React, { FC } from 'react'
import styled from 'styled-components'
import { Box, MenuList, MenuItem } from '@looker/components'
import { NavLink } from 'react-router-dom'
import { Routes } from '../../routes/AppRouter'

export interface SideNavProps {
  authorizedRoutes: Routes[]
}

export const SideNav: FC<SideNavProps> = ({ authorizedRoutes }) => (
  <Box fontSize="xxlarge" mt="40px">
    <MenuList type="none">
      {authorizedRoutes.includes(Routes.HOME) && (
        <MenuItem icon="Home">
          <Link to={Routes.HOME}>Home</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.RESOURCES) && (
        <MenuItem icon="ChartMap">
          <Link to={Routes.RESOURCES}>Resources</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.USERS) && (
        <MenuItem icon="Group">
          <Link to={Routes.USERS}>Users</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.PROJECTS) && (
        <MenuItem icon="Beaker">
          <Link to={Routes.PROJECTS}>Projects</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.JUDGING) && (
        <MenuItem icon="FactCheck">
          <Link to={Routes.JUDGING}>Judging</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.ADMIN) && (
        <MenuItem icon="Gear">
          <Link to={Routes.ADMIN}>Admin</Link>
        </MenuItem>
      )}
    </MenuList>
  </Box>
)

const Link = styled(NavLink)`
  color:${({ theme }) => theme.colors.ui5}
  cursor: pointer;
  display: block;
  padding: ${({
    theme: {
      space: { xsmall, large },
    },
  }) => `${xsmall} ${large}`};
  &:hover,
  &:visited,
  &:focus,
  &.active {
    color: ${({ theme }) => theme.colors.key};
  }
`
