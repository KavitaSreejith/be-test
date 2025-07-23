import { APIGatewayProxyEvent, APIGatewayProxyResult, wrapHandler, responses } from '../lib/lambda';
import { withValidation, ValidationContext } from '../middleware/validation.middleware';
import { CurrencyFilterSchema } from '../schemas/payment.schemas';
import { PaymentService } from '../services/payment.service';
import { DynamoDBPaymentRepository } from '../repositories/payment.repository';

const paymentRepository = new DynamoDBPaymentRepository();
const paymentService = new PaymentService(paymentRepository);

const listPaymentsHandler = async (
  event: APIGatewayProxyEvent,
  context: ValidationContext
): Promise<APIGatewayProxyResult> => {
  const currencyFilter = context.queryParams?.currency;
  const payments = await paymentService.listPayments(currencyFilter);
  
  return responses.ok(payments);
};

export const handler = wrapHandler(
  withValidation(
    { queryParams: { currency: CurrencyFilterSchema } },
    listPaymentsHandler
  )
);