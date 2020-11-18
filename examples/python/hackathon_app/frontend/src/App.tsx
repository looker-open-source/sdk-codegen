import {Card, ComponentsProvider, Flex} from '@looker/components'
import React from 'react'
import {Router} from '@react/router'
import {Logo} from './Logo'
import {RegisterScene} from './RegisterScene'
import {ResourcesScene} from './ResourcesScene'

const App: React.FC = () => {
  return (
    <ComponentsProvider>
      <Flex
        justifyContent="center"
        minHeight="100vh"
        minWidth="100vw"
        backgroundColor="key"
        p={['medium', 'xxlarge']}
      >
        <Card raised minWidth="50%" maxWidth={600} p={['medium', 'xlarge']}>
          <Logo />
          <Router>
            <RegisterScene path="/registration" />
            <ResourcesScene path="/" />
            <ResourcesScene path="/thankyou" />
          </Router>
        </Card>
      </Flex>
    </ComponentsProvider>
  )
}
export default App
