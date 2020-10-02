import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()

describe('access_token_server', () => {
  test('status', async () => {
    const resp = await fetch('http://localhost:3000/status')
    expect(resp.status).toEqual(200)
    const json = await resp.json()
    expect(json.app_version).toBeDefined()
    expect(json.build_date).toBeDefined()
    expect(json.git_commit).toBeDefined()
    expect(json.access_token_server_provider_label).toBeDefined()
  })

  test.each([
    {
      client_secret: 'expiry_date',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: 'client_id',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
    {
      client_id: 'client_id',
      client_secret: 'expiry_date',
    },
  ])('access_token missing input', async (input) => {
    const resp = await fetch('http://localhost:3000/access_token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp.status).toEqual(400)
    expect(resp.statusText).toEqual('invalid input')
    // const json = await resp.json()
    // expect(json.access_token).toBeDefined()
    // expect(json.expiry_date).toBeDefined()
  })

  test.each([
    {
      client_id: 'client_id',
      client_secret: 'expiry_date',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
    },
  ])('access_token good', async (input) => {
    const resp = await fetch('http://localhost:3000/access_token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp.status).toEqual(200)
    const json = await resp.json()
    expect(json.access_token).toBeDefined()
    expect(json.expiry_date).toBeDefined()
    const resp2 = await fetch('http://localhost:3000/access_token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    expect(resp2.status).toEqual(200)
    const json2 = await resp2.json()
    expect(json2.access_token).toEqual(json.access_token)
    expect(json2.expiry_date).toEqual(json.expiry_date)
  })
})
