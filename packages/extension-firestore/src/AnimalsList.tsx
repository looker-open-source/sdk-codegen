/*

 MIT License

 Copyright (c) 2022 Looker Data Sciences, Inc.

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
import React, { useState } from 'react'
import { useFirestore, useFirestoreCollectionData } from 'reactfire'
import type { DataTableColumns } from '@looker/components'
import {
  Button,
  Spinner,
  DataTable,
  DataTableItem,
  DataTableCell,
  SpaceVertical,
} from '@looker/components'
import { collection, orderBy, query, addDoc } from 'firebase/firestore'

/**
 * Example based upon https://github.com/FirebaseExtended/reactfire/blob/main/example/withoutSuspense/Firestore.tsx
 *
 * License details:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2016 Firebase
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
export const AnimalsList = () => {
  const firestore = useFirestore()
  const animalsCollection = collection(firestore, 'animals')
  const [isAscending, setIsAscending] = useState(false)
  const animalsQuery = query(
    animalsCollection,
    orderBy('commonName', isAscending ? 'asc' : 'desc')
  )
  const { status, data: animals } = useFirestoreCollectionData(animalsQuery, {
    idField: 'id',
  })

  const addAnimal = () => {
    const possibleAnimals = ['Dog', 'Cat', 'Iguana', 'Zebra']
    const selectedAnimal =
      possibleAnimals[Math.floor(Math.random() * possibleAnimals.length)]
    addDoc(animalsCollection, { commonName: selectedAnimal })
  }

  if (status === 'loading') {
    return <Spinner />
  }

  const animalColumns: DataTableColumns = [
    {
      id: 'id',
      title: 'ID',
      type: 'string',
    },
    {
      id: 'name',
      title: 'Name',
      type: 'string',
    },
  ]

  const animalCountColumns: DataTableColumns = [
    {
      id: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      id: 'count',
      title: 'Count',
      type: 'number',
    },
  ]

  return (
    <SpaceVertical>
      <Button
        onClick={() => {
          setIsAscending(!isAscending)
        }}
      >
        Sort
      </Button>
      <DataTable caption="Animals" columns={animalColumns}>
        {animals.map(({ id, commonName }) => (
          <DataTableItem key={id} id={id}>
            <DataTableCell>{id}</DataTableCell>
            <DataTableCell>{commonName}</DataTableCell>
          </DataTableItem>
        ))}
      </DataTable>
      <DataTable caption="Animal Counts" columns={animalCountColumns}>
        {Array.from<any>(
          animals.reduce<any>((animalCountMap, animal) => {
            const currentCount = animalCountMap.get(animal.commonName) ?? 0
            return animalCountMap.set(animal.commonName, currentCount + 1)
          }, new Map<string, number>())
        ).map((animalStat: [string, number]) => {
          const [animalName, animalCount] = animalStat
          return (
            <DataTableItem key={animalName} id={animalName}>
              <DataTableCell>{animalName}</DataTableCell>
              <DataTableCell>{animalCount}</DataTableCell>
            </DataTableItem>
          )
        })}
      </DataTable>
      <Button
        onClick={() => {
          addAnimal()
        }}
      >
        Add Animal
      </Button>
    </SpaceVertical>
  )
}
