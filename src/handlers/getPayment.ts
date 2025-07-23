import { APIGatewayProxyEvent, APIGatewayProxyResult, wrapHandler, responses } from '../lib/lambda';
import { withValidation, ValidationContext } from '../middleware/validation.middleware';
import { PaymentIdSchema } from '../schemas/payment.schemas';
import { PaymentService } from '../services/payment.service';
import { DynamoDBPaymentRepository } from '../repositories/payment.repository';

const paymentRepository = new DynamoDBPaymentRepository();
const paymentService = new PaymentService(paymentRepository);

const getPaymentHandler = async (
  event: APIGatewayProxyEvent,
  context: ValidationContext
): Promise<APIGatewayProxyResult> => {
  const paymentId = context.pathParams!.id;
  const payment = await paymentService.getPaymentById(paymentId);
  
  if (!payment) {
    return responses.notFound('Payment not found');
  }
  
  return responses.ok(payment);
};

export const handler = wrapHandler(
  withValidation(
    { pathParams: { id: PaymentIdSchema } },
    getPaymentHandler
  )
);