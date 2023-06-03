export default {
  type: 'object',
  properties: {
    client_id: { type: 'string' },
    client_secret: { type: 'string' },
  },
  required: ['client_id', 'client_secret'],
} as const;
