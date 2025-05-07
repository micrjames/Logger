import { CustomLevels, LogData, LogForm } from "../logger.defns";
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
type LogTestCase = LogMessageOptions & {
    shouldLog: boolean;
};
type LogWithContextOptions = LogMessageOptions & {
    context: { [key: string]: any }; // This allows for any additional context properties
};
type LogWithContextTestCase = LogWithContextOptions & {
    expectedCalled: boolean;
    setLogLevel?: keyof CustomLevels['levels']; // Optional log level to set
}
type AsyncLogTestCase = [LogMessageOptions, keyof CustomLevels['levels']];
const logMessageTest = (logSpy: jest.SpyInstance, logger: Logger, options: LogMessageOptions) => {
  const { level, message, meta } = options;
  logger.log(level, message, meta);
  expect(logSpy).toHaveBeenCalledWith(message, { meta });
};
 const asyncLogMessageTest = async (logSpy: jest.SpyInstance, logger: Logger, options: LogMessageOptions) => {
  const { level, message, meta } = options;
  await logger.logAsync(level, message, meta);
  expect(logSpy).toHaveBeenCalledWith(message, { meta });
};
const logWithContextTest = (logSpy: jest.SpyInstance, logger: Logger, options: LogWithContextTestCase) => {
    const { level, message, context, meta, expectedCalled, setLogLevel } = options;
    if(setLogLevel) logger.setLogLevel(setLogLevel); // Set log level if specified
    logger.logWithContext(level, message, context, meta);
    if(expectedCalled) expect(logSpy).toHaveBeenCalledWith(message, { ...meta, context });
	else expect(logSpy).not.toHaveBeenCalled();

};
type TestCustomFormat = Pick<LogForm, 'service' | 'userId' | 'requestId' | 'ipAddress' | 'responseTime'>;
const testCustomFormat: TestCustomFormat = {
	service: 'test-service',
	userId: 'test-user',
	requestId: 'test-request-id',
	ipAddress: '192.168.1.1',
	responseTime: '100ms'
};
const expectedLogEntry: LogForm = {
	timestamp: expect.any(String),
	level: 'info',
	message: 'Test log message',
	service: 'test-service',
	requestId: 'test-request-id',
	userId: 'test-user',
	ipAddress: '192.168.1.1',
	responseTime: '100ms',
	metadata: {},
};
export { LoggerMthds, LogMessageOptions, logMessageTest, asyncLogMessageTest, testCustomFormat, expectedLogEntry, LogTestCase, AsyncLogTestCase, LogWithContextOptions, logWithContextTest, LogWithContextTestCase };
