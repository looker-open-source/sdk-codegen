import {
  Button,
  Card,
  FieldText,
  Heading,
  Paragraph,
  FieldSelect,
  Label,
  theme,
  ButtonToggle,
  ButtonItem,
  ValidationMessage,
  GlobalStyle,
  FieldCheckbox,
} from '@looker/components'
import styled, {ThemeProvider} from 'styled-components'
import * as React from 'react'
import Looker_Logo_Purple from './Looker_Logo_Purple.svg'
import {Link, Router, navigate} from '@reach/router'
import {FieldProps, Formik, Form, Field} from 'formik'
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
    <>
      <GlobalStyle />
      <CenterContainer>
        <Card raised>
          <Logo src={Looker_Logo_Purple} />
          <Heading>Hackathon Registration</Heading>
          <Paragraph>Register for a Hackathon below</Paragraph>
          <hr />
          <Heading>Registration</Heading>
          <Formik
            enableReinitialize // for csrf token
            initialValues={{
              csrf_token: csrf.token,
              first_name: '',
              last_name: '',
              email: '',
              organization: '',
              role: '',
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
                role: yup.string().required(),
                hackathon: yup.string().required(),
                tshirt_size: yup
                  .string()
                  .oneOf(['XS', 'S', 'M', 'L', 'XL', 'XXL'])
                  .required(),
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
            {({isSubmitting, status, errors, values, touched}) => {
              return (
                <RegForm>
                  <Field type="hidden" name="csrf_token" value={csrf.token} />
                  <Field
                    label="First Name"
                    component={ValidatedFieldText}
                    name="first_name"
                    placeholder="First Name"
                  />
                  <Field
                    label="Last Name"
                    component={ValidatedFieldText}
                    name="last_name"
                    placeholder="Last Name"
                  />
                  <Field
                    label="Email"
                    component={ValidatedFieldText}
                    name="email"
                    placeholder="Email Address"
                  />
                  <Field
                    label="Organization"
                    component={ValidatedFieldText}
                    name="organization"
                    placeholder="Organization"
                  />
                  <Field
                    label="Role"
                    component={ValidatedFieldText}
                    name="role"
                    placeholder="Role"
                  />
                  <HackathonSelect hackathons={hackathons} />
                  <Label>T-Shirt Size</Label>
                  <Field name="tshirt_size" component={TshirtSize} />
                  <Field
                    name="ndaq"
                    type="checkbox"
                    label="I agree to the Terms and Conditions/NDAQ"
                    alignLabel="right"
                    component={ValidatedFieldCheckbox}
                  />
                  <Field
                    name="code_of_conduct"
                    type="checkbox"
                    label="I agree to the Code of Conduct"
                    alignLabel="right"
                    component={ValidatedFieldCheckbox}
                  />
                  <Field
                    name="contributing"
                    type="checkbox"
                    label="I agree to the Contribution Guidelines"
                    alignLabel="right"
                    component={ValidatedFieldCheckbox}
                  />
                  {status && <div>{status}</div>}
                  <Button size="large" disabled={isSubmitting}>
                    Register
                  </Button>
                </RegForm>
              )
            }}
          </Formik>
        </Card>
      </CenterContainer>
    </>
  )
}

const ValidatedFieldCheckbox: React.FC<FieldProps> = ({
  field,
  form: {errors, touched},
  ...props
}) => {
  const error = errors[field.name]
  const touch = touched[field.name]
  return (
    <FieldCheckbox
      validationMessage={
        error && touch ? {type: 'error', message: error as string} : undefined
      }
      {...field}
      {...props}
    />
  )
}

const ValidatedFieldText: React.FC<FieldProps> = ({
  field,
  form: {errors, touched},
  ...props
}) => {
  const error = errors[field.name]
  const touch = touched[field.name]
  return (
    <FieldText
      validationMessage={
        error && touch ? {type: 'error', message: error as string} : undefined
      }
      {...field}
      {...props}
    />
  )
}

const TshirtSize: React.FC<FieldProps> = ({
  field: {onChange, ...field},
  form: {errors, touched},
  ...props
}) => {
  const error = errors[field.name]
  const touch = touched[field.name]
  const handleChange = (value: string) => {
    onChange({target: {value, name: field.name}})
  }
  return (
    <div>
      <ButtonToggle onChange={handleChange} {...field}>
        <ButtonItem>XS</ButtonItem>
        <ButtonItem>S</ButtonItem>
        <ButtonItem>M</ButtonItem>
        <ButtonItem>L</ButtonItem>
        <ButtonItem>XL</ButtonItem>
        <ButtonItem>XXL</ButtonItem>
      </ButtonToggle>
      {error && touch && (
        <ValidationMessage type="error" message={error as string} />
      )}
    </div>
  )
}

const ValidatedFieldSelect: React.FC<FieldProps> = ({
  field,
  form: {errors, touched},
  ...props
}) => {
  const error = errors[field.name]
  const touch = touched[field.name]
  return (
    <FieldSelect
      validationMessage={
        error && touch ? {type: 'error', message: error as string} : undefined
      }
      {...field}
      {...props}
    />
  )
}

const HackathonSelect: React.FC<{hackathons: string[]}> = ({hackathons}) => {
  //let options = [{value: '', label: 'Select Hack'}]
  let options = []
  for (let hack of hackathons) {
    options.push({value: hack, label: hack})
  }
  return (
    <Field
      placeholder="Select a Hack"
      options={options}
      label="Hackathon"
      component={ValidatedFieldSelect}
      name="hackathon"
    />
  )
}

const ResourcesScene: React.FC<{path: string}> = () => {
  return (
    <CenterContainer>
      <SceneBody>
        <Logo src={Looker_Logo_Purple} />
        <Heading>Looker Hackathons</Heading>
        <Paragraph>Find information on Hackathons below</Paragraph>
        <hr />
        <Heading>Welcome!</Heading>
        <Paragraph>
          Explore the links below to find useful documentation and tools for
          participating in a hackathon.
        </Paragraph>
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
    <ThemeProvider theme={theme}>
      <Body>
        <Router>
          <RegisterScene path="/registration" />
          <ResourcesScene path="/" />
        </Router>
      </Body>
    </ThemeProvider>
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

const RegForm = styled(Form)`
  margin-bottom: 32px;
`
