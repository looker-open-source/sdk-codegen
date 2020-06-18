import { Heading } from '@looker/components'
import { ApiModel } from '@looker/sdk-codegen'
import React, { FC } from 'react'
import { useParams } from 'react-router-dom'

import { DocMarkdown, Main } from '../../components'

interface DocHomeProps {
  api: ApiModel
}

interface DocHomeParams {
  specKey: string
}

export const HomeScene: FC<DocHomeProps> = ({ api }) => {
  const { specKey } = useParams<DocHomeParams>()

  return (
    <Main>
      <Heading
        as="h1"
        color="palette.charcoal800"
        fontSize="xxxlarge"
        fontWeight="semiBold"
        mb="xsmall"
      >
        {`Looker API ${specKey} Reference`}
      </Heading>
      <DocMarkdown source={api.schema?.info.description!} specKey={specKey} />
    </Main>
  )
}
