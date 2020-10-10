import { generatePermissionsEnum } from '../index'

test('test', () => {
  expect(generatePermissionsEnum(['project.add_project', 'project.add_other', 'project.add_model'])).toBe('test')
})
