import { readFileSync } from 'fs'
import { cwd } from 'process'
import { Router } from 'express'

const router = Router()

router.get('/status', (req, res) => {
  try {
    const status = readFileSync(`${cwd()}/status.json`, 'utf8')
    res.setHeader('Content-Type', 'application/json')
    res.send(status)
  } catch (err) {
    console.error(err)
    res.status(512).send('status.json read error')
  }
})

export { router as statusRouter }
