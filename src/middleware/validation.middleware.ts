import { z } from 'zod';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from '../lib/lambda';
import { responses } from '../lib/lambda';
import { logger } from '../utils/logger';

export interface ValidationContext {
  body?: any;
  pathParams?: Record<string, any>;
  queryParams?: Record<string, any>;
}

export type ValidatedHandler = (
  event: APIGatewayProxyEvent,
  context: ValidationContext
) => Promise<APIGatewayProxyResult>;

export interface ValidationConfig {
  body?: z.ZodSchema;
  pathParams?: Record<string, z.ZodSchema>;
  queryParams?: Record<string, z.ZodSchema>;
}

export const withValidation = (
  config: ValidationConfig,
  handler: ValidatedHandler
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const context: ValidationContext = {};
    
    try {
      // Validate request body
      if (config.body) {
        if (!event.body) {
          // Handle missing body (matches original "Valid request body is required")
          logger.warn('Request body is missing');
          return responses.badRequest('Valid request body is required');
        }
        
        try {
          const parsedBody = JSON.parse(event.body);
          context.body = config.body.parse(parsedBody);
        } catch (error) {
          if (error instanceof z.ZodError) {
            logger.warn('Body validation failed', { errors: error.errors });
            // Use unprocessableEntity for validation errors (matches original behavior)
            return responses.unprocessableEntity(
              error.errors.map(e => e.message).join(', ')
            );
          }
          logger.error('JSON parsing failed', { error });
          return responses.badRequest('Valid request body is required');
        }
      }

      // Validate path parameters
      if (config.pathParams) {
        context.pathParams = {};
        for (const [key, schema] of Object.entries(config.pathParams)) {
          try {
            const value = event.pathParameters?.[key];
            context.pathParams[key] = schema.parse(value);
          } catch (error) {
            if (error instanceof z.ZodError) {
              logger.warn('Path parameter validation failed', { param: key, errors: error.errors });
              return responses.badRequest(
                error.errors.map(e => e.message).join(', ')
              );
            }
            throw error;
          }
        }
      }

      // Validate query parameters
      if (config.queryParams) {
        context.queryParams = {};
        for (const [key, schema] of Object.entries(config.queryParams)) {
          try {
            const value = event.queryStringParameters?.[key];
            context.queryParams[key] = schema.parse(value);
          } catch (error) {
            if (error instanceof z.ZodError) {
              logger.warn('Query parameter validation failed', { param: key, errors: error.errors });
              return responses.badRequest(
                error.errors.map(e => e.message).join(', ')
              );
            }
            throw error;
          }
        }
      }

      return await handler(event, context);
    } catch (error) {
      logger.error('Validation middleware error', { error });
      return responses.badRequest('Validation error');
    }
  };
};