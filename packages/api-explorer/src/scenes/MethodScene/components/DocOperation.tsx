import React, { FC } from 'react'
import { IMethod } from '@looker/sdk-codegen'
import { Text, Flex, Box } from '@looker/components'

import { DocPseudo } from '../../../components'

interface DocOperationProps {
  method: IMethod
}

export const DocOperation: FC<DocOperationProps> = ({ method }) => (
  <Box mb="large">
    <Flex>
      <Text mr="xxsmall">SDK: </Text> <DocPseudo method={method} />
    </Flex>
    <Flex>
      <Text>
        {method.httpMethod}: {method.endpoint}
      </Text>
    </Flex>
  </Box>
)
