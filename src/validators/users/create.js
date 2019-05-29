import Ajv from 'ajv';
import profileSchema from '../../schemas/users/profile.json';
import createUserSchema from '../../schemas/users/create.json';
import Index from '../errors/validation-error';
import { generateValidationErrorMessage } from '../errors/message';

export function validate(req) {
  const ajvValidate = new Ajv()
    .addFormat('email', /^[\w.+]+@\w+\.\w+$/)
    .addSchema([profileSchema, createUserSchema])
    .compile(createUserSchema);
  console.log('ajv');
  const valid = ajvValidate(req.body);
  if (!valid) {
    return new Index(generateValidationErrorMessage(ajvValidate.errors));
  }
  return true;
}
