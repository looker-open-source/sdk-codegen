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

import React, { FC } from 'react'
import {
  ActionList,
  ActionListItem,
  ActionListItemColumn,
  Text,
  Checkbox,
} from '@looker/components'

// import { ActionListColumn } from '@looker/components'
import { Projects } from '../../models'

interface ProjectSceneProps {
  projects: Projects
}

export const ProjectsScene: FC<ProjectSceneProps> = ({ projects }) => {
  // const { value, setOn, setOff } = useToggle()
  return (
    <>
      <ProjectList projects={projects} />
      {/*<Dialog isOpen={value} onClose={setOff}>*/}
      {/*  <DialogContent>*/}
      {/*    <ProjectForm />*/}
      {/*  </DialogContent>*/}
      {/*</Dialog>*/}
      {/*<Button iconBefore="CircleAdd" onClick={setOn}>*/}
      {/*  Add Project*/}
      {/*</Button>*/}
    </>
  )
}

interface ProjectListProps {
  projects: Projects
}

// const sheetHeaderColumn = (value: any, key: string) => {
//   if (!value || !key)
//     throw new Error('Each header column needs a value and a key')
//   // Follow packages/run-it/src/components/PerfTracker/perfTableUtils.tsx
//   // if (typeof value === 'string') {
//   //   return value.toString()
//   // }
//   // if (typeof value === 'number') {
//   //   const isInt = /^([+-]?[1-9]\d*|0)$/
//   //   if (value.toString().match(isInt)) {
//   //     return parseInt(value, 10)
//   //   }
//   //   return parseFloat(value)
//   // }
//   // if (typeof value === 'boolean') {
//   //   return boolDefault(value, false)
//   // }
//   // if (value instanceof Date) {
//   //   return new Date(value)
//   // }
//   // if (value instanceof DelimArray) {
//   //   return value.toString().split(',')
//   // }
//   // return this.toString()
//   return {} as ActionListColumn
// }

const sheetCell = (value: any) => {
  if (!value) return <></>

  if (typeof value === 'boolean') {
    return <Checkbox checked={value} />
  }
  // if (value instanceof Date) {
  //   return new Date(value)
  // }
  return <Text>{value.toString()}</Text>
}

const ProjectList: FC<ProjectListProps> = ({ projects }) => {
  const header = projects.header
  const columns = header.map((colName) => ({
    id: colName,
    primaryKey: colName === projects.keyColumn,
    title: colName,
    widthPercent: 20,
  }))

  const items = projects.rows.map((project, idx) => (
    <ActionListItem key={idx} id={idx.toString()}>
      {header.map((columnName, columnId) => (
        <ActionListItemColumn key={columnId}>
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
//   techonologies: Technologies
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
