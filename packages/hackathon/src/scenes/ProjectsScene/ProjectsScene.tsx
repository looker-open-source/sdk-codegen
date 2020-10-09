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

import React, { FC, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  ActionList,
  ActionListItem,
  ActionListItemColumn,
} from '@looker/components'
import { allProjectsRequest } from '../../data/projects/actions'
import { getProjectsState } from '../../data/projects/selectors'
import { isLoadingState } from '../../data/common/selectors'
import { Projects, Project, sheetHeader, sheetCell } from '../../models'
import { Loading } from '../../components'

interface ProjectSceneProps {}

export const ProjectsScene: FC<ProjectSceneProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(allProjectsRequest())
  }, [dispatch])
  const projects = useSelector(getProjectsState)
  const isLoading = useSelector(isLoadingState)

  return (
    <>
      <Loading
        loading={!projects && isLoading}
        message={'Fetching projects...'}
      />
      {projects && <ProjectList projects={projects} />}
      {/* <Dialog isOpen={value} onClose={setOff}> */}
      {/*  <DialogContent> */}
      {/*    <ProjectForm /> */}
      {/*  </DialogContent> */}
      {/* </Dialog> */}
      {/* <Button iconBefore="CircleAdd" onClick={setOn}> */}
      {/*  Add Project */}
      {/* </Button> */}
    </>
  )
}

interface ProjectListProps {
  projects: Projects
}

const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  const template = projects.rows.length > 0 ? projects.rows[0] : new Project()
  // Remove the ID columns
  // TODO after we have registration id associated with the project we can drop user_id again
  const header = projects.header.slice(4)
  const columns = sheetHeader(header, template)

  const items = projects.rows.map((project, idx) => (
    <ActionListItem key={idx} id={idx.toString()}>
      {header.map((columnName, _) => (
        <ActionListItemColumn key={`${idx}.${columnName}`}>
          {sheetCell(project[columnName])}
        </ActionListItemColumn>
      ))}
    </ActionListItem>
  ))
  return <ActionList columns={columns}>{items}</ActionList>
}

// Use guid function for registration_id. There's a shakespearean guid (word-word-word). Check in Looker package.json
// interface ProjectFormProps {
//   project: Project
//   technologies: Technologies
// }

// const ProjectForm: FC = () => {
//   return (
//     <>
//       <Form
//         onSubmit={() => {
//           console.log('submitted')
//         }}
//       >
//         <Fieldset legend="Enter your project details">
//           <FieldText required label="Title" />
//           <FieldTextArea required label="Description" />
//           <FieldText required label="Type" />
//           <FieldToggleSwitch name="contestant" label="Contestant" />
//           <FieldToggleSwitch name="locked" label="Lock" />
//           <SelectMulti
//             options={[
//               { value: 'Typescript' },
//               { value: 'React' },
//               { value: 'CSS' },
//               { value: 'C#' },
//               { value: 'Go' },
//               { value: 'Python' },
//             ]}
//             isFilterable
//             placeholder="Type values or select from the list"
//             freeInput
//           />
//         </Fieldset>
//       </Form>
//       <Button>Submit</Button>
//     </>
//   )
// }
