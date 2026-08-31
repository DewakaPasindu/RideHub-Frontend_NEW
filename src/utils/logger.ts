// Frontend logging utility to match backend logging structure

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    statusCode?: number;
  };
  user?: {
    id: string;
    email: string;
    role: string;
  };
  action?: string;
  url?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    if (context) {
      entry.context = context;
    }

    if (error) {
      entry.error = {
        message: error.message,
        stack: error.stack,
        statusCode: (error as any).statusCode
      };
    }

    // Add user context if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        entry.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return entry;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Send to console for development
    if (process.env.NODE_ENV === 'development') {
      console[entry.level](entry.message, entry);
    }

    // TODO: Send to backend logging service in production
    if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
      this.sendToBackend(entry);
    }
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      // TODO: Implement actual backend logging endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.warn('Failed to send log to backend:', error);
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', message, context);
    this.addLog(entry);
  }

  warn(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('warn', message, context);
    this.addLog(entry);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry = this.createLogEntry('error', message, context, error);
    this.addLog(entry);
  }

  debug(message: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('debug', message, context);
    this.addLog(entry);
  }

  // Log user actions for audit trail
  logUserAction(action: string, context?: Record<string, any>) {
    const entry = this.createLogEntry('info', `User action: ${action}`, context);
    entry.action = action;
    this.addLog(entry);
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions
export const logInfo = (message: string, context?: Record<string, any>) => 
  logger.info(message, context);

export const logWarn = (message: string, context?: Record<string, any>) => 
  logger.warn(message, context);

export const logError = (message: string, error?: Error, context?: Record<string, any>) => 
  logger.error(message, error, context);

export const logDebug = (message: string, context?: Record<string, any>) => 
  logger.debug(message, context);

export const logUserAction = (action: string, context?: Record<string, any>) => 
  logger.logUserAction(action, context);