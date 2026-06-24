import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { generateWorkout } from '../functions/generate-workout/resource';

const schema = a.schema({
  UserProfile: a
    .model({
      birthday: a.string().required(),
      gender: a.string().required(),
      height: a.string().required(),
      weight: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Workout: a
    .model({
      inputs: a.json().required(),
      exercises: a.json().required(),
    })
    .authorization((allow) => [allow.owner()]),

  generateWorkout: a
    .query()
    .arguments({ inputs: a.string().required() })
    .returns(a.string())
    .handler(a.handler.function(generateWorkout))
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
