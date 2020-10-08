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
import { Box, TreeItem, TreeGroup } from '@looker/components'
import { NavLink } from 'react-router-dom'

export const SideNav: FC = () => (
  <Box pt="small" fontSize="xxlarge">
    <TreeGroup label="Menu">
      <TreeItem>
        <Link to="/home">Home</Link>
      </TreeItem>
      <TreeItem>
        <Link to="/users">Users</Link>
      </TreeItem>
      <TreeItem>
        <Link to="projects">Projects</Link>
      </TreeItem>
      <TreeItem>
        <Link to="/judging">Judging</Link>
      </TreeItem>
      <TreeItem>
        <Link to="/admin">Admin</Link>
      </TreeItem>
    </TreeGroup>
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
  &:focus,
  &.active {
    color: ${({ theme }) => theme.colors.key};
  }
`
