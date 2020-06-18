import React, { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, RenderOptions } from '@testing-library/react'

export const withRouter = (
  children: ReactElement<any> | ReactElement[],
  initialEntries: string[] = ['/']
) => <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>

export const renderWithRouter = (
  children: ReactElement<any> | ReactElement[],
  initialEntries?: string[],
  options?: Omit<RenderOptions, 'queries'>
) => render(withRouter(children, initialEntries), options)
