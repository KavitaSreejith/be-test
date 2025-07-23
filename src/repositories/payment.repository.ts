import { DocumentClient } from '../lib/dynamodb';
import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Payment, PaymentRepository } from '../types/payment.types';
import { CONFIG } from '../config/constants';
import { logger } from '../utils/logger';

export class DynamoDBPaymentRepository implements PaymentRepository {
  private readonly tableName = CONFIG.TABLES.PAYMENTS;

  // Matches: getPayment function
  async getById(paymentId: string): Promise<Payment | null> {
    try {
      logger.debug('Fetching payment by ID', { paymentId, tableName: this.tableName });
      
      const result = await DocumentClient.send(
        new GetCommand({
          TableName: this.tableName,
          Key: { paymentId },
        })
      );

      // Exact same logic as original: (result.Item as Payment) || null
      const payment = (result.Item as Payment) || null;
      logger.debug('Payment fetch result', { paymentId, found: !!payment });
      
      return payment;
    } catch (error) {
      logger.error('Error fetching payment by ID', { paymentId, error });
      throw error;
    }
  }

  // Matches: createPayment function
  async create(payment: Payment): Promise<void> {
    try {
      logger.debug('Creating payment', { 
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        tableName: this.tableName
      });
      
      // Exact same logic as original createPayment
      await DocumentClient.send(
        new PutCommand({
          TableName: this.tableName,
          Item: payment,
        })
      );

      logger.info('Payment created successfully', { paymentId: payment.paymentId });
    } catch (error) {
      logger.error('Error creating payment', { paymentId: payment.paymentId, error });
      throw error;
    }
  }

  // Matches: listPayments function
  async listAll(): Promise<Payment[]> {
    try {
      logger.debug('Listing all payments', { tableName: this.tableName });
      
      const result = await DocumentClient.send(
        new ScanCommand({
          TableName: this.tableName,
        })
      );

      // Exact same logic as original: (result.Items as Payment[]) || []
      const payments = (result.Items as Payment[]) || [];
      logger.debug('Listed payments', { count: payments.length });
      
      return payments;
    } catch (error) {
      logger.error('Error listing all payments', { error });
      throw error;
    }
  }

  // Matches: listPaymentsWithFilter function
  async listByCurrency(currency: string): Promise<Payment[]> {
    try {
      // Exact same normalization logic as original
      const normalizedCurrency = currency.toUpperCase();
      logger.debug('Listing payments by currency', { 
        currency: normalizedCurrency,
        tableName: this.tableName
      });

      // Exact same query structure as original
      const params = {
        TableName: this.tableName,
        FilterExpression: 'currency = :currency',
        ExpressionAttributeValues: {
          ':currency': normalizedCurrency
        }
      };

      const result = await DocumentClient.send(new ScanCommand(params));
      // Exact same casting logic as original: (result.Items || []) as Payment[]
      const payments = (result.Items || []) as Payment[];
      
      logger.debug('Listed payments by currency', { 
        currency: normalizedCurrency,
        count: payments.length
      });
      
      return payments;
    } catch (error) {
      logger.error('Error listing payments by currency', { currency, error });
      throw error;
    }
  }
}