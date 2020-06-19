import React, { FC } from 'react'
import { Badge } from '@looker/components'
import styled from 'styled-components'

interface MethodBadgeProps {
  verb: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'TRACE' | 'HEAD'
}

const StyledMethodBadge = styled(Badge)`
  display: block;
  font-size: 0.5rem;
  margin-right: ${(props) => props.theme.space.xsmall};
  padding: 0;
  text-align: center;
  min-width: 2.5rem;

  &.get {
    background-color: ${(props) => props.theme.colors.palette.blue100};
    color: ${(props) => props.theme.colors.palette.blue600};
  }

  &.post {
    background-color: ${(props) => props.theme.colors.palette.green100};
    color: ${(props) => props.theme.colors.palette.green700};
  }

  &.put {
    background-color: ${(props) => props.theme.colors.palette.purple100};
    color: ${(props) => props.theme.colors.palette.purple700};
  }

  &.delete {
    background-color: ${(props) => props.theme.colors.palette.red100};
    color: ${(props) => props.theme.colors.palette.red600};
  }

  &.patch {
    background-color: ${(props) => props.theme.colors.palette.yellow100};
    color: ${(props) => props.theme.colors.palette.yellow900};
  }

  &.trace {
    background-color: ${(props) => props.theme.colors.palette.yellow000};
    color: ${(props) => props.theme.colors.palette.yellow600};
  }

  &.head {
    background-color: ${(props) => props.theme.colors.palette.charcoal100};
    color: ${(props) => props.theme.colors.palette.charcoal700};
  }
`

export const MethodBadge: FC<MethodBadgeProps> = ({ verb }) => (
  <StyledMethodBadge className={verb.toLowerCase()}>{verb}</StyledMethodBadge>
)
