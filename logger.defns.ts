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

export { customLevels, CustomLevels, LoggerOptionsExtended, LogData };
