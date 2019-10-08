import React, {useEffect, useState} from 'react'
import logo from './logo.svg'
import styled from 'styled-components'
import {Router, navigate} from '@reach/router'

type Path = {
  path: string
}

export const RegisterScene: React.FC<Path> = () => {
  const [hackathons, setHackathons] = useState(['hack 1', 'hack 2'])

  useEffect(() => {
    async function fetchData() {
      const result = await fetch(`/hackathons`)
      setHackathons(await result.json())
    }
    fetchData()
  }, [])

  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={logo} />
        <Header>Chicago Hackathon 2019</Header>
        <Description>Description of Hackathon , venue/agenda</Description>
        <hr />
        <Header>Registration</Header>
        <Form>
          <InputGroup>
            <Label>First name</Label>
            <Input placeholder="Dandy" />
          </InputGroup>
          <InputGroup>
            <Label>Last name</Label>
            <Input placeholder="Chiggins" />
          </InputGroup>
          <InputGroup>
            <Label>Email</Label>
            <Input placeholder="dandychiggins@gmail.com" />
          </InputGroup>
          <InputGroup>
            <Label>Organization</Label>
            <Input placeholder="Looker" />
          </InputGroup>
          <InputGroup>
            <Label>Hackathon</Label>
            <HackathonSelect hackathons={hackathons} />
          </InputGroup>
          <CheckboxGroup>
            <input type="checkbox" />
            <CheckboxLabel>
              I agree to the Terms and Conditions/NDAQ
            </CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <input type="checkbox" />
            <CheckboxLabel>I agree to the Code of Conduct</CheckboxLabel>
          </CheckboxGroup>
          <CheckboxGroup>
            <input type="checkbox" />
            <CheckboxLabel>
              I agree to the Contribution Guidelines
            </CheckboxLabel>
          </CheckboxGroup>
        </Form>
        <RegisterButton
          onClick={() => {
            navigate('/resources')
          }}
        >
          Register
        </RegisterButton>
      </SceneBody>
    </CenterContainer>
  )
}

type HackathonSelectProps = {
  hackathons: string[]
}

const HackathonSelect: React.FC<HackathonSelectProps> = ({hackathons}) => {
  let options = []
  let key = 0
  for (let hack of hackathons) {
    options.push(
      <option key={key} value={hack}>
        {hack}
      </option>
    )
    key++
  }
  return <select>{options}</select>
}

type LinkProps = {
  title: string
}

const Link: React.FC<LinkProps> = ({title}) => (
  <LinkContainer>
    <TitleLink>{title}</TitleLink>
  </LinkContainer>
)

export const ResourcesScene: React.FC<Path> = () => {
  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={logo} />
        <Header>Chicago Hackathon 2019</Header>
        <Description>Description of Hackathon , venue/agenda</Description>
        <hr />
        <Header>Welcome!</Header>
        <Description>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostr
        </Description>
        <Links>
          <Link title={'Hackathon resources'} />
          <Link title={'Open source documents'} />
          <Link title={'Slack'} />
        </Links>
      </SceneBody>
    </CenterContainer>
  )
}

const App: React.FC = () => {
  return (
    <Body>
      <Router>
        <RegisterScene path="/" />
        <ResourcesScene path="/resources" />
      </Router>
    </Body>
  )
}
export default App

const Links = styled.div`
  margin-top: 32px;
`

const LinkContainer = styled.div`
  align-items: center;
  background-color: #543fb2;
  cursor: pointer;
  display: flex;
  height: 50px;
  margin-bottom: 12px;
  margin-top: 12px;
  width: 100%;

  &:hover {
    background-color: #d35160;
  }
`

const TitleLink = styled.div`
  color: white;
  margin-left: 16px;
`

const Logo = styled.img`
  max-width: 150px;
`

const CenterContainer = styled.div`
  display: flex;
  justify-content: center;
`

const SceneBody = styled.div`
  width: 600px;
  padding-top: 32px;
`

const Body = styled.div`
  background-color: #4636ac;
  margin: auto;
  height: 100vh;
  width: 100vw;
`

const Description = styled.div`
  color: white;
  margin-bottom: 16px;
`

const Header = styled.h2`
  color: white;
  font-size: 28px;
`

const Label = styled.div`
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
`

const Form = styled.div`
  margin-bottom: 32px;
`

const Input = styled.input`
  border-radius: 4px;
  height: 30px;
  font-size: 16px;
  width: 100%;
`

const InputGroup = styled.div`
  margin-bottom: 20px;
`

const CheckboxGroup = styled.div`
  display: flex;
  margin-bottom: 8px;
`

const CheckboxLabel = styled(Label)`
  margin-left: 8px;
  font-size: 16px;
`

const RegisterButton = styled.button`
  background-color: #d35160;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  padding-top: 6px;
  padding-bottom: 6px;
  font-size: 24px;
  width: 100%;
`
