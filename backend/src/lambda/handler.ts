import serverless from 'serverless-http';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import app from '../app';

// Environment detection
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Logging utility
const logger = {
  info: (message: string, data?: any) => {
    if (isLambda) {
      console.log(JSON.stringify({ level: 'info', message, data, timestamp: new Date().toISOString() }));
    } else {
      console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
  error: (message: string, error?: any) => {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    
    if (isLambda) {
      console.error(JSON.stringify({ level: 'error', message, error: errorData, timestamp: new Date().toISOString() }));
    } else {
      console.error(`[ERROR] ${message}`, errorData);
    }
  },
  warn: (message: string, data?: any) => {
    if (isLambda) {
      console.warn(JSON.stringify({ level: 'warn', message, data, timestamp: new Date().toISOString() }));
    } else {
      console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
};

// Create serverless handler with optimized configuration
const serverlessHandler = serverless(app, {
  request: {
    key: 'apiGateway',
  },
  response: {
    headers: {
      'X-Powered-By': 'Cat Colony Lambda',
      'X-Environment': isLambda ? 'lambda' : 'local',
    },
  },
  // Binary media types for file uploads
  binary: [
    'image/*',
    'application/octet-stream',
  ],
});

// Cold start tracking
let isColdStart = true;

// Export handler for AWS Lambda
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const startTime = Date.now();
  const requestId = context.awsRequestId;
  
  // Log cold start
  if (isColdStart) {
    logger.info('Lambda cold start', {
      requestId,
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      memoryLimitInMB: context.memoryLimitInMB,
      remainingTimeInMillis: context.getRemainingTimeInMillis(),
    });
    isColdStart = false;
  }

  // Log incoming request
  logger.info('Incoming request', {
    requestId,
    httpMethod: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters,
    headers: isDevelopment ? event.headers : { 
      'user-agent': event.headers['user-agent'],
      'content-type': event.headers['content-type'],
      'authorization': event.headers.authorization ? '[REDACTED]' : undefined,
    },
    remainingTimeInMillis: context.getRemainingTimeInMillis(),
  });

  // Ensure context doesn't wait for empty event loop
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Call the serverless handler
    const result = await serverlessHandler(event, context) as APIGatewayProxyResult;
    
    const duration = Date.now() - startTime;
    
    // Log successful response
    logger.info('Request completed', {
      requestId,
      statusCode: result.statusCode,
      duration,
      remainingTimeInMillis: context.getRemainingTimeInMillis(),
    });

    // Log full response in development
    if (isDevelopment) {
      logger.info('Full response', { requestId, response: result });
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Lambda handler error', {
      requestId,
      error,
      duration,
      remainingTimeInMillis: context.getRemainingTimeInMillis(),
      event: isDevelopment ? event : {
        httpMethod: event.httpMethod,
        path: event.path,
        queryStringParameters: event.queryStringParameters,
      },
    });
    
    // Return structured error response
    const errorResponse: APIGatewayProxyResult = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: 'LAMBDA_ERROR',
          message: isProduction 
            ? 'An internal error occurred' 
            : error instanceof Error ? error.message : 'Unknown error',
          requestId,
        },
      }),
    };

    return errorResponse;
  }
};

// Export app for local development
export { app };
export default handler;