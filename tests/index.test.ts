import { Logger } from "../Logger";
import { CustomLevels, LogData } from "../logger.defns";
import { LogMessageOptions, logMessageTest, LoggerMthds } from "./test.defns";
import { createLogger, transports } from "winston";
import fs from "fs";
import path from "path";

describe("A Logger", () => {
   let logger: Logger;
   let logSpy: jest.SpyInstance;
   beforeEach(() => {
	   logger = new Logger('info'); // Initialize logger with default log level
   });
   afterEach(() => {
	   jest.clearAllMocks();
   });
   describe("Logging Messages", () => {
	  test.each([
	    [{ level: 'info', message: 'This is an info message', meta: undefined }, 'info'],
        [{ level: 'error', message: 'This is an error message', meta: undefined }, 'error'],
        [{ level: 'debug', message: 'This is a debug message', meta: undefined }, 'debug'],
        [{ level: 'warn', message: 'This is a warn message', meta: undefined }, 'warn'],
        [{ level: 'verbose', message: 'This is a verbose message', meta: undefined}, 'verbose'],
        [{ level: 'silly', message: 'This is a silly message', meta: undefined }, 'silly'],
        [{ level: 'info', message: 'This is an info message', meta: { userId: 123 } }, 'info']
	  ] as [LogMessageOptions, string][])("Passing '%s' should log message: '%s'.", logOptions => {
		  logSpy = jest.spyOn(logger['logger'], logOptions.level as keyof LoggerMthds);
		  logMessageTest(logSpy, logger, logOptions);
		  logSpy.mockRestore();
	  });
   });
   describe("Log Level Management", () => {
	   test("Should set log level dynamically.", () => {
	      logger.setLogLevel('debug');
		  const level = logger['logger'].level;
          expect(level).toBe('debug'); // Access private property for testing
	   });
	   test("Should not set invalid log level.", () => {
          expect(() => {
			  logger.setLogLevel('invalid' as any); // Type assertion to bypass TypeScript check
		  }).toThrowError(new Error("Invalid log level: invalid. Log level not changed."));
	   });
   });
   describe("Middleware", () => {
	   test.todo("Should log HTTP requests using middleware.");
   });
   describe("Exception Logging", () => {
	   test.todo("Should log to file correctly.");
   });
   describe("Multiple Log Calls", () => {
	   test.todo("Should handle multiple log calls.");
   });
});
