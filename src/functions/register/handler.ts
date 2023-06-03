import mongoose from 'mongoose';
import { formatJSONResponse } from '../../libs/api-gateway';
import { config } from '../../config/config';
import { Account } from '../../models/account.model';

const register = async (event: any) => {
  const { client_id, client_secret } = JSON.parse(event.body);

  await mongoose.connect(config.mongo.url);

  const isAccountExist = await Account.findOne({ client_id });
  if (isAccountExist)
    return formatJSONResponse({
      message: 'Client id already registered!',
    });

  const newAccount = new Account({ client_id, client_secret });
  await newAccount.save();

  const accessUrl = `https://accounts.zoho.eu/oauth/v2/auth?scope=ZohoMail.folders.READ,ZohoMail.accounts.READ,ZohoMail.messages.READ,ZohoMail.organization.accounts.READ&client_id=${client_id}&response_type=code&access_type=offline&redirect_uri=https://0h9td2wftf.execute-api.us-east-1.amazonaws.com/dev/user&state=${newAccount._id}&prompt=consent`;

  return formatJSONResponse({
    message: event.body,
    url: accessUrl,
  });
};

export const main = register;
