import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentRepository } from '../types/payment.types';
import { CreatePaymentInput } from '../schemas/payment.schemas';
import { logger } from '../utils/logger';

export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createPayment(input: CreatePaymentInput): Promise<Payment> {
    const paymentId = uuidv4();
    
    const payment: Payment = {
      paymentId,
      amount: input.amount,
      currency: input.currency,
    };

    logger.info('Creating new payment', {
      paymentId,
      amount: payment.amount,
      currency: payment.currency
    });

    await this.paymentRepository.create(payment);
    
    logger.info('Payment created successfully', { paymentId });
    return payment;
  }

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    logger.info('Retrieving payment', { paymentId });
    
    const payment = await this.paymentRepository.getById(paymentId);
    
    if (!payment) {
      logger.info('Payment not found', { paymentId });
    } else {
      logger.info('Payment retrieved successfully', { paymentId });
    }
    
    return payment;
  }

  // Matches the exact logic from listPaymentsWithFilter
  async listPayments(currencyFilter?: string): Promise<Payment[]> {
    // If no filter provided or empty filter, use the regular listPayments function
    if (!currencyFilter) {
      logger.info('Listing all payments');
      return await this.paymentRepository.listAll();
    }
    
    // If currency filter is provided, use filtered list
    logger.info('Listing payments with currency filter', { currency: currencyFilter });
    return await this.paymentRepository.listByCurrency(currencyFilter);
  }
}