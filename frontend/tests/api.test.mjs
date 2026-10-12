import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import axios from '../node_modules/axios/index.js'

const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
}
globalThis.window = new EventTarget()
const source = (await readFile(new URL('../src/api.js', import.meta.url), 'utf8'))
  .replace("'axios'", JSON.stringify(new URL('../node_modules/axios/index.js', import.meta.url).href))
  .replace('import.meta.env.VITE_API_URL', "''")
const { default: api, monuments } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const reply = (config, data) => ({ config, data, status: 200, statusText: 'OK', headers: {} })

test('all monuments includes pages beyond the first 200 records', async () => {
  const pages = []
  api.defaults.adapter = async config => {
    pages.push(config.params.page)
    const page = config.params.page
    return reply(config, { results: [page], next: page < 3 ? '/next/' : null })
  }
  assert.deepEqual((await monuments.all()).data, [1, 2, 3])
  assert.deepEqual(pages, [1, 2, 3])
})

test('simultaneous expired tokens perform one refresh and retry both requests', async () => {
  storage.set('access_token', 'expired')
  storage.set('refresh_token', 'old-refresh')
  let refreshes = 0
  axios.defaults.adapter = async config => {
    refreshes++
    await new Promise(resolve => setTimeout(resolve, 10))
    return reply(config, { access: 'new-access', refresh: 'new-refresh' })
  }
  api.defaults.adapter = async config => {
    if (config.headers.Authorization === 'Bearer expired') {
      throw { config, response: { status: 401 } }
    }
    return reply(config, config.headers.Authorization)
  }
  const results = await Promise.all([api.get('/one'), api.get('/two')])
  assert.equal(refreshes, 1)
  assert.deepEqual(results.map(r => r.data), ['Bearer new-access', 'Bearer new-access'])
  assert.equal(storage.get('refresh_token'), 'new-refresh')
})

test('failed refresh clears user state and announces session expiry', async () => {
  storage.set('access_token', 'expired')
  storage.set('refresh_token', 'invalid')
  storage.set('username', 'editor')
  storage.set('is_staff', 'true')
  let expired = false
  window.addEventListener('auth-expired', () => { expired = true }, { once: true })
  axios.defaults.adapter = async () => { throw new Error('Invalid refresh') }
  api.defaults.adapter = async config => { throw { config, response: { status: 401 } } }
  await assert.rejects(api.get('/private'))
  assert.equal(storage.size, 0)
  assert.equal(expired, true)
})

test('transport errors without request config preserve the original error', async () => {
  const original = new Error('Transport setup failed')
  api.defaults.adapter = async () => { throw original }
  await assert.rejects(api.get('/broken'), error => error === original)
})
