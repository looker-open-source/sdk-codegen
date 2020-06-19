import React, { FC } from 'react'
import styled from 'styled-components'

export const MainWrapper = styled.main`
  padding: ${(props) => props.theme.space.xxlarge};
`

export const Main: FC = (props) => (
  <MainWrapper className="main">{props.children}</MainWrapper>
)
