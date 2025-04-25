# Logger
A customizable logging utility for Node.js applications that integrates with Winston to provide dynamic log levels, contextual logging, log rotation, and middleware support for Express, ensuring organized and efficient logging of application events and HTTP requests.

# Logger Utility

## Table Of Contents
- [General Info](#general-info)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Project Status](#project-status)
- [Room for Improvement](#room-for-improvement)
- [Contact](#contact)

## General Info
The Logger Utility is a customizable logging solution for Node.js applications that integrates with Winston to provide dynamic log levels, contextual logging, log rotation, and middleware support for Express. It ensures organized and efficient logging of application events and HTTP requests.

## Technologies Used
- **Node.js**: JavaScript runtime for building server-side applications.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Winston**: A versatile logging library for Node.js.
- **winston-daily-rotate-file**: A transport for Winston that rotates log files daily.
- **Express**: A web application framework for Node.js.

## Features
- Custom log levels (error, warn, info, debug, verbose, silly).
- Dynamic log level configuration.
- Contextual logging with additional metadata.
- Log rotation to manage log file sizes.
- Middleware support for logging HTTP requests in Express applications.
- Exception handling with dedicated log files for errors.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/logger-utility.git
   cd logger-utility
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Ensure you have Node.js and TypeScript installed. If not, you can install them using:
   ```bash
   npm install -g typescript
   ```

## Usage
1. Import and instantiate the Logger class in your application:
   ```typescript
   import express from 'express';
   import Logger from './path/to/Logger';

   const app = express();
   const logger = new Logger();

   // Use the logger middleware
   app.use(logger.middleware());

   // Example log messages
   logger.log('info', 'This is an info message');
   logger.log('error', 'This is an error message');

   // Start the Express server
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
       logger.log('info', `Server is running on port ${PORT}`);
   });
   ```

2. Customize the log level as needed:
   ```typescript
   logger.setLogLevel('debug'); // Set log level to debug
   ```

## Project Status
The project is currently in development and is actively maintained. Contributions are welcome!

## Room for Improvement
- Add more transport options for logging (e.g., logging to a database or external service).
- Implement more advanced filtering options for log messages.
- Enhance the middleware to include more contextual information (e.g., response time, status codes).
- Create a configuration file for easier setup and customization.

## Contact
For any inquiries or contributions, please contact:
- **Michael James**: [micrjamesjr@gmail.com](mailto:micrjamesjr@gmail.com)
- **GitHub**: [micrjams](https://github.com/micrjams)
