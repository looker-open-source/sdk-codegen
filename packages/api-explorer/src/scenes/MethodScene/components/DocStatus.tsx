import React, { FC } from 'react'
import { Badge } from '@looker/components'
import styled from 'styled-components'

interface DocStatusProps {
  status: string
}

const StyledBadge = styled(Badge)`
  border-radius: 4px;

  &.beta {
    background-color: ${(props) => props.theme.colors.palette.purple100};
    color: ${(props) => props.theme.colors.palette.purple700};
  }

  &.stable {
    background-color: ${(props) => props.theme.colors.palette.green100};
    color: ${(props) => props.theme.colors.palette.green700};
  }

  &.experimental {
    background-color: ${(props) => props.theme.colors.palette.yellow000};
    color: ${(props) => props.theme.colors.palette.yellow600};
  }

  &.deprecated {
    background-color: ${(props) => props.theme.colors.palette.red500};
    color: ${(props) => props.theme.colors.palette.white};
  }
`

export const DocStatus: FC<DocStatusProps> = ({ status }) => (
  <StyledBadge className={status.toLowerCase()}>
    {status.toUpperCase()}
  </StyledBadge>
)
