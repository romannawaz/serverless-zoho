import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
  },
  client_secret: {
    type: String,
    required: true,
  },
  account_id: {
    type: String,
  },
  access_token: {
    type: String,
  },
  refresh_token: {
    type: String,
  },
});

const Account = mongoose.model('account', accountSchema);

export { Account };
