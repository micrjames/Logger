import winston, { Logger as WinstonLogger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response, NextFunction } from "express";
import { customLevels, CustomLevels, LoggerOptionsExtended, LogData } from "./logger.defns";

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
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`; // Custom format
                })
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
    public setLogLevel(level: string) {
		this.logger.level = level;
    }

    public log(level: keyof CustomLevels['levels'], message: string, meta?: LogData) {
		this.logger[level](message, { meta });
    }

    public middleware() {
        return (req: Request, _: Response, next: NextFunction) => {
			const logData: LogData = {
                method: req.method,
                url: req.url,
                // You can add any other relevant data here
                // For example, headers, query parameters, etc.
                headers: req.headers,
                query: req.query,
                body: req.body,
			};
			this.log('info', 'HTTP request', logData);
            next();
		};
    }
}
