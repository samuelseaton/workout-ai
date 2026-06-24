import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { generateWorkout } from './functions/generate-workout/resource';

export const backend = defineBackend({ auth, data, generateWorkout });

// Disable self-signup — only admin-created accounts can log in
backend.auth.resources.cfnResources.cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};
