import {
  Button,
  Heading,
  Paragraph,
  theme,
  GlobalStyle,
  Card,
  Flex,
  Divider,
} from '@looker/components'
import {ThemeProvider} from 'styled-components'
import * as React from 'react'
import {Router} from '@reach/router'
import {Logo} from './Logo'
import {RegisterScene} from './RegisterScene'

const ResourcesScene: React.FC<{path: string}> = () => {
  return (
    <>
      <Heading as="h1">Looker Hackathons</Heading>
      <Paragraph>Find information on Hackathons below</Paragraph>
      <Divider my="large" />
      <Heading>Welcome!</Heading>
      <Paragraph mb="large">
        Explore the links below to find useful documentation and tools for
        participating in a hackathon.
      </Paragraph>
      <Button forwardedAs="a" href="/registration" mr="large">
        Register for a Hackathon
      </Button>
      <Button forwardedAs="a" href="//lookerhack.slack.com/">
        Slack
      </Button>
    </>
  )
}

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
          </Router>
        </Card>
      </Flex>
    </ThemeProvider>
  )
}
export default App
