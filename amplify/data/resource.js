import { a, defineData } from '@aws-amplify/backend';
import { generateWorkout } from '../functions/generate-workout/resource';
const schema = a.schema({
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
export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
});
