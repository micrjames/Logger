import { CustomLevels, LogData } from "../logger.defns";
import { Logger } from "../Logger";

interface LoggerMthds {
	info(message: string, meta?: any): void;
	error(message: string, meta?: any): void;
	debug(message: string, meta?: any): void;
	warn(message: string, meta?: any): void;
	verbose(message: string, meta?: any): void;
	silly(message: string, meta?: any): void;
}

interface LogMessageOptions {
	level: keyof CustomLevels['levels'];
	message: string;
	meta?: LogData;
}
const logMessageTest = (logSpy: jest.SpyInstance, logger: Logger, options: LogMessageOptions) => {
  const { level, message, meta } = options;
  logger.log(level, message, meta);
  expect(logSpy).toHaveBeenCalledWith(message, { meta });
};
export { LoggerMthds, LogMessageOptions, logMessageTest };
