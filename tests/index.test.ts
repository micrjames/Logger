import { Logger } from "../Logger";
import { CustomLevels, LogData } from "../logger.defns";
import { LogMessageOptions, logMessageTest, LoggerMthds } from "./test.defns";
import { createLogger, transports } from "winston";
import fs from "fs";
import path from "path";
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
	   test.todo("Should log to file correctly.");
   });
   describe("Multiple Log Calls", () => {
	   test.todo("Should handle multiple log calls.");
   });
});
