import { defineFunction, secret } from '@aws-amplify/backend';

export const generateWorkout = defineFunction({
  name: 'generate-workout',
  entry: './handler.ts',
  environment: {
    GROQ_API_KEY: secret('GROQ_API_KEY'),
  },
  timeoutSeconds: 30,
});
