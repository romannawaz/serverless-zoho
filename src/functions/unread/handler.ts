import mongoose from 'mongoose';

import { Account } from '../../models/account.model';

import { google } from 'googleapis';
import axios from 'axios';

interface List {
  summary: string; // "Log in App comparisonsChatGPT vs. Bing Chat: Which AI chatbot should you use? AI chatbots are popping up everywhere, and most of them feel a lot like ChatGPT. But there's something different about Bing Chat—namely, that's it's integrated into a web ";
  sentDateInGMT: string; // "1684935215000";
  calendarType: string; // 0;
  subject: string; // "ChatGPT vs. Bing Chat";
  messageId: string; // "1684942420177030001";
  flagid: string; // "flag_not_set";
  status2: string; // "0";
  priority: string; // "3";
  hasInline: string; // "true";
  toAddress: string; // "&lt;nik@wisevision.life&gt;";
  folderId: string; // "3617820000000003011";
  ccAddress: string; // "Not Provided";
  hasAttachment: string; // "0";
  size: string; // "78184";
  sender: string; // "blog@send.zapier.com";
  receivedTime: string; // "1684942420134";
  fromAddress: string; // "blog@send.zapier.com";
  status: string; // "0";
}

const hello = async () => {
  try {
    console.log('hello func start');
    await mongoose.connect(
      'mongodb+srv://romannawaz:nshn8d-134@cluster0.f2lh8.mongodb.net/zoho_accounts?retryWrites=true&w=majority',
    );
    console.log('db connected');

    const allAccounts = await Account.find();
    console.log('all account', JSON.stringify(allAccounts));

    const limit = 200;

    let unread: List[] = [];

    for (const account of allAccounts) {
      console.log(account);
      let response: List[] = [];

      const url = `http://mail.zoho.eu/api/accounts/${account.account_id}/messages/view`;
      let start = 0;

      do {
        console.log('in to do');
        response = await axios
          .request({
            url,
            method: 'get',
            params: {
              limit,
              status: 'unread',
              start,
            },
            headers: {
              Authorization: 'Bearer ' + account.access_token,
            },
          })
          .then((response) => {
            console.log('axios response', JSON.stringify(response.data.data));
            return response.data.data;
          })
          .catch(async () => {
            console.log('token expired');
            const tokens = await axios
              .request({
                url: 'https://accounts.zoho.eu/oauth/v2/token',
                method: 'post',
                params: {
                  grant_type: 'refresh_token',
                  refresh_token: account.refresh_token,
                  client_id: account.client_id,
                  client_secret: account.client_secret,
                },
              })
              .then((response) => response.data);

            return await axios
              .request({
                url,
                method: 'get',
                params: {
                  limit,
                  status: 'unread',
                  start,
                },
                headers: {
                  Authorization: 'Bearer ' + tokens.access_token,
                },
              })
              .then((response) => {
                return response.data.data;
              });
          });

        unread = unread.concat(response);

        start += limit;
      } while (response.length == limit);
    }
    console.log('before auth');
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    console.log('after auth');

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1RyQHKxIICvGLmDcACpbBNTvn42kVpFVVRURWasc68hk';

    const getResponse = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Sheet1',
    });

    const rows = getResponse.data.values as string[][];


    const convertedForSheets: string[][] = [];

    unread.forEach((list) => {
      if (rows.flat().includes(list.messageId)) return;

      convertedForSheets.push([
        list.summary,
        list.sentDateInGMT,
        list.calendarType,
        list.subject,
        list.messageId,
        list.flagid,
        list.status2,
        list.priority,
        list.hasInline,
        list.toAddress,
        list.folderId,
        list.ccAddress,
        list.hasAttachment,
        list.size,
        list.sender,
        list.receivedTime,
        list.fromAddress,
        list.status,
      ]);
    });

    console.log('before append');

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
      range: 'Sheet1!A:B',
      requestBody: {
        values: convertedForSheets,
      },
    });

    console.log('after append my shits works ok');
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

export const main = hello;
