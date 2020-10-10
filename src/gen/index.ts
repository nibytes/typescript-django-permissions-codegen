import axios from 'axios'
import * as fs from 'fs'

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function fromDjangoPermToEnumRow(p: string, needAppPrefix = true) {
  const [app, rest] = p.split('.')
  const [action, model] = rest.split('_')
  // eslint-disable-next-line prettier/prettier
  return `${
    needAppPrefix ? capitalizeFirstLetter(app) : ""
  }${capitalizeFirstLetter(action)}${capitalizeFirstLetter(model)} = "${p}",`;
}

const generatePermissionsEnum = (
  perms: string[],
  name = 'AppPermissions',
  needAppPrefix = true,
): string => `export enum ${name} {
${perms.map((p) => `  ${fromDjangoPermToEnumRow(p, needAppPrefix)}`).join('\n')}
}\n`

const groupPermissionsByApp = (perms: string[]): { [index: string]: string[] } => {
  const groups = {}
  for (const p of perms) {
    const [app] = p.split('.')
    if (groups[app]) {
      groups[app].push(p)
    } else {
      groups[app] = [p]
    }
  }
  return groups
}

function generatePermissions(permissionsUrl: string, filePath: string, needGroups: boolean): void {
  axios.get<{ perms: string[] }>(permissionsUrl).then((response) => {
    const data = response.data
    let fileContent = '// eslint:disable\n\n'
    if (needGroups) {
      for (const [app, perms] of Object.entries(groupPermissionsByApp(data.perms))) {
        const appName = capitalizeFirstLetter(app) + 'Permission'
        fileContent += generatePermissionsEnum(perms, appName, false) + '\n'
      }
    } else {
      fileContent += generatePermissionsEnum(data.perms)
    }

    fs.writeFile(filePath, fileContent, () => {
      console.log('File was not save')
    })
  })
}

export { generatePermissions, generatePermissionsEnum }
