import { PaymentService } from '../../src/services/payment.service';
import { PaymentRepository } from '../../src/types/payment.types';

// Mock UUID properly
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

// Mock the logger completely
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

import { v4 as uuidv4 } from 'uuid';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockRepository: jest.Mocked<PaymentRepository>;

  beforeEach(() => {
    mockRepository = {
      getById: jest.fn(),
      create: jest.fn(),
      listAll: jest.fn(),
      listByCurrency: jest.fn(),
    };
    paymentService = new PaymentService(mockRepository);
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should generate unique ID internally (Question 2)', async () => {
      // Arrange
      const testUuid = 'test-uuid-123';
      (uuidv4 as jest.Mock).mockReturnValue(testUuid);
      const input = { amount: 100, currency: 'USD' };
      mockRepository.create.mockResolvedValue();

      // Act
      const result = await paymentService.createPayment(input);

      // Assert - Question 2: Generate unique ID internally
      expect(result.paymentId).toBe(testUuid);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith({
        paymentId: testUuid,
        amount: 100,
        currency: 'USD'
      });
    });

    it('should preserve input data with generated ID', async () => {
      // Arrange
      const testUuid = 'test-uuid-456';
      (uuidv4 as jest.Mock).mockReturnValue(testUuid);
      const input = { amount: 250.50, currency: 'EUR' };
      mockRepository.create.mockResolvedValue();

      // Act
      const result = await paymentService.createPayment(input);

      // Assert
      expect(result).toEqual({
        paymentId: testUuid,
        amount: 250.50,
        currency: 'EUR'
      });
    });
  });

  describe('getPaymentById', () => {
    it('should retrieve payment by ID (Question 1)', async () => {
      // Arrange
      const paymentId = 'existing-payment-id';
      const mockPayment = {
        paymentId,
        amount: 100,
        currency: 'USD'
      };
      mockRepository.getById.mockResolvedValue(mockPayment);

      // Act
      const result = await paymentService.getPaymentById(paymentId);

      // Assert - Question 1: Retrieve payment by ID
      expect(result).toEqual(mockPayment);
      expect(mockRepository.getById).toHaveBeenCalledWith(paymentId);
    });

    it('should return null when payment not found (Question 3)', async () => {
      // Arrange
      const paymentId = 'non-existent-id';
      mockRepository.getById.mockResolvedValue(null);

      // Act
      const result = await paymentService.getPaymentById(paymentId);

      // Assert - Question 3: Return null when not found
      expect(result).toBeNull();
      expect(mockRepository.getById).toHaveBeenCalledWith(paymentId);
    });
  });

  describe('listPayments', () => {
    it('should list all payments when no filter provided (Question 5)', async () => {
      // Arrange
      const mockPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' },
        { paymentId: '2', amount: 200, currency: 'EUR' }
      ];
      mockRepository.listAll.mockResolvedValue(mockPayments);

      // Act
      const result = await paymentService.listPayments();

      // Assert - Question 5: List all when no filter
      expect(result).toEqual(mockPayments);
      expect(mockRepository.listAll).toHaveBeenCalledTimes(1);
      expect(mockRepository.listByCurrency).not.toHaveBeenCalled();
    });

    it('should filter by currency when provided (Question 5)', async () => {
      // Arrange
      const currency = 'USD';
      const mockFilteredPayments = [
        { paymentId: '1', amount: 100, currency: 'USD' }
      ];
      mockRepository.listByCurrency.mockResolvedValue(mockFilteredPayments);

      // Act
      const result = await paymentService.listPayments(currency);

      // Assert - Question 5: Filter by currency
      expect(result).toEqual(mockFilteredPayments);
      expect(mockRepository.listByCurrency).toHaveBeenCalledWith(currency);
      expect(mockRepository.listAll).not.toHaveBeenCalled();
    });
  });
});