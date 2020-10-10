import axios from 'axios'
import * as fs from 'fs'
import * as nunjucks from 'nunjucks'

nunjucks.configure(__dirname + '/templates')

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function preparePerms(perms: string[], needAppPrefix = true): { action: string; source: string }[] {
  return perms.map((p) => {
    const [app, rest] = p.split('.')
    const [action, model] = rest.split('_')
    return {
      action: nunjucks.renderString(
        '{%if needAppPrefix %}{{ app|capitalize }}{%endif%}{{ action|capitalize}}{{ model|capitalize}}',
        {
          needAppPrefix,
          app,
          action,
          model,
        },
      ),
      source: p,
    }
  })
}

const generatePermissionsEnum = (perms: string[], name = 'AppPermissions', needAppPrefix = true): string => {
  const preparedPerms = preparePerms(perms, needAppPrefix)
  return nunjucks.render('enum.njk', { name: name, perms: preparedPerms })
}

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
