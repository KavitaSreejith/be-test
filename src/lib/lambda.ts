import { 
    APIGatewayProxyEvent, 
    APIGatewayProxyResult,
    APIGatewayProxyHandler
} from 'aws-lambda';
import { buildResponse } from './apigateway';
import { validate as isValidUuid } from 'uuid';

/**
 * Re-export the AWS Lambda types for convenience
 */
export { APIGatewayProxyEvent, APIGatewayProxyResult };

/**
 * Type for Lambda handler functions that process API Gateway events
 */
export type LambdaHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

/**
 * Wraps a Lambda handler function with standard error handling and logging
 * 
 * @param handler The Lambda handler function to wrap
 * @returns Wrapped handler with error handling
 */
export const wrapHandler = (handler: LambdaHandler): APIGatewayProxyHandler => {
    return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            // Log the incoming event (without sensitive data)
            console.log('Processing event:', {
                path: event.path,
                httpMethod: event.httpMethod,
                queryParams: event.queryStringParameters,
                hasBody: !!event.body
            });
            
            // Execute the handler
            return await handler(event);
        } catch (error) {
            // Log the error with details
            console.error('Unhandled error in Lambda handler:', error);
            
            // Return a standard error response
            return buildResponse(500, {
                success: false,
                message: 'Internal server error'
            });
        }
    };
};

/**
 * Gets a path parameter safely with type checking
 * 
 * @param event API Gateway event
 * @param paramName Name of the path parameter
 * @returns The parameter value or null if not found
 */
export const getPathParam = (
    event: APIGatewayProxyEvent,
    paramName: string
): string | null => {
    return event.pathParameters?.[paramName] || null;
};

/**
 * Gets query parameters with a fallback to empty object
 * 
 * @param event API Gateway event
 * @returns Query parameters or empty object
 */
export const getQueryParams = (
    event: APIGatewayProxyEvent
): Record<string, string | undefined> => {
    return event.queryStringParameters || {};
};

/**
 * Extracts and validates request body
 * 
 * @param event API Gateway event
 * @returns Parsed body object or null if invalid
 */
export const getBody = <T = Record<string, any>>(event: APIGatewayProxyEvent): T | null => {
    if (!event.body) {
        return null;
    }
    
    try {
        return JSON.parse(event.body) as T;
    } catch (error) {
        console.error('Error parsing request body:', error);
        return null;
    }
};

/**
 * Validates if a string is a valid UUID
 * 
 * @param id String to validate
 * @returns True if string is a valid UUID
 */
export const isUuid = (id: string): boolean => {
    return isValidUuid(id);
};

/**
 * Common response builders for standard error scenarios
 */
export const responses = {
    /**
     * Creates a 400 Bad Request response
     * 
     * @param message Error message
     * @returns API Gateway response
     */
    badRequest: (message: string): APIGatewayProxyResult => {
        return buildResponse(400, {
            success: false,
            message
        });
    },
    
    /**
     * Creates a 404 Not Found response
     * 
     * @param message Error message
     * @returns API Gateway response
     */
    notFound: (message: string): APIGatewayProxyResult => {
        return buildResponse(404, {
            success: false,
            message
        });
    },
    
    /**
     * Creates a 422 Unprocessable Entity response
     * 
     * @param message Error message
     * @returns API Gateway response
     */
    unprocessableEntity: (message: string): APIGatewayProxyResult => {
        return buildResponse(422, {
            success: false,
            message
        });
    },
    
    /**
     * Creates a 200 OK success response
     * 
     * @param data Response data
     * @returns API Gateway response
     */
    ok: (data: any): APIGatewayProxyResult => {
        return buildResponse(200, {
            success: true,
            data
        });
    },
    
    /**
     * Creates a 201 Created success response
     * 
     * @param data Response data
     * @returns API Gateway response
     */
    created: (data: any): APIGatewayProxyResult => {
        return buildResponse(201, {
            success: true,
            ...data
        });
    }
};