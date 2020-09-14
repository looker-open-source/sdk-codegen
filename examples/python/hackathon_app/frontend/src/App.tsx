import {theme, GlobalStyle, Card, Flex} from '@looker/components'
import {ThemeProvider} from 'styled-components'
import * as React from 'react'
import {Router} from '@reach/router'
import {Logo} from './Logo'
import {RegisterScene} from './RegisterScene'
import {ResourcesScene} from './ResourcesScene'

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Flex
        justifyContent="center"
        minHeight="100vh"
        minWidth="100vw"
        backgroundColor="palette.purple500"
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
    </ThemeProvider>
  )
}
export default App
