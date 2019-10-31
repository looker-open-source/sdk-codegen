import * as React from 'react'
import Web_Looker_Logo_White from './Web_Looker_Logo_White.svg'
import styled from 'styled-components'
import {Link, Router, navigate} from '@reach/router'
import {Formik, Form, Field, ErrorMessage} from 'formik'
import * as yup from 'yup'

const RegisterScene: React.FC<{path: string}> = () => {
  const [hackathons, setHackathons] = React.useState([])
  const [csrf, setCsrf] = React.useState({token: 'someToken'})

  React.useEffect(() => {
    async function fetchData() {
      try {
        const newHackathons = await fetch('/hackathons')
        setHackathons(await newHackathons.json())
        const newCsrf = await fetch('/csrf')
        setCsrf(await newCsrf.json())
      } catch (e) {} // TODO: hack for local frontend dev
    }
    fetchData()
  }, [])

  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={Web_Looker_Logo_White} />
        <Header>Hackathon Registration</Header>
        <Description>Register for a Hackathon below</Description>
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
              try {
                const result = await fetch('/register', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(values),
                })
                const msg = await result.json()
                if (msg.ok) {
                  navigate('/')
                } else {
                  actions.setStatus(msg.message)
                  actions.setSubmitting(false)
                }
              } catch (e) {
                // TODO: hack for local frontend dev
                alert(JSON.stringify(values, null, 2))
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
                <Input name="first_name" type="text" placeholder="First Name" />
                <ErrorMessage name="first_name" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Last name</Label>
                <Input name="last_name" type="text" placeholder="Last Name" />
                <ErrorMessage name="last_name" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="Email Address" />
                <ErrorMessage name="email" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Organization</Label>
                <Input name="organization" placeholder="Organization" />
                <ErrorMessage name="organization" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>Hackathon</Label>
                <HackathonSelect hackathons={hackathons} />
                <ErrorMessage name="hackathon" component="div" />
              </InputGroup>
              <InputGroup>
                <Label>T-Shirt Size</Label>
              </InputGroup>
              <InputGroup>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="XS" />
                  XS
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="S" />S
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="M" />M
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="L" />L
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="XL" />
                  XL
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="XL" />
                  XL
                </Label>
                <Label>
                  <Radio type="radio" name="tshirt_size" value="XXL" />
                  XXL
                </Label>
              </InputGroup>
              <ErrorMessage name="tshirt_size" component="div" />
              <CheckboxGroup>
                <CheckboxLabel>
                  <CheckBox name="ndaq" type="checkbox" />I agree to the Terms
                  and Conditions/NDAQ
                </CheckboxLabel>
                <ErrorMessage name="ndaq" component="div" />
              </CheckboxGroup>
              <CheckboxGroup>
                <CheckboxLabel>
                  <CheckBox name="code_of_conduct" type="checkbox" />I agree to
                  the Code of Conduct
                </CheckboxLabel>
                <ErrorMessage name="code_of_conduct" component="div" />
              </CheckboxGroup>
              <CheckboxGroup>
                <CheckboxLabel>
                  <CheckBox name="contributing" type="checkbox" />I agree to the
                  Contribution Guidelines
                </CheckboxLabel>
                <ErrorMessage name="contributing" component="div" />
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

const ResourcesScene: React.FC<{path: string}> = () => {
  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={Web_Looker_Logo_White} />
        <Header>Looker Hackathons</Header>
        <Description>Find information on Hackathons below</Description>
        <hr />
        <Header>Welcome!</Header>
        <Description>
          Explore the links below to find useful documentation and tools for
          participating in a hackathon.
        </Description>
        <Links>
          <LinkContainer>
            <TitleLink to="/registration">Register for a Hackathon</TitleLink>
          </LinkContainer>
          <LinkContainer>
            <TitleLink to="//lookerhack.slack.com/">Slack</TitleLink>
          </LinkContainer>
        </Links>
      </SceneBody>
    </CenterContainer>
  )
}

const App: React.FC = () => {
  return (
    <Body>
      <Router>
        <RegisterScene path="/registration" />
        <ResourcesScene path="/" />
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
  background-color: #7a58ce;
  cursor: pointer;
  display: flex;
  height: 50px;
  margin-bottom: 12px;
  margin-top: 12px;
  width: 100%;

  &:hover {
    background-color: #ac96e0;
  }
`

const TitleLink = styled(Link)`
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
  background-color: #5a2fc2;
  margin: auto;
  min-height: 100vh;
  min-width: 100vw;
`

const Description = styled.div`
  color: white;
  margin-bottom: 16px;
`

const Header = styled.h2`
  color: white;
  font-size: 28px;
`

const Label = styled.label`
  color: white;
  font-size: 14px;
  margin-bottom: 4px;
`

const RegForm = styled(Form)`
  margin-bottom: 32px;
`

const Radio = styled(Field)`
  margin-left: 12px;
  margin-bottom: 32px;
  font-size: 16px;
`

const CheckBox = styled(Field)`
  margin-left: 12px;
  font-size: 16px;
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
  background-color: #e13d73;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  padding-top: 6px;
  padding-bottom: 6px;
  font-size: 24px;
  width: 100%;
`
