---

# 📄 Assumptions and Future Enhancements

## Assumptions

1. **DynamoDB Table Schema**

   * Assumed the table has `paymentId` as the partition key.
   * No sort key is required for the current use case.

2. **Unique ID Generation**

   * A UUID (via `crypto.randomUUID()` or `uuid` package) is sufficient to uniquely identify a payment.

3. **Payment Fields**

   * Required fields for `createPayment` are:

     * `amount`: Positive number
     * `currency`: ISO currency code (e.g., "USD", "NZD")
   * Optional fields or metadata were not specified, so none were added.

4. **Validation Strategy**

   * `zod` is used for schema validation, assuming it's acceptable as a lightweight and expressive validation library.
   * Assumed it's acceptable to return `422 Unprocessable Entity` for failed validation instead of `400 Bad Request`.

5. **API Gateway Integration**

   * Assumed AWS API Gateway will invoke the Lambda functions and populate the `APIGatewayProxyEvent` object accordingly.
   * Expected path parameters like `event.pathParameters.paymentId` and query parameters like `event.queryStringParameters.currency`.

---

## Future Enhancements

1. **Pagination for `listPayments`**

   * Support for `limit` and `lastEvaluatedKey` to enable paginated result sets.
   * Useful for large datasets and production readiness.

2. **Currency Validation**

   * Add ISO 4217 currency code validation to prevent invalid or unsupported currency values.
   * Optionally fetch supported currencies from a config or external service.

3. **Error Handling Middleware**

   * Abstract error handling into a centralized middleware or error handler.
   * Ensure consistent formatting of all error responses (including stack traces in dev vs prod).

4. **Additional Fields in Payment Object**

   * Add support for optional metadata like description, created timestamp, or status (`pending`, `processed`, `failed`).
   * Extend schema validation and database writes accordingly.

5. **Unit + Integration Testing Improvements**

   * Add mocks for DynamoDB in repository tests.
   * Use tools like `dynamodb-local` or `@aws-sdk/client-dynamodb` mocks for faster and more isolated integration testing.

6. **CI/CD Readiness**

   * Add scripts for linting, formatting, and running tests.
   * Include a GitHub Actions workflow or CDK deployment strategy for full-stack automation.

7. **Security and Auditing**

   * Add basic auth or token-based auth validation to API handlers.
   * Include request tracing and logging with correlation IDs for observability.

---
