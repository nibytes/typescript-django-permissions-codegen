import { generatePermissions } from './gen'

if (process.argv.length < 4) {
  console.log('Usage: node index.js <url> <outputFile>')
  process.exit(1)
}
const [permissionsUrl, filePath] = process.argv.slice(2)
const needGroups = true

generatePermissions(permissionsUrl, filePath, needGroups)
