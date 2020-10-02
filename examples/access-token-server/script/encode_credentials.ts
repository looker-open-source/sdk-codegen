import * as status from '../service_account.json'

const buff = Buffer.from(JSON.stringify(status))
console.log(buff.toString('base64'))
