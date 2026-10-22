import {fetchProfile} from './fetch.js'
import {render} from './render.js'
import {writeFile, mkdir} from 'node:fs/promises'

const profile = await fetchProfile('68d7568359373b8b80da3a670a3ba73d8920736')

await mkdir('./dist', { recursive: true })
await writeFile('./dist/card.svg', render(profile))