import React from 'react'
import {Button, Heading, Paragraph, Divider} from '@looker/components'

export const ResourcesScene: React.FC<{path: string}> = ({path}) => {
  const [name, setName] = React.useState('')
  const personalizedText = name === '' ? '' : ` back ${name}`
  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/user_info')
        if (response.ok) {
          const userData = await response.json()
          if (userData.first_name) {
            setName(`${userData.first_name} ${userData.last_name}`)
          }
        } else {
          console.log(response)
        }
      } catch (e) {
        console.log('Error fetching user:', e)
      }
    }
    fetchData()
  }, [])

  let message = `Welcome${personalizedText}!`
  if (path === '/thankyou') {
    message = `Thank you for registering`
    if (name !== '') {
      message = `${message}, ${name}!`
    } else {
      message = `${message}! Check your email for an authorization link.`
    }
  }

  return (
    <>
      <Heading as="h1">Looker Hackathons</Heading>
      <Paragraph>Find information on Hackathons below</Paragraph>
      <Divider my="large" />
      <Heading>{message}</Heading>
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
