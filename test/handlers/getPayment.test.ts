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
  DocumentClient: { send: jest.fn() },
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
import { handler } from '../../src/handlers/getPayment';

describe('getPayment Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (paymentId: string): APIGatewayProxyEvent => ({
    body: null,
    pathParameters: { id: paymentId },
    queryStringParameters: null,
    headers: {},
    httpMethod: 'GET',
    path: `/payments/${paymentId}`,
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

  describe('Question 1: Retrieve payment by ID', () => {
    it('should return payment when found', async () => {
      // Arrange
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      const mockPayment = {
        paymentId,
        amount: 100,
        currency: 'USD'
      };
      mockGetPaymentById.mockResolvedValue(mockPayment);

      // Act
      const result = await handler(createMockEvent(paymentId), createMockContext(), () => {});

      // Assert - Question 1: Retrieve payment by ID
      expect((result as APIGatewayProxyResult).statusCode).toBe(200);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.data).toEqual(mockPayment);
      expect(mockGetPaymentById).toHaveBeenCalledWith(paymentId);
    });
  });

  describe('Question 3: Return 404 when payment not found', () => {
    it('should return 404 when payment does not exist', async () => {
      // Arrange
      const paymentId = '123e4567-e89b-12d3-a456-426614174000';
      mockGetPaymentById.mockResolvedValue(null);

      // Act
      const result = await handler(createMockEvent(paymentId), createMockContext(), () => {});

      // Assert - Question 3: Return 404 when not found
      expect((result as APIGatewayProxyResult).statusCode).toBe(404);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toBe('Payment not found');
      expect(mockGetPaymentById).toHaveBeenCalledWith(paymentId);
    });
  });

  describe('Path parameter validation', () => {
    it('should return 400 when payment ID is invalid UUID', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act
      const result = await handler(createMockEvent(invalidId), createMockContext(), () => {});

      // Assert
      expect((result as APIGatewayProxyResult).statusCode).toBe(400);
      expect(mockGetPaymentById).not.toHaveBeenCalled();
    });

    it('should return 400 when payment ID is missing', async () => {
      // Arrange
      const eventWithoutId: APIGatewayProxyEvent = {
        ...createMockEvent(''),
        pathParameters: null
      };

      // Act
      const result = await handler(eventWithoutId, createMockContext(), () => {});

      // Assert
      expect((result as APIGatewayProxyResult).statusCode).toBe(400);
      expect(mockGetPaymentById).not.toHaveBeenCalled();
    });
  });
});