import * as React from 'react'
import logo from './logo.svg'
import styled from 'styled-components'
import {Router, navigate} from '@reach/router'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as yup from 'yup'

type Path = {
  path: string
}

export const RegisterScene: React.FC<Path> = () => {
  const [hackathons, setHackathons] = React.useState(['hack 1', 'hack 2'])
  const [csrf, setCsrf] = React.useState({token: ''})

  React.useEffect(() => {
    async function fetchData() {
      const hackathons = await fetch('/hackathons')
      setHackathons(await hackathons.json())
      const csrf = await fetch('/csrf')
      setCsrf(await csrf.json())
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
        <Formik
          enableReinitialize // for csrf token
          initialValues={{
            csrf_token: csrf.token,
            firstName: '',
            lastName: '',
            email: '',
            organization: '',
            hackathon: '',
            ndaq: false,
            codeOfConduct: false,
            contributing: false,
          }}
          validationSchema={() =>
            yup.object().shape({
              csrf_token: yup.string().required(),
              firstName: yup.string().required(),
              lastName: yup.string().required(),
              email: yup
                .string()
                .email()
                .required(),
              organization: yup.string().required(),
              hackathon: yup.string().required(),
              ndaq: yup
                .boolean()
                .oneOf([true], 'Required')
                .required(),
              codeOfConduct: yup
                .boolean()
                .oneOf([true], 'Required')
                .required(),
              contributing: yup
                .boolean()
                .oneOf([true], 'Required')
                .required(),
            })
          }
          onSubmit={(values, actions) => {
            async function fetchData() {
              const result = await fetch('/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
              })
              const msg = await result.json()
              if (msg.ok) {
                navigate('/resources')
              } else {
                actions.setStatus(msg.message)
                actions.setSubmitting(false)
              }
            }
            fetchData()
          }}
        >
          {({isSubmitting, status}) => (
            <RegForm>
              <Field type="hidden" name="csrf_token" value={csrf.token} />
              <InputGroup>
                <Label>First name</Label>
                <Input name="firstName" type="text" placeholder="Andy" />
                <ErrorMessage name="firstName" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Last name</Label>
                <Input name="lastName" type="text" placeholder="Chiggins" />
                <ErrorMessage name="lastName" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  placeholder="dandychiggins@gmail.com"
                />
                <ErrorMessage name="email" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Organization</Label>
                <Input name="organization" placeholder="Looker" />
                <ErrorMessage name="organization" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Hackathon</Label>
                <HackathonSelect hackathons={hackathons} />
                <ErrorMessage name="hackathon" component="div" />
              </InputGroup>
              <CheckboxGroup>
                <Input name="ndaq" type="checkbox" />
                <ErrorMessage name="ndaq" component="div" />
                <CheckboxLabel>
                  I agree to the Terms and Conditions/NDAQ
                </CheckboxLabel>
              </CheckboxGroup>
              <CheckboxGroup>
                <Input name="codeOfConduct" type="checkbox" />
                <ErrorMessage name="codeOfConduct" component="div" />
                <CheckboxLabel>I agree to the Code of Conduct</CheckboxLabel>
              </CheckboxGroup>
              <CheckboxGroup>
                <Input name="contributing" type="checkbox" />
                <ErrorMessage name="contributing" component="div" />
                <CheckboxLabel>
                  I agree to the Contribution Guidelines
                </CheckboxLabel>
              </CheckboxGroup>
              {status && <div>{status}</div>}
              <RegisterButton type="submit" disabled={isSubmitting}>
                Register
              </RegisterButton>
            </RegForm>
          )}
        </Formik>
      </SceneBody>
    </CenterContainer>
  )
}

type HackathonSelectProps = {
  hackathons: string[]
}

const HackathonSelect: React.FC<HackathonSelectProps> = ({hackathons}) => {
  let options = [
    <option key="0" disabled defaultValue="1" value="">
      Select a Hack
    </option>,
  ]
  let key = 1
  for (let hack of hackathons) {
    options.push(
      <option key={key} value={hack}>
        {hack}
      </option>
    )
    key++
  }
  return (
    <Input component="select" name="hackathon">
      {options}
    </Input>
  )
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

const RegForm = styled(Form)`
  margin-bottom: 32px;
`

const Input = styled(Field)`
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
