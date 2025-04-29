import { Logger } from "../Logger";
import { CustomLevels, LogData } from "../logger.defns";
import { LogMessageOptions, logMessageTest, LoggerMthds } from "./test.defns";
import { createLogger, transports } from "winston";
import fs from "fs";
import path from "path";
import mockFs from "mock-fs";
import { format } from "date-fns"; // For date formatting
import { Request, Response, NextFunction } from "express";

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
	   test("Should get current log level.", () => {
		  let level = logger.getLogLevel();
		  expect(level).toBe('info');
		  logger.setLogLevel('debug');
		  level = logger.getLogLevel();
		  expect(level).toBe('debug');
	   });
	   test("Should not set invalid log level.", () => {
          expect(() => {
			  logger.setLogLevel('invalid' as any); // Type assertion to bypass TypeScript check
		  }).toThrowError(new Error("Invalid log level: invalid. Log level not changed."));
	   });
   });
   describe("Middleware", () => {
	   test("Should log HTTP requests using middleware.", () => {
		   const req = {
			   method: 'GET',
			   url: '/api/test',
			   headers: { 'content-type': 'application/json' },
			   query: {},
			   body: {}
		   } as Request;

		   const res = {
			   statusCode: 200,
			   on: jest.fn((event, callback) => {
				   if(event === 'finish') {
					   callback(); // Simulate response finish
				   }
			   })
		   } as unknown as Response;

		   const next = jest.fn();

		   logSpy = jest.spyOn(logger, 'log');
		   const middleware = logger.middleware();
		   middleware(req, res, next);

		   expect(logSpy).toHaveBeenCalledWith('info', 'HTTP request', expect.objectContaining({
			   method: 'GET',
			   url: '/api/test',
			   status: 200,
			   headers: req.headers,
			   query: req.query,
			   body: req.body,
			   responseTime: expect.any(Number)
		   }));
		   expect(next).toHaveBeenCalled();
	   });
   });
   describe("Exception Logging", () => {
	   test("Should log exceptions to file correctly.", () => {
		   const error = new Error("Test error");
		   logSpy = jest.spyOn(logger['logger'], 'error');
		   logger.log('error', error.message); // Simulate logging an error
		   expect(logSpy).toHaveBeenCalledWith(error.message, { meta: undefined });
	   });
   });
   describe("File Logging", () => {
	   const currentDate = format(new Date(), 'yyyy-MM-dd');
	   const logFilePath = path.join('logs', `${currentDate}-combined.log`);
	   const errorLogFilePath = path.join('logs', `${currentDate}-error.log`);
	   // const logFilePath = path.join(__dirname, 'logs', '2023-10-01-combined.log'); // Adjust the date as needed for your test
	   // const errorLogFilePath = path.join(__dirname, 'logs', '2023-10-01-error.log'); // Adjust the date as needed for your test
	   /*
	   beforeEach(() => {
		   // Clear the log files before each test
		   if (fs.existsSync(logFilePath)) {
			  fs.unlinkSync(logFilePath);
		   }
		   if (fs.existsSync(errorLogFilePath)) {
			  fs.unlinkSync(errorLogFilePath);
		   }
	   });

	   afterEach(() => {
		   // Clean up log files after tests
		   if (fs.existsSync(logFilePath)) {
			   fs.unlinkSync(logFilePath);
		   }
		   if (fs.existsSync(errorLogFilePath)) {
			   fs.unlinkSync(errorLogFilePath);
		   }
	   });
	   */
	   beforeEach(() => {
		   // Mock the file system
		   mockFs({
			   logs: {} // Create a mock directory for logs
		   });
	   });
	   afterEach(() => {
		   // Restore the original file system
		   mockFs.restore();
	   });
	   test("Should log to file correctly.", async () => {
		   const logMessage = "This is a test log message.";
		   const errorMessage = "This is a test error message.";

		   // Log a message and an error
		   logger.log('info', logMessage);
		   logger.log('error', errorMessage);

		   // Wait for a short time to ensure logs are written
		   await new Promise(resolve => setTimeout(resolve, 100)); 

		   // Check if the combined log file exists and contains the log message
		   const existsLogFilePath = fs.existsSync(logFilePath);
		   expect(existsLogFilePath).toBe(true);
		   const logFileContent = fs.readFileSync(logFilePath, 'utf-8');
		   expect(logFileContent).toContain(logMessage);

		   // Check if the error log file exists and contains the error message
		   const existsErrorLogFilePath = fs.existsSync(errorLogFilePath);
		   expect(existsErrorLogFilePath).toBe(true);
		   const errorLogFileContent = fs.readFileSync(errorLogFilePath, 'utf-8');
		   expect(errorLogFileContent).toContain(errorMessage);
	   });
   });
   describe("Multiple Log Calls", () => {
	   test("Should handle multiple log calls.", () => {
		   const logSpy = jest.spyOn(logger['logger'], 'info');
           for (let i = 0; i < 10; i++) {
               logger.log('info', `Log message ${i}`);
			   expect(logSpy).toHaveBeenCalledWith(`Log message ${i}`, { meta: undefined });     // expect.stringContaining(…)
           }

           expect(logSpy).toHaveBeenCalledTimes(10);
	   });
   });
});
