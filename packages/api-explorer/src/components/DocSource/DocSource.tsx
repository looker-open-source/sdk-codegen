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
import React, { FC, useContext } from 'react'
import { findDeclaration, IMethod, IType } from '@looker/sdk-codegen'
import { Icon, Link, Tooltip } from '@looker/components'
import { IdeFileDocument } from '@looker/icons'

import { LodeContext } from '../../context'

interface DocSourceProps {
  method?: IMethod
  type?: IType
}

export const DocSource: FC<DocSourceProps> = ({ method, type }) => {
  const { declarations } = useContext(LodeContext)
  let sourceLink
  let declaration
  if (declarations) {
    ;({ declaration, link: sourceLink } = findDeclaration(
      declarations,
      method?.id,
      type?.name
    ))
  }

  return (
    <>
      {sourceLink && declaration && (
        <Tooltip
          content={`${declaration.sourceFile}#L${declaration.line}`}
          width="none"
        >
          <Link href={sourceLink} target="_blank">
            <Icon icon={<IdeFileDocument />} />
          </Link>
        </Tooltip>
      )}
    </>
  )
}
