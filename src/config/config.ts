import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const DATABASE_URL =
  process.env.DATABASE_URL ??
  'mongodb+srv://romannawaz:nshn8d-134@cluster0.f2lh8.mongodb.net/zoho_accounts?retryWrites=true&w=majority';

export const config = {
  mongo: {
    url: DATABASE_URL,
  },
};
