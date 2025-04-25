import { Logger } from "../Logger";
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
	  test.todo("Should log 'info' messages.");
	  test.todo("Should log 'error' messages.");
	  test.todo("Should log 'debug' messages.");
	  test.todo("Should log 'warn' messages.");
	  test.todo("Should log 'verbose' messages.");
	  test.todo("Should log 'silly' messages.");
	  test.todo("Should log with metadata.");
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
