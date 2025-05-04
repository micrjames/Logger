import { Logger } from "../Logger";
import { CustomLevels } from "../logger.defns";
import { LogMessageOptions, logMessageTest, LoggerMthds, testCustomFormat, LogTestCase } from "./test.defns";
import fs from "fs";
import path from "path";
import mockFs from "mock-fs";
import { format } from "date-fns"; // For date formatting
import { Request, Response } from "express";

describe("A Logger", () => {
   let logger: Logger;
   let logSpy: jest.SpyInstance;

   beforeEach(() => {
	   logger = new Logger('silly'); // Initialize logger with default log level
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
		  expect(level).toBe('silly');
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
   describe("Log Level Restrictions", () => {
	   beforeEach(() => {
		   logger.setLogLevel('warn'); // Set log level to 'warn'
	   });
	   afterEach(() => {
		   logSpy.mockRestore(); // Restore the spy
	   });
	   /*
	   test("Should not log messages above the current log level.", () => {
		   logSpy = jest.spyOn(logger['logger'], 'info'); // Spy on the 'info' method
		   logger.log('info', 'This is an info message'); // Attempt to log an info message
		   expect(logSpy).not.toHaveBeenCalled(); // Expect it not to be called
	   });
	   test("Should not log messages at the current log level.", () => {
		   logSpy = jest.spyOn(logger['logger'], 'warn'); // Spy on the 'warn' method
		   logger.log('warn', 'This is a warn message'); // Attempt to log a warn message
		   expect(logSpy).toHaveBeenCalledWith('This is a warn message', { meta: undefined }); // Expect it to be called
	   });
	   test("Should not log messages below the current log level.", () => {
		   logSpy = jest.spyOn(logger['logger'], 'error'); // Spy on the 'error' method
		   logger.log('error', 'This is an error message'); // Attempt to log an error message
		   expect(logSpy).toHaveBeenCalledWith('This is an error message', { meta: undefined }); // Expect it to be called
	   });
	   */
	   test.each([
		   [{ level: 'info', message: 'This is an info message', shouldLog: false }, 'not', 'info'],
		   [{ level: 'warn', message: 'This is an warn message', shouldLog: true }, '', 'warn'],
		   [{ level: 'error', message: 'This is an error message', shouldLog: true }, '', 'error'],
	  ] as [LogTestCase, string, keyof CustomLevels['levels']][])('Log Entry: %s should %s log messages at %s.', ({ level, message, shouldLog }) => {
		   logSpy = jest.spyOn(logger['logger'], level as keyof LoggerMthds);
		   logger.log(level, message); // Attempt to log a warn message
		   if(shouldLog) {
			  expect(logSpy).toHaveBeenCalledWith(message, { meta: undefined }); // Expect it to be called
		   } else {
			  expect(logSpy).not.toHaveBeenCalled(); // Expect it not to be called
		   }
	   });
   });
   describe("Async Logging", () => {
	   test("Should log messages asynchronously at valid log levels.", async () => {
		   const logMessage = "This is an async info message.";
		   logSpy = jest.spyOn(logger['logger'], 'info');

		   await logger.logAsync('info', logMessage);
		   expect(logSpy).toHaveBeenCalledWith(logMessage, { meta: undefined });
	   });
	   test("Should not log messages asynchronously above the current log level.", async () => {
		   logger.setLogLevel('warn');
		   const logMessage = "This is an async info message.";
		   logSpy = jest.spyOn(logger['logger'], 'info');

		   await logger.logAsync('info', logMessage);
		   expect(logSpy).not.toHaveBeenCalled();
	   });
	   test("Should log messages asynchronously at the current log level.", async () => {
		   logger.setLogLevel('warn');
		   const logMessage = "This is an async warn message.";
		   logSpy = jest.spyOn(logger['logger'], 'warn');

		   await logger.logAsync('warn', logMessage);
		   expect(logSpy).toHaveBeenCalledWith(logMessage, { meta: undefined });
	   });
	   test("Should log messages asynchronously below the current log levels.", async () => {
		   logger.setLogLevel('warn');
		   const logMessage = "This is an async error message.";
		   logSpy = jest.spyOn(logger['logger'], 'error');

		   await logger.logAsync('error', logMessage);
		   expect(logSpy).toHaveBeenCalledWith(logMessage, { meta: undefined });
	   });
	   test("Should reject on logging failure.", async () => {
		   const logMessage = "This is an async error message.";
		   logSpy = jest.spyOn(logger['logger'], 'error').mockImplementation(() => {
			   throw new Error("Logging error");
		   });
		   await expect(logger.logAsync('error', logMessage)).rejects.toThrow("Logging error");
	   });
	   test("Should resolve without logging if log level is not allowed.", async () => {
		   logger.setLogLevel('warn');	// Set log level to 'warn'
		   const logMessage = "This is an async info message.";
		   logSpy = jest.spyOn(logger['logger'], 'info');

		   await logger.logAsync('info', logMessage);

		   expect(logSpy).not.toHaveBeenCalled();	// Ensure it was not called
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
	describe("Custom Format Management", () => {
		beforeEach(() => {
			// Use a spy to capture the log output
			logSpy = jest.spyOn(logger['logger'], 'info');
		});
		afterEach(() => {
			jest.clearAllMocks();
		});
		test("Should set custom format.", () => {
			// Set the custom format
			logger.setCustomFormat(testCustomFormat);
			
			// Log a message with the custom format
			logger.log('info', 'Test log message', testCustomFormat);

			// Log the message again to trigger the spy
			logger.log('info', 'Test log message', testCustomFormat);

			// Check if the spy was called
			expect(logSpy).toHaveBeenCalled();

			// Get the arguments passed to the spy
			const logArgs = logSpy.mock.calls[0];

			// The first argument should be the log message
			const logMessage = logArgs[0]; // This should be a string
			const meta = logArgs[1]; // The metadata

			// Verify that the log message is correct
			expect(logMessage).toBe('Test log message');

			// Verify that the metadata matches the expected structure
			expect(meta).toMatchObject({
				meta: {
					service: 'test-service',
					userId: 'test-user',
					requestId: 'test-request-id',
					ipAddress: '192.168.1.1',
					responseTime: '100ms',
				}
			});

		});
		test("Should set empty custom format.", () => {
			// Additional tests for edge cases
			logger.setCustomFormat({}); // Test with an empty format
			logger.log('info', 'Test log message with empty format', {});
			expect(logSpy).toHaveBeenCalled(); // Ensure it still logs

		});
		test("Should set with a different format.", () => {
			// Test with a different format
			const anotherFormat = { service: 'another-service' };
			logger.setCustomFormat(anotherFormat);
			logger.log('info', 'Test log message with another format', anotherFormat);
			const anotherLogArgs = logSpy.mock.calls[logSpy.mock.calls.length - 1];
			expect(anotherLogArgs[1]).toMatchObject({
				meta: {
					service: 'another-service',
				}
			});
		});
	});
});
