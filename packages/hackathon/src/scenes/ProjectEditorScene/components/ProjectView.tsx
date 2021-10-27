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
import React from 'react'
import { useSelector } from 'react-redux'
import type {
  IProjectProps,
  ITeamMemberProps,
  ITechnologyProps,
} from '../../../models'
import { ExtMarkdown } from '../../../components'
import { getTechnologies } from '../../../data/hack_session/selectors'

interface ProjectViewProps {
  project: IProjectProps
}

const techDescriptions = (ids: string[], technologies?: ITechnologyProps[]) => {
  try {
    return technologies
      ?.filter((t) => ids.includes(t._id))
      .map((t) => t.description)
      .join(', ')
  } catch {
    // avoid sheet data errors
    return ids.join(', ')
  }
}

const getMembers = (team: ITeamMemberProps[]) => {
  try {
    return team.map((t) => t.$name).join(', ') || 'Nobody!'
  } catch {
    // avoid sheet data errors
    return 'Error retrieving team members'
  }
}

export const ProjectView: FC<ProjectViewProps> = ({ project }) => {
  const availableTechnologies = useSelector(getTechnologies)

  const tech = techDescriptions(project.technologies, availableTechnologies)
  const members = getMembers(project.$team)
  const view = `# ${project.title}
by ${members}

${project.description}

**Uses**: ${tech}

**Project type**: ${project.project_type}

**Contestant**: ${project.contestant ? 'Yes' : 'No'}
`
  return <ExtMarkdown source={view} />
}
