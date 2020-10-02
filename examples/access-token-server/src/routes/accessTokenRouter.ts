import { Router } from 'express'
import moment from 'moment'
import { JWT } from 'google-auth-library'
import sha1 from 'crypto-js/sha1'
import { getSetup } from '../setup'

interface AccessTokenData {
  access_token: string
  expiry_date: number
}

const accessTokenDataMap: Record<string, AccessTokenData> = {}

const createTokenDataKey = (
  clientId: string,
  clientSecret: string,
  scope: string
) => {
  return `${sha1(clientId).toString()}.${sha1(clientSecret).toString()}.${sha1(
    scope
  ).toString()}`
}

const isExpiring = (expiryDate: number) => {
  const diff = moment(new Date(expiryDate)).diff(moment(), 'seconds')
  return diff < 300
}

const isValidClientIdAndSecret = (clientId: string, clientSecret: string) => {
  return true
}

const getAccessTokenData = async (scope: string): Promise<AccessTokenData> => {
  const { client_email, private_key } = getSetup().serviceAccountCredentials
  const client = new JWT({
    email: client_email,
    key: private_key,
    scopes: scope.split(' '),
  })
  const accessToken = await client.getAccessToken()
  const tokenInfo = await client.getTokenInfo(accessToken.token)
  return { access_token: accessToken.token, expiry_date: tokenInfo.expiry_date }
}

const router = Router()

router.post('/access_token', async (req, res) => {
  const { client_id, client_secret, scope } = req.body
  if (!client_id || !client_secret || !scope) {
    res.statusMessage = 'invalid input'
    res.sendStatus(400)
    return
  }
  const key = createTokenDataKey(client_id, client_secret, scope)
  let accessTokenData = accessTokenDataMap[key]
  if (accessTokenData && !isExpiring(accessTokenData.expiry_date)) {
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(accessTokenData))
    return
  }
  if (!isValidClientIdAndSecret(client_id, client_secret)) {
    res.statusMessage = 'invalid input'
    res.sendStatus(400)
    return
  }
  accessTokenData = await getAccessTokenData(scope)
  accessTokenDataMap[key] = accessTokenData
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(accessTokenData))
})

export { router as accessTokenRouter }
