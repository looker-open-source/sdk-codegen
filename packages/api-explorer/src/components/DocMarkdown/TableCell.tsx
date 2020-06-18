import React, { FC, PropsWithChildren } from 'react'
import { TableDataCell, TableHeaderCell } from '@looker/components'

export const TableCell: FC<PropsWithChildren<any>> = (props) =>
  props.isHeader ? <TableHeaderCell {...props} /> : <TableDataCell {...props} />
