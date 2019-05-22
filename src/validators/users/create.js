import ValidationError from '../errors/validationn-error';

export function validate(req) {
  const requiredField = ['email', 'password'];
  if (!requiredField.every(field => Object.hasOwnProperty.call(req.body, field))) {
    return new ValidationError('Payload must contain at least the email and password fields');
  }
  if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
    return new ValidationError('The email and password fields must be of type string');
  }
  if (!/^[\w.+]+@\w+\.\w+$/.test(req.body.email)) {
    return new ValidationError('The email field must be a valid email');
  }
}
