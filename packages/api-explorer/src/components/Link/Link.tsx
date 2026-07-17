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

import type { FC, MouseEvent } from 'react';
import React from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { tryGetEnvAdaptor } from '@looker/extension-utils';

export interface LinkProps {
  to: string;
  exact?: boolean;
  activeClassName?: string;
  className?: string;
}

const LinkComponent: FC<LinkProps> = ({
  to,
  exact,
  activeClassName,
  className,
  children,
  ...props
}) => {
  const adaptor = tryGetEnvAdaptor();
  const history = useHistory();
  const location = useLocation();

  if (adaptor && adaptor.isExtension()) {
    const absoluteUrl = adaptor.resolveRouteToAbsoluteUrl(to);

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      const isRegularClick =
        e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;

      if (isRegularClick) {
        e.preventDefault();
        history.push(to);
      }
    };

    const isActive = exact
      ? location.pathname === to
      : location.pathname.startsWith(to);
    const activeClass = isActive ? activeClassName || 'active' : '';
    const combinedClassName = `${className || ''} ${activeClass}`.trim();

    return (
      <a
        href={absoluteUrl}
        onClick={handleClick}
        className={combinedClassName}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      exact={exact}
      activeClassName={activeClassName}
      className={className}
      {...props}
    >
      {children}
    </NavLink>
  );
};

export const Link = styled(LinkComponent)`
  text-decoration: none;
  color: inherit;

  &:hover,
  &:visited,
  &:focus,
  &.active {
    color: inherit;
  }
`;
