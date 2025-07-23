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

// Mock DynamoDB
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
import { handler } from '../../src/handlers/createPayment';

describe('createPayment Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockEvent = (body: any): APIGatewayProxyEvent => ({
    body: JSON.stringify(body),
    pathParameters: null,
    queryStringParameters: null,
    headers: {},
    httpMethod: 'POST',
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

  describe('Question 2: Generate unique ID internally', () => {
    it('should create payment and return generated ID', async () => {
      // Arrange
      const input = { 
        amount: 100,
        currency: 'USD'
      };
      
      const mockCreatedPayment = {
        paymentId: 'generated-uuid-123',
        amount: 100,
        currency: 'USD'
      };
      
      // Set up the mock to return the expected payment object
      mockCreatePayment.mockResolvedValue(mockCreatedPayment);

      // Create a clean event
      const event = createMockEvent(input);
      
      // Act
      const result = await handler(event, createMockContext(), () => {});

      // Assert
      expect((result as APIGatewayProxyResult).statusCode).toBe(201);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(true);
      expect(responseBody.paymentId).toBe('generated-uuid-123');
      expect(responseBody.amount).toBe(100);
      expect(responseBody.currency).toBe('USD');
      expect(mockCreatePayment).toHaveBeenCalledWith({ amount: 100, currency: 'USD' });
    });
  });

  describe('Question 4: Request validation', () => {
    it('should return 400 when body is missing', async () => {
      // Arrange
      const eventWithoutBody: APIGatewayProxyEvent = {
        ...createMockEvent({}),
        body: null
      };

      // Act
      const result = await handler(eventWithoutBody, createMockContext(), () => {});

      // Assert - Question 4: Validation for missing body
      expect((result as APIGatewayProxyResult).statusCode).toBe(400);
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('should return 422 when amount is invalid', async () => {
      // Arrange
      const invalidInput = { amount: 'invalid', currency: 'USD' };

      // Act
      const result = await handler(createMockEvent(invalidInput), createMockContext(), () => {});

      // Assert - Question 4: Validation for invalid data
      expect((result as APIGatewayProxyResult).statusCode).toBe(422);
      const responseBody = JSON.parse((result as APIGatewayProxyResult).body);
      expect(responseBody.success).toBe(false);
      expect(responseBody.message).toContain('Amount');
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('should return 422 when currency is missing', async () => {
      // Arrange
      const invalidInput = { amount: 100 }; // Missing currency

      // Act
      const result = await handler(createMockEvent(invalidInput), createMockContext(), () => {});

      // Assert - Question 4: Validation for missing currency
      expect((result as APIGatewayProxyResult).statusCode).toBe(422);
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('should return 422 when amount is negative', async () => {
      // Arrange
      const invalidInput = { amount: -10, currency: 'USD' };

      // Act
      const result = await handler(createMockEvent(invalidInput), createMockContext(), () => {});

      // Assert - Question 4: Validation for negative amount
      expect((result as APIGatewayProxyResult).statusCode).toBe(422);
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });

    it('should return 400 when JSON is malformed', async () => {
      // Arrange
      const eventWithBadJson: APIGatewayProxyEvent = {
        ...createMockEvent({}),
        body: 'invalid json {'
      };

      // Act
      const result = await handler(eventWithBadJson, createMockContext(), () => {});

      // Assert - Question 4: Handle malformed JSON
      expect((result as APIGatewayProxyResult).statusCode).toBe(400);
      expect(mockCreatePayment).not.toHaveBeenCalled();
    });
  });
});