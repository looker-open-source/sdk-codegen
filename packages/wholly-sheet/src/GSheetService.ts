/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */

import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

// const CRED_PATH = 'secret/credentials.json'
// const TOKEN_PATH = 'secret/token.json'
// const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
const defaultScopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
]
export class GSheetService {
  constructor(
    cred: any,
    tokenString: string,
    public readonly scopes = defaultScopes
  ) {
    this.authorize(cred, tokenString)
  }

  async authorize(cred: any, tokenString: string) {
    const { client_secret, client_id, redirect_uris } = cred.installed
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    )

    try {
      const token = JSON.parse(tokenString)
      oAuth2Client.setCredentials(token)
      return oAuth2Client
    } catch (e) {
      return await getNewToken(oAuth2Client)
    }
  }

  async getNewToken(oAuth2Client: OAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
    })

    console.log('Authorize this app by visiting this url: ', authUrl)

    return (await new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question('Enter the code from that page here: ', (code) => {
        rl.close()
        oAuth2Client.getToken(code, (err, token) => {
          reject(err)
          if (!token) {
            reject()
          }
          oAuth2Client.setCredentials(token!)

          fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))

          resolve(oAuth2Client)
        })
      })
    })) as OAuth2Client
  }
}

export const sheetService = (cred: string) => {
  // const cred = JSON.parse(fs.readFileSync(CRED_PATH, 'utf8'))
  const auth = await authorize(cred)
  return google.sheets({ version: 'v4', auth })
}

export async function getArray(
  sheetsObj: any,
  spreadsheetId: string,
  range: string
): Promise<any[][]> {
  return (await new Promise((resolve, reject) => {
    sheetsObj.spreadsheets.values.get(
      { spreadsheetId, range },
      (err: any, res: any) => (err ? reject(err) : resolve(res.data.values))
    )
  })) as any[][]
}

export async function getObjectArray(
  sheetsObj: any,
  spreadsheetId: string,
  range: string
): Promise<any[]> {
  return toObjectArray(await getArray(sheetsObj, spreadsheetId, range))
}

function toObjectArray(array: any[][]): any[] {
  const header = array.splice(0, 1)[0]
  const output = [] as any[]

  array.forEach((el) => {
    const entry = {} as any
    header.forEach((h, i) => {
      entry[h] = el[i] ? el[i] : undefined
    })
    output.push(entry)
  })

  return output
}
