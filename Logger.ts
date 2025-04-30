import winston, { Logger as WinstonLogger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction } from "express";
import { customLevels, CustomLevels, LoggerOptionsExtended, LogData, LogForm } from "./logger.defns";

export class Logger {
    private logger: WinstonLogger;
    private customLevels: CustomLevels;

	constructor(logLevel: string = 'info') {
		this.customLevels = customLevels; 

        this.logger = winston.createLogger(this.getLoggerOptions(logLevel));
        winston.addColors(this.customLevels.colors);
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

	private customFormat(): winston.Logform.Format {
		return winston.format.printf(({ timestamp, level, message, ...metadata }: { 
			timestamp: string; 
			level: string; 
			message: string; 
			[key: string]: any; // Allow any additional metadata
		}) => {
			const log: LogForm = {
                timestamp: timestamp || new Date().toISOString(),
                level,
                message,
                service: metadata.service ||  'your-service-name', // Replace with your service name
                requestId: metadata.requestId || 'N/A',
                userId: metadata.userId || 'N/A',
                ipAddress: metadata.ipAddress || 'N/A',
                responseTime: metadata.responseTime || 'N/A',
                metadata: Object.keys(metadata).length ? metadata : undefined,
            };
            return JSON.stringify(log);
		});
	}
	public setCustomFormat(format: Partial<LogForm>) {
		// Update the logger's format based on the provided format object
		this.logger.format = winston.format.combine(
			winston.format.timestamp(),
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
		this.logger[level](message, { meta });
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
}
