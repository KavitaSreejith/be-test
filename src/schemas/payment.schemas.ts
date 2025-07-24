import { z } from 'zod';

export const CreatePaymentSchema = z.object({
  amount: z.union([
    // Handle number inputs
    z.number().refine(
      (val) => val > 0,
      { message: 'Amount must be a positive number' }
    ),
    // Handle string inputs (like "123.45")
    z.string().transform((val, ctx) => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount is required',
        });
        return z.NEVER;
      }
      if (parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount must be a positive number',
        });
        return z.NEVER;
      }
      return parsed;
    })
  ]).refine(
    // Final check to ensure we have a valid number
    (val) => typeof val === 'number' && val > 0,
    { message: 'Amount must be a positive number' }
  ),
  currency: z.string({
    required_error: 'Currency is required',
    invalid_type_error: 'Currency is required'
  })
    .trim()
    .min(1, 'Currency must be a non-empty string')
    .transform(val => val.toUpperCase())
}).strict()
.refine(
  (data) => {
    // Additional validation to ensure amount and currency exist
    return data.amount !== undefined && data.amount !== null && data.currency;
  },
  { message: 'Valid payment object is required' }
);

export const PaymentIdSchema = z.string({
  required_error: 'Payment ID is required',
  invalid_type_error: 'Payment ID is required'
})
  .refine(
    (val) => {
      // Handle null/undefined/empty cases
      if (!val) return false;
      const trimmed = val.trim();
      return trimmed.length > 0;
    },
    { message: 'Payment ID cannot be empty' }
  )
  .refine(
    (val) => {
      // Validate UUID format on the trimmed value
      if (!val) return false;
      const trimmed = val.trim();
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trimmed);
    },
    { message: 'Payment ID must be a valid UUID format' }
  )
  .transform(val => val?.trim() || ''); // Transform at the end to return trimmed value

export const CurrencyFilterSchema = z.string()
  .optional()
  .transform(val => {
    if (!val) return undefined;
    const trimmed = val.trim();
    return trimmed ? trimmed.toUpperCase() : undefined;
  });

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type PaymentId = z.infer<typeof PaymentIdSchema>;
export type CurrencyFilter = z.infer<typeof CurrencyFilterSchema>;