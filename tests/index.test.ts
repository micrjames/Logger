import { Logger } from "../Logger";
import { logMessageTest } from "./test.defns";
import { createLogger, transports } from "winston";
import fs from "fs";
import path from "path";

describe("A Logger", () => {
   let logger: Logger;
   beforeEach(() => {
	   logger = new Logger('info'); // Initialize logger with default log level
   });
   afterEach(() => {
	   jest.clearAllMocks();
   });
   describe("Logging Messages", () => {
	  test("Should log 'info' messages.", () => {
		  logMessageTest(logger, { level: 'info', message: 'This is an info message' });
	  });
	  test("Should log 'error' messages.", () => {
		  logMessageTest(logger, { level: 'error', message: 'This is an error message' });
	  });
	  test("Should log 'debug' messages.", () => {
		  logMessageTest(logger, { level: 'debug', message: 'This is an debug message' });
	  });
	  test("Should log 'warn' messages.", () => {
		  logMessageTest(logger, { level: 'warn', message: 'This is a warn message' });
	  });
	  test("Should log 'verbose' messages.", () => {
		  logMessageTest(logger, { level: 'verbose', message: 'This is a verbose message' });
	  });
	  test("Should log 'silly' messages.", () => {
		  logMessageTest(logger, { level: 'silly', message: 'This is a silly message' });
	  });
	  test("Should log with metadata.", () => {
		  logMessageTest(logger, { level: 'info', message: 'This is an info message', meta: {userId: 123} });
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
