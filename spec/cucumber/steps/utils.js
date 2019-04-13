function getValidPayload(payloadType) {
  switch (payloadType.toLowerCase()) {
    case 'create user':
      return {
        email: 'e@ma.il',
        password: 'password',
      };
    default:
      return {};
  }
}
function convertStringToArray(fields) {
  return fields.split(',').map(s => s.trim()).filter(s => s !== '');
}

export {
  getValidPayload,
  convertStringToArray,
};
