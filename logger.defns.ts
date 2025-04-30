import { LoggerOptions } from "winston";

interface CustomLevels {
    levels: { [key: string]: number };
    colors: { [key: string]: string };
}

interface LoggerOptionsExtended extends LoggerOptions {
    level?: string;
}

interface LogData {
    [key: string]: any; // Allow any key-value pairs
}

const customLevels: CustomLevels = {
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		debug: 3,
		verbose: 4,
		silly: 5,
	},
	colors: {
		error: 'red',
		warn: 'yellow',
		info: 'green',
		debug: 'blue',
		verbose: 'magenta',
		silly: 'cyan',
	}
};

interface LogForm {
	timestamp: string;        // The date and time of the log entry
	level: string;           // The severity level of the log (e.g., info, error)
	message: string;         // The log message
	service: string;         // The name of the service or module
	requestId: string;       // Unique identifier for the request
	userId: string;          // Identifier for the user (if applicable)
	ipAddress: string;       // IP address of the client
	responseTime: string;    // Time taken to process the request
	metadata?: {             // Additional metadata (optional)
		[key: string]: any;  // Allow any key-value pairs
	};
}

export { customLevels, CustomLevels, LoggerOptionsExtended, LogData, LogForm };
