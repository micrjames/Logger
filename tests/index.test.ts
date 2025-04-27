import { Logger } from "../Logger";
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
	  test("Should log 'info' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'info');
		  logger.log('info', 'This is an info message');
		  expect(logSpy).toHaveBeenCalledWith('This is an info message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log 'error' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'error');
		  logger.log('error', 'This is an error message');
		  expect(logSpy).toHaveBeenCalledWith('This is an error message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log 'debug' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'debug');
		  logger.log('debug', 'This is an debug message');
		  expect(logSpy).toHaveBeenCalledWith('This is an debug message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log 'warn' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'warn');
		  logger.log('warn', 'This is a warn message');
		  expect(logSpy).toHaveBeenCalledWith('This is a warn message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log 'verbose' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'verbose');
		  logger.log('verbose', 'This is a verbose message');
		  expect(logSpy).toHaveBeenCalledWith('This is a verbose message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log 'silly' messages.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'silly');
		  logger.log('silly', 'This is a silly message');
		  expect(logSpy).toHaveBeenCalledWith('This is a silly message', { meta: undefined });
		  logSpy.mockRestore();
	  });
	  test("Should log with metadata.", () => {
		  logSpy = jest.spyOn(logger['logger'], 'info');
		  logger.log('info', 'This is an info message', {userId: 123});
		  expect(logSpy).toHaveBeenCalledWith('This is an info message', { meta: {userId: 123} });
		  logSpy.mockRestore();
	  });
   });
   describe("Log Level Management", () => {
	   test.todo("Should set log level dynamically.");
	   test.todo("Should not set invalid log level.");
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
