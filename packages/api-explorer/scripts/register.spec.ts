import { apixAppInfo, apixGuid, registerCorsApp } from './register'

describe('register', () => {
  test('it registers apix', async () => {
    const guid = apixGuid
    const appInfo = apixAppInfo()
    const actual = await registerCorsApp(guid, appInfo)
    expect(actual).toBeDefined()
    expect(actual).toEqual(`${guid} is registered for OAuth on https://self-signed.looker.com:19999`)
  })
})
