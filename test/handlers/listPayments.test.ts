import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

// Mock the logger first
jest.mock('../../src/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
  logWithContext: jest.fn(),
}));

// Mock DynamoDB completely
jest.mock('../../src/lib/dynamodb', () => ({
  DocumentClient: {
    send: jest.fn(),
  },
  DynamoDB: jest.fn(),
}));

// Mock the repository
jest.mock('../../src/repositories/payment.repository', () => ({
  DynamoDBPaymentRepository: jest.fn(),
}));

// Create a mock service that we can control
const mockCreatePayment = jest.fn();
const mockGetPaymentById = jest.fn();
const mockListPayments = jest.fn();

// Mock the service module completely
jest.mock('../../src/services/payment.service', () => ({
  PaymentService: jest.fn().mockImplementation(() => ({
    createPayment: mockCreatePayment,
    getPaymentById: mockGetPaymentById,
    listPayments: mockListPayments,
  }))
}));

// Now import the handler
import { handler } from '../../src/handlers/listPayments';

describe('listPayments Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (queryParams?: Record<string, string>): APIGatewayProxyEvent => ({
    body: null,
    pathParameters: null,
    queryStringParameters: queryParams || null,
    headers: {},
    httpMethod: 'GET',
    path: '/payments',
    resource: '',
    requestContext: {} as any,
    stageVariables: null,
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: null,
  });

  const createMockContext = (): Context => ({
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '1',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test',
    logStreamName: 'test-stream',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  });

  describe('Question 5: Filter by currency', () => {
    it('should return all payments when no currency filter provided', async () => {
      // Arrange
      const mockPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' },
        { paymentId: '2', amount: 200, currency: 'EUR' }
      ];
      mockListPayments.mockResolvedValue(mockPayments);

      // Act
      const result = await handler(createMockEvent(), createMockContext(), () => {});

      // Assert - Question 5: List all when no filter
      expect((result as APIGatewayProxyResult).statusCode).toBe(200);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual(mockPayments);
      expect(mockListPayments).toHaveBeenCalledWith(undefined);
    });

    it('should filter by currency when provided', async () => {
      // Arrange
      const currency = 'USD';
      const mockFilteredPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' }
      ];
      mockListPayments.mockResolvedValue(mockFilteredPayments);

      // Act
      const result = await handler(createMockEvent({ currency }), createMockContext(), () => {});

      // Assert - Question 5: Filter by currency
      expect((result as APIGatewayProxyResult).statusCode).toBe(200);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual(mockFilteredPayments);
      expect(mockListPayments).toHaveBeenCalledWith('USD');
    });

    it('should handle empty currency parameter', async () => {
      // Arrange
      const mockPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' },
        { paymentId: '2', amount: 200, currency: 'EUR' }
      ];
      mockListPayments.mockResolvedValue(mockPayments);

      // Act
      const result = await handler(createMockEvent({ currency: '' }), createMockContext(), () => {});

      // Assert - Question 5: Empty currency should list all
      expect((result as APIGatewayProxyResult).statusCode).toBe(200);
      expect(mockListPayments).toHaveBeenCalledWith(undefined);
    });

    it('should normalize currency to uppercase', async () => {
      // Arrange
      const mockFilteredPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' }
      ];
      mockListPayments.mockResolvedValue(mockFilteredPayments);

      // Act
      const result = await handler(createMockEvent({ currency: 'usd' }), createMockContext(), () => {});

      // Assert - Question 5: Currency normalization
      expect((result as APIGatewayProxyResult).statusCode).toBe(200);
      expect(mockListPayments).toHaveBeenCalledWith('USD');
    });
  });
});