import { DynamoDBPaymentRepository } from '../../src/repositories/payment.repository';
import { DocumentClient } from '../../src/lib/dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Mock the DynamoDB client
jest.mock('../../src/lib/dynamodb', () => ({
  DocumentClient: {
    send: jest.fn(),
  },
}));

const mockDocumentClient = DocumentClient as jest.Mocked<typeof DocumentClient>;

describe('DynamoDBPaymentRepository', () => {
  let repository: DynamoDBPaymentRepository;

  beforeEach(() => {
    repository = new DynamoDBPaymentRepository();
    jest.clearAllMocks();
  });

  describe('getById', () => {
    it('should retrieve payment by ID', async () => {
      // Arrange
      const paymentId = 'test-id';
      const mockPayment = { paymentId, amount: 100, currency: 'USD' };
      (mockDocumentClient.send as jest.Mock).mockResolvedValue({ Item: mockPayment });

      // Act
      const result = await repository.getById(paymentId);

      // Assert
      expect(result).toEqual(mockPayment);
      expect(mockDocumentClient.send).toHaveBeenCalledWith(
        expect.any(GetCommand)
      );
    });

    it('should return null when payment not found', async () => {
      // Arrange
      (mockDocumentClient.send as jest.Mock).mockResolvedValue({});

      // Act
      const result = await repository.getById('non-existent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create payment', async () => {
      // Arrange
      const payment = { paymentId: 'test-id', amount: 100, currency: 'USD' };
      (mockDocumentClient.send as jest.Mock).mockResolvedValue({});

      // Act
      await repository.create(payment);

      // Assert
      expect(mockDocumentClient.send).toHaveBeenCalledWith(
        expect.any(PutCommand)
      );
    });
  });

  describe('listAll', () => {
    it('should return all payments', async () => {
      // Arrange
      const mockPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' },
        { paymentId: '2', amount: 200, currency: 'EUR' }
      ];
      (mockDocumentClient.send as jest.Mock).mockResolvedValue({ Items: mockPayments });

      // Act
      const result = await repository.listAll();

      // Assert
      expect(result).toEqual(mockPayments);
      expect(mockDocumentClient.send).toHaveBeenCalledWith(
        expect.any(ScanCommand)
      );
    });
  });

  describe('listByCurrency', () => {
    it('should filter payments by currency', async () => {
      // Arrange
      const currency = 'USD';
      const mockFilteredPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' }
      ];
      (mockDocumentClient.send as jest.Mock).mockResolvedValue({ Items: mockFilteredPayments });

      // Act
      const result = await repository.listByCurrency(currency);

      // Assert
      expect(result).toEqual(mockFilteredPayments);
      expect(mockDocumentClient.send).toHaveBeenCalledWith(
        expect.any(ScanCommand)
      );
    });
  });
});