import * as React from 'react'
import logo from './logo.svg'
import styled from 'styled-components'
import {Router, navigate} from '@reach/router'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as yup from 'yup'

export const RegisterScene: React.FC<{path: string}> = () => {
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
        <Header>Looker Hackathon Registration</Header>
        <Description>Register for a Looker Hackathon below</Description>
        <hr />
        <Header>Registration</Header>
        <Formik
          enableReinitialize // for csrf token
          initialValues={{
            csrf_token: csrf.token,
            first_name: '',
            last_name: '',
            email: '',
            organization: '',
            hackathon: '',
            tshirt_size: '',
            ndaq: false,
            code_of_conduct: false,
            contributing: false,
          }}
          validationSchema={() =>
            yup.object().shape({
              csrf_token: yup.string().required(),
              first_name: yup.string().required(),
              last_name: yup.string().required(),
              email: yup
                .string()
                .email()
                .required(),
              organization: yup.string().required(),
              hackathon: yup.string().required(),
              tshirt_size: yup
                .string()
                .oneOf(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
              ndaq: yup
                .boolean()
                .oneOf([true], 'Required')
                .required(),
              code_of_conduct: yup
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
          {({isSubmitting, status, values, errors, touched}) => (
            <RegForm>
              <Field type="hidden" name="csrf_token" value={csrf.token} />
              <InputGroup>
                <Label>First name</Label>
                <Input name="first_name" type="text" placeholder="Andy" />
                <ErrorMessage name="first_name" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Last name</Label>
                <Input name="last_name" type="text" placeholder="Chiggins" />
                <ErrorMessage name="last_name" component="div" />
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
              <RadioButtonGroup label="T-Shirt Size">
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="XS"
                  label="XS"
                />
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="S"
                  label="S"
                />
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="M"
                  label="M"
                />
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="L"
                  label="L"
                />
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="XL"
                  label="XL"
                />
                <Field
                  component={RadioButton}
                  name="tshirt_size"
                  id="XXL"
                  label="XXL"
                />
              </RadioButtonGroup>
              <ErrorMessage name="tshirt_size" component="div" />
              <CheckboxGroup>
                <Input name="ndaq" type="checkbox" />
                <ErrorMessage name="ndaq" component="div" />
                <CheckboxLabel>
                  I agree to the Terms and Conditions/NDAQ
                </CheckboxLabel>
              </CheckboxGroup>
              <CheckboxGroup>
                <Input name="code_of_conduct" type="checkbox" />
                <ErrorMessage name="code_of_conduct" component="div" />
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

// Radio input
const RadioButton: React.FC<{
  field: {
    name: string
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  }
  id: string
  label: string
}> = ({field: {name, onChange}, id, label, ...props}) => {
  return (
    <div>
      <input
        onChange={onChange}
        name={name}
        id={id}
        type="radio"
        value={id}
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  )
}

// Radio group
const RadioButtonGroup: React.FC<{
  label: string
  children: React.ReactNode
}> = ({label, children}) => {
  return (
    <div>
      <fieldset>
        <legend>{label}</legend>
        {children}
      </fieldset>
    </div>
  )
}

const HackathonSelect: React.FC<{hackathons: string[]}> = ({hackathons}) => {
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

const Link: React.FC<{title: string}> = ({title}) => (
  <LinkContainer>
    <TitleLink>{title}</TitleLink>
  </LinkContainer>
)

export const ResourcesScene: React.FC<{path: string}> = () => {
  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={logo} />
        <Header>Looker Hackathon Resources</Header>
        <Description>Find information on Looker Hackathons below</Description>
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
