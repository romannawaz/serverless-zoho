import type { AWS } from '@serverless/typescript';

import unread from '@functions/unread';
import user from '@functions/user';
import register from '@functions/register';

import { handlerPath } from './src/libs/handler-resolver';

const serverlessConfiguration: AWS = {
  service: 'aws-serverless-typescript-api',
  frameworkVersion: '3',
  plugins: ['serverless-bundle', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { unread, user, register },
  package: {
    individually: true,
    include: [`${handlerPath(__dirname)}/credentials.json`],
  },
  custom: {
    bundle: {
      copyFiles: [
        { from: `${handlerPath(__dirname)}/credentials.json`, to: './' },
      ],
    },
  },
};

module.exports = serverlessConfiguration;
