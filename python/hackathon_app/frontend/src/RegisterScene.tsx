import {
  Button,
  Box,
  FieldText,
  Heading,
  Paragraph,
  FieldSelect,
  Label,
  ButtonToggle,
  ButtonItem,
  ValidationMessage,
  FieldCheckbox,
  Spinner,
  Flex,
  Divider,
} from '@looker/components'
import {navigate} from '@reach/router'
import {FieldProps, Formik, Form, Field} from 'formik'
import React from 'react'
import * as yup from 'yup'

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
    <Box mb="large">
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
    </Box>
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
  for (let [name, label] of Object.entries(hackathons)) {
    options.push({value: name, label: label})
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

export const RegisterScene: React.FC<{path: string}> = () => {
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
      <Heading as="h1">Hackathon Registration</Heading>
      <Paragraph>Register for a Hackathon below</Paragraph>
      <Divider my="large" />
      <Heading mb="medium">Registration</Heading>
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
            <Form>
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
                labelWidth="auto"
                component={ValidatedFieldCheckbox}
                branded
              />
              <Field
                name="code_of_conduct"
                type="checkbox"
                label="I agree to the Code of Conduct"
                alignLabel="right"
                labelWidth="auto"
                component={ValidatedFieldCheckbox}
                branded
              />
              <Field
                name="contributing"
                type="checkbox"
                label="I agree to the Contribution Guidelines"
                alignLabel="right"
                labelWidth="auto"
                component={ValidatedFieldCheckbox}
                branded
              />
              {status && <div>{status}</div>}
              <Flex alignItems="center" mt="medium">
                {isSubmitting && <Spinner mr="small" />}
                <Button disabled={isSubmitting}>Register</Button>
              </Flex>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}
