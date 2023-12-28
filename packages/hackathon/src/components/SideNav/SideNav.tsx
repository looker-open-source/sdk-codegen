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
import type { FC } from 'react';
import React from 'react';
import styled from 'styled-components';
import { Box2, MenuList, MenuItem } from '@looker/components';
import { Beaker } from '@looker/icons';
import { Map } from '@styled-icons/material/Map';
import { Settings } from '@styled-icons/material/Settings';
import { Home } from '@styled-icons/material-outlined/Home';
import { Group } from '@styled-icons/material-outlined/Group';
import { FactCheck } from '@styled-icons/material-outlined/FactCheck';
import { NavLink } from 'react-router-dom';
import { Routes } from '../../routes/AppRouter';

export interface SideNavProps {
  authorizedRoutes: Routes[];
}

export const SideNav: FC<SideNavProps> = ({ authorizedRoutes }) => (
  <Box2 fontSize="xxlarge" mt="40px">
    <MenuList type="none">
      {authorizedRoutes.includes(Routes.HOME) && (
        <MenuItem icon={<Home />}>
          <Link to={Routes.HOME}>Home</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.RESOURCES) && (
        <MenuItem icon={<Map />}>
          <Link to={Routes.RESOURCES}>Resources</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.USERS) && (
        <MenuItem icon={<Group />}>
          <Link to={Routes.USERS}>Users</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.PROJECTS) && (
        <MenuItem icon={<Beaker />}>
          <Link to={Routes.PROJECTS}>Projects</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.JUDGING) && (
        <MenuItem icon={<FactCheck />}>
          <Link to={Routes.JUDGING}>Judging</Link>
        </MenuItem>
      )}
      {authorizedRoutes.includes(Routes.ADMIN) && (
        <MenuItem icon={<Settings />}>
          <Link to={Routes.ADMIN}>Admin</Link>
        </MenuItem>
      )}
    </MenuList>
  </Box2>
);

const Link = styled(NavLink)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.ui5};

  &:hover,
  &:visited,
  &:focus,
  &.active {
    color: inherit;
  }

  cursor: pointer;
  display: block;
  padding: ${({ theme: { space } }) => `${space.xsmall} ${space.large}`};
`;
