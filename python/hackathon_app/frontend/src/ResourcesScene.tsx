import React from 'react'
import {Button, Heading, Paragraph, Divider} from '@looker/components'

export const ResourcesScene: React.FC<{path: string}> = () => {
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
