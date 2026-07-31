import { updateUserRole } from './auth.js';

export async function selectAndSaveRole(role) {
  await updateUserRole(role);
}
