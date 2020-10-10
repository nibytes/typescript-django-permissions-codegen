/* eslint-disable prettier/prettier */
// eslint:disable
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as fs from "fs";


import axios from "axios";

const capitalizeFirstLetter = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function fromDjangoPermToEnumRow(p: string, needAppPrefix = true) {
  const [app, rest] = p.split('.')
  const [action, model] = rest.split('_')
  return `${
    needAppPrefix ? capitalizeFirstLetter(app) : ""
  }${capitalizeFirstLetter(action)}${capitalizeFirstLetter(model)} = "${p}",`;
}

const generatePermissionsEnum = (
  perms: string[],
  name = "AppPermissions",
  needAppPrefix = true
) => `export enum ${name} {
${perms.map((p) => `  ${fromDjangoPermToEnumRow(p, needAppPrefix)}`).join("\n")}
}\n`;

const groupPermissionsByApp = (perms: string[]):{[index: string]: string[]} => {
  const groups = {};
  for (const p of perms) {
    const [app] = p.split(".");
    if (groups[app]) {
      groups[app].push(p);
    } else {
      groups[app] = [p];
    }
  }
  return groups;
};

if (process.argv.length < 4) {
  console.log("Usage: node index.js <url> <outputFile>");
  process.exit(1);
}
const [permissionsUrl, filePath] = process.argv.slice(2);
const needGroups = true;

axios.get<{perms:string[]}>(permissionsUrl).then((response)=>{
  const data = response.data;
  let fileContent = "// eslint:disable\n\n";
  if (needGroups) {
    for (const [app, perms] of Object.entries(
      groupPermissionsByApp(data.perms)
    )) {
      const appName = capitalizeFirstLetter(app) + "Permission";
      fileContent += generatePermissionsEnum(perms, appName, false) + "\n";
    }
  } else {
    fileContent += generatePermissionsEnum(data.perms);
  }

  fs.writeFile(filePath, fileContent,()=>{console.log('File cannot save')});
})
