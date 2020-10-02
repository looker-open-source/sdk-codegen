import { Router } from 'express'
import sha1 from 'crypto-js/sha1'

const accessTokenData = {}

const createTokenDataKey = (
  clientId: string,
  clientSecret: string,
  scope: string
) => {
  return `${sha1(clientId).toString()}.${sha1(clientSecret).toString()}.${sha1(
    scope
  ).toString()}`
}

const router = Router()

router.post('/access_token', (req, res) => {
  const { client_id, secret_key, scope } = req.body
  if (!client_id || !secret_key || !scope) {
    res.sendStatus(404)
    return
  }
  const key = createTokenDataKey(client_id, secret_key, scope)
  console.log(key)
  const accessTokenData = {
    access_token: '',
    expiry_date: '',
  }
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(accessTokenData))
})

export { router as accessTokenRouter }
