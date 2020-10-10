import { generatePermissionsEnum } from '../'

test('genEnum', () => {
  expect(generatePermissionsEnum(['project.add_project', 'project.add_other', 'project.add_model']))
    .toBe(`export enum AppPermissions {
  ProjectAddProject = "project.add_project",
  ProjectAddOther = "project.add_other",
  ProjectAddModel = "project.add_model",
}
`)
})
