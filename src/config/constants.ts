
export const CONFIG = {
    AWS: {
      REGION: process.env.AWS_REGION || 'ap-southeast-2',
      DYNAMODB_ENDPOINT: process.env.MOCK_DYNAMODB_ENDPOINT || 'http://localhost:8000',
    },
    TABLES: {
      PAYMENTS: process.env.PAYMENTS_TABLE || 'Payments',
    },
    ENVIRONMENT: {
      IS_TEST: process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test',
      NODE_ENV: process.env.NODE_ENV || 'development',
    },
  } as const;
  