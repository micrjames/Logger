import winston, { Logger as WinstonLogger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction } from "express";
import { customLevels, CustomLevels, LoggerOptionsExtended, LogData, LogForm } from "./logger.defns";

export class Logger {
    private logger: WinstonLogger;
    private customLevels: CustomLevels;

	private sensitiveFields: string[] = ['password', 'creditCard', 'ssn']; // Sensitive fields to sanitize 

	constructor(logLevel: string = 'info') {
		this.customLevels = customLevels; 

        winston.addColors(this.customLevels.colors);
        this.logger = winston.createLogger(this.getLoggerOptions(logLevel));
	}
	private getLoggerOptions(logLevel: string): LoggerOptionsExtended {
		return {
			levels: this.customLevels.levels,
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
				/*
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`; // Custom format
                })
			    */
			    this.customFormat()
            ),
            transports: [
                new winston.transports.Console(),
                new DailyRotateFile({
                    filename: 'logs/%DATE%-combined.log',
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'info',
                }),
                new DailyRotateFile({
                    filename: 'logs/%DATE%-error.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                }),
            ],
            exceptionHandlers: [
                new winston.transports.File({ filename: 'logs/exceptions.log' }),
            ],
		};
	}
    public setLogLevel(level: keyof CustomLevels['levels']) {
		if(this.customLevels.levels[level] !== undefined) {
		// if(level in this.customLevels.levels) {
			this.logger.level = level as string;
		} else {
			throw new Error(`Invalid log level: ${level}. Log level not changed.`);
		}
    }
	public getLogLevel(): keyof CustomLevels['levels'] { // string {
		return this.logger['level'] as keyof CustomLevels['levels'];
	}

	private sanitizeLogData(logData: any): any {
		if (typeof logData !== 'object' || logData === null) {
			return logData; // Return if not an object
		}

		const sanitizedData = Array.isArray(logData) ? [] : {};
		for (const key in logData) {
			if (logData.hasOwnProperty(key)) {
				if (this.sensitiveFields.includes(key)) {
					continue; // Skip sensitive fields
				}
				sanitizedData[key] = this.sanitizeLogData(logData[key]); // Recursively sanitize
			}
		}
		return sanitizedData;
	}
	private customFormat(): winston.Logform.Format {
		return winston.format.printf(({ timestamp, level, message, ...metadata }: { 
			timestamp: string; 
			level: string; 
			message: string; 
			[key: string]: any; // Allow any additional metadata
		}) => {
			const sanitizedMetadata = this.sanitizeLogData(metadata); // Sanitize metadata
			const log: LogForm = {
                timestamp: timestamp || new Date().toISOString(),
                level,
                message,
                service: sanitizedMetadata.service ||  'your-service-name', // Replace with your service name
                requestId: sanitizedMetadata.requestId || 'N/A',
                userId: sanitizedMetadata.userId || 'N/A',
                ipAddress: sanitizedMetadata.ipAddress || 'N/A',
                responseTime: sanitizedMetadata.responseTime || 'N/A',
                metadata: Object.keys(sanitizedMetadata).length ? sanitizedMetadata : undefined,
            };
            return JSON.stringify(log);
		});
	}
	public setCustomFormat(format: Partial<LogForm>) {
		// Validate the format input
		if (format === null || typeof format !== 'object') {
			throw new Error('Invalid custom format: format must be an object.');
		}
		// Update the logger's format based on the provided format object
		this.logger.format = winston.format.combine(
			winston.format.timestamp(),
			winston.format.colorize(),
			winston.format.printf(({ timestamp, level, message, ...metadata }: { 
				timestamp: string; 
				level: string; 
				message: string; 
				[key: string]: any; // Allow any additional metadata
			}) => {
				const log: LogForm = {
					timestamp: timestamp || new Date().toISOString(),
					level,
					message,
					service: format.service || metadata.service ||  'your-service-name', // Replace with your service name
					requestId: format.service || metadata.requestId || 'N/A',
					userId: format.userId || metadata.userId || 'N/A',
					ipAddress: format.ipAddress || metadata.ipAddress || 'N/A',
					responseTime: format.responseTime || metadata.responseTime || 'N/A',
					metadata: Object.keys(metadata).length ? metadata : undefined,
				};
				return JSON.stringify(log);
			})
		);
	}

    public log(level: keyof CustomLevels['levels'], message: string, meta?: LogData) {
		// this.logger[level](message, { meta });
		if(this.customLevels.levels[level] <= this.customLevels.levels[this.logger.level]) {
			try {
				this.logger[level](message, { meta });
			} catch(error) {
				console.error('Logging failed:', error);
			}
		}
    }
	public logWithContext(level: keyof CustomLevels['levels'], message: string, context: { [key: string]: any }, meta?: LogData) {
		if (this.customLevels.levels[level] <= this.customLevels.levels[this.logger.level]) {
			const logData = { ...meta, context };
			this.logger[level](message, logData);
		}
	}
	public async logAsync(level: keyof CustomLevels['levels'], message: string, meta?: LogData): Promise<void> {
		return new Promise((resolve, reject) => {
			if(this.customLevels.levels[level] <= this.customLevels.levels[this.logger.level]) {
				try {
					this.logger[level](message, { meta });
					resolve();
				} catch(error) {
					console.error('Logging failed:', error);
					reject(error);
				}
			} else {
				resolve(); // If the log level is not allowed, resolve without logging
			}
		});
	}

    public middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
			const start = Date.now();
			res.on('finish', () => {
				const logData: LogData = {
					method: req.method,
					url: req.url,
					status: res.statusCode,
					responseTime: Date.now() - start,
					// You can add any other relevant data here
					// For example, headers, query parameters, etc.
					headers: req.headers,
					query: req.query,
					body: req.body,
				};
				this.log('info', 'HTTP request', logData);
			});
            next();
		};
    }
    public requestLogger() {
        return (req: Request, res: Response, next: NextFunction) => {
			const start = Date.now();
			res.on('finish', () => {
				const logData: LogData = {
					method: req.method,
					url: req.url,
					headers: req.headers,
					query: req.query,
					body: req.body,
					status: res.statusCode,
					responseTime: Date.now() - start
				};

				// Sanitize log data before logging
				const sanitizedLogData = this.sanitizeLogData(logData);

				// Log at different levels based on response status
				const logLevel = res.statusCode >= 400 ? 'error' : 'info';
				this.log(logLevel, 'HTTP request', sanitizedLogData);
			});
            next();
        };
    }
}
