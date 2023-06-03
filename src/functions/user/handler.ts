import { formatJSONResponse } from '@libs/api-gateway';
import mongoose from 'mongoose';

import { config } from '../../config/config';
import { Account } from '../../models/account.model';

import axios from 'axios';

const createNewUser = async (event) => {
  console.log(1);
  const { state, code } = event.queryStringParameters;
  console.log(2);
  await mongoose.connect(config.mongo.url);
  console.log(3);
  const clientData = await Account.findById(state);
  console.log(4, clientData);
  // if (isAccountExist)
  //   return formatJSONResponse({
  //     message: 'User with this client_id already exist',
  //   });

  const tokens = await axios
    .request({
      url: 'https://accounts.zoho.eu/oauth/v2/token',
      method: 'post',
      params: {
        code,
        grant_type: 'authorization_code',
        client_id: clientData.client_id,
        client_secret: clientData.client_secret,
        redirect_uri:
          'https://0h9td2wftf.execute-api.us-east-1.amazonaws.com/dev/user',
        state: clientData._id,
        access_type: 'offline',
        scope:
          'ZohoMail.folders.READ,ZohoMail.accounts.READ,ZohoMail.messages.READ,ZohoMail.organization.accounts.READ',
      },
    })
    .then((response) => response.data);
  console.log(5, tokens);

  const accountInfo = await axios
    .request({
      url: 'http://mail.zoho.eu/api/accounts',
      method: 'get',
      headers: {
        Authorization: 'Bearer ' + tokens.access_token,
      },
    })
    .then((response) => {
      return response.data.data[0];
    })
    .catch(async () => {
      const newAccessToken = await axios
        .request({
          url: 'https://accounts.zoho.eu/oauth/v2/token',
          method: 'post',
          params: {
            grant_type: 'refresh_token',
            refresh_token: tokens.refresh_token,
            client_id: clientData.client_id,
            client_secret: clientData.client_secret,
          },
        })
        .then((response) => response.data);

      return await axios
        .request({
          url: 'http://mail.zoho.eu/api/accounts',
          method: 'get',
          headers: {
            Authorization: 'Bearer ' + newAccessToken.access_token,
          },
        })
        .then((response) => {
          return response.data.data[0];
        });
    });

  console.log(5.5, accountInfo);

  const updatedClient = await Account.findOneAndUpdate(
    { _id: state },
    {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      account_id: accountInfo.accountId,
    },
  );
  console.log(6, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    account_id: accountInfo.accountId,
  });

  return formatJSONResponse({
    message: `Hello, welcome to the exciting Serverless world!`,
    user: updatedClient,
  });
};

export const main = createNewUser;
