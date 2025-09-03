import { Request } from 'express';

export interface LogContext {
  transactionId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  userId?: string;
}

export class Logger {
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogContext(req: Request, transactionId?: string): LogContext {
    return {
      transactionId: transactionId || this.generateTransactionId(),
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString(),
      userId: req.headers['user-id'] as string, // if you have user authentication
    };
  }

  public info(message: string, context?: Partial<LogContext>, additionalData?: any): void {
    const logEntry = {
      level: 'INFO',
      message,
      context,
      data: additionalData,
      timestamp: new Date().toISOString(),
    };
    console.log(JSON.stringify(logEntry));
  }

  public error(message: string, error?: Error, context?: Partial<LogContext>, additionalData?: any): void {
    const logEntry = {
      level: 'ERROR',
      message,
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      },
      context,
      data: additionalData,
      timestamp: new Date().toISOString(),
    };
    console.error(JSON.stringify(logEntry));
  }

  public warn(message: string, context?: Partial<LogContext>, additionalData?: any): void {
    const logEntry = {
      level: 'WARN',
      message,
      context,
      data: additionalData,
      timestamp: new Date().toISOString(),
    };
    console.warn(JSON.stringify(logEntry));
  }

  public debug(message: string, context?: Partial<LogContext>, additionalData?: any): void {
    const logEntry = {
      level: 'DEBUG',
      message,
      context,
      data: additionalData,
      timestamp: new Date().toISOString(),
    };
    console.debug(JSON.stringify(logEntry));
  }

  public logRequest(req: Request, message: string, additionalData?: any): LogContext {
    const context = this.createLogContext(req);
    this.info(message, context, additionalData);
    return context;
  }

  public logResponse(context: LogContext, message: string, responseData?: any, duration?: number): void {
    this.info(message, context, { 
      ...responseData, 
      duration: duration ? `${duration}ms` : undefined 
    });
  }

  public logError(context: LogContext, message: string, error?: Error, additionalData?: any): void {
    this.error(message, error, context, additionalData);
  }
}

export const logger = new Logger();