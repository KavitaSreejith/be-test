import { APIGatewayProxyEvent, APIGatewayProxyResult, wrapHandler, responses } from '../lib/lambda';
import { withValidation, ValidationContext } from '../middleware/validation.middleware'
import { CreatePaymentSchema } from '../schemas/payment.schemas';
import { PaymentService } from '../services/payment.service';
import { DynamoDBPaymentRepository } from '../repositories/payment.repository';

const paymentRepository = new DynamoDBPaymentRepository();
const paymentService = new PaymentService(paymentRepository);

const createPaymentHandler = async (
  event: APIGatewayProxyEvent,
  context: ValidationContext
): Promise<APIGatewayProxyResult> => {
  const payment = await paymentService.createPayment(context.body);
  
  return responses.created({
    paymentId: payment.paymentId,
    amount: payment.amount,
    currency: payment.currency
  });
};

export const handler = wrapHandler(
  withValidation(
    { body: CreatePaymentSchema },
    createPaymentHandler
  )
);
