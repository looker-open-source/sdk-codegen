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
import { useDispatch, useSelector } from 'react-redux'
import { isLoadingState } from '../../data/common/selectors'
import { Loading } from '../../components/Loading'
import { allHackersRequest } from '../../data/hackers/actions'
import { getHackersState } from '../../data/hackers/selectors'
import { HackerList } from '../../components/HackerList'

interface UsersSceneProps {}

export const UsersScene: FC<UsersSceneProps> = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(allHackersRequest())
  }, [dispatch])
  const hackers = useSelector(getHackersState)
  const isLoading = useSelector(isLoadingState)

  return (
    <>
      <Loading loading={isLoading} message={'Processing hackers...'} />
      {hackers && (
        <>
          <HackerList hackers={hackers} />
        </>
      )}
    </>
  )
}
