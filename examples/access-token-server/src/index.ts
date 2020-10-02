import express from 'express'
import { json } from 'body-parser'
import { accessTokenRouter, statusRouter } from './routes'
import { getSetup } from './setup'

const setup = getSetup()
const app = express()
app.use(json())
app.use(accessTokenRouter)
app.use(statusRouter)

app.listen(setup.port, () => {
  console.log(`server listening on port ${setup.port}`)
})
