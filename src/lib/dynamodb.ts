import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { CONFIG } from '../config/constants';
import { logger } from '../utils/logger';

let clientConfig;

if (CONFIG.ENVIRONMENT.IS_TEST) {
  clientConfig = {
    endpoint: CONFIG.AWS.DYNAMODB_ENDPOINT,
    region: 'local-env',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test'
    }
  };
  logger.info('Using test DynamoDB configuration', { endpoint: clientConfig.endpoint });
} else {
  clientConfig = {
    region: CONFIG.AWS.REGION,
  };
  logger.info('Using AWS DynamoDB configuration', { region: CONFIG.AWS.REGION });
}

export const DynamoDB = new DynamoDBClient(clientConfig);
export const DocumentClient = DynamoDBDocumentClient.from(DynamoDB);
