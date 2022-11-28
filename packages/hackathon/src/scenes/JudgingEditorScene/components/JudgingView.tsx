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

import type { FC } from 'react'
import React, { Fragment } from 'react'
import { ExtMarkdown } from '@looker/extension-utils'
import type { IJudgingProps } from '../../../models'
import { ProjectView } from '../../ProjectsScene/components'

interface JudgingViewProps {
  judging: IJudgingProps
}

export const JudgingView: FC<JudgingViewProps> = ({ judging }) => {
  // Hack using markdown to display a table. There's not docs for Looker component's Table.
  const markdown = `
| Criteria | Score |
| :-------- | -----: |
| Execution | ${judging.execution} |
| Scope | ${judging.scope} |
| Novelty | ${judging.novelty} |
| Impact | ${judging.impact} |
| **Score** | **${judging.score}** |

### Judge's notes

${judging.notes.length !== 0 ? judging.notes : 'N/A'}
`
  const view = <ExtMarkdown source={markdown} />
  const projectView = (
    <ProjectView
      title={judging.$title}
      description={judging.$description}
      technologies={judging.$technologies}
      members={judging.$members}
      project_type={judging.$project_type}
      contestant={judging.$contestant}
    />
  )

  return (
    <Fragment>
      {view}
      {projectView}
    </Fragment>
  )
}
