import fetch from 'node-fetch'

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

  test.each([{}, {}, {}])('access_token', async () => {
    const resp = await fetch('http://localhost:3000/access_token', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: 'client_id',
        client_secret: 'expiry_date',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
      }),
    })
    expect(resp.status).toEqual(200)
    const json = await resp.json()
    expect(json.access_token).toBeDefined()
    expect(json.expiry_date).toBeDefined()
  })
})
