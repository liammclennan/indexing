import * as winston from 'winston';
import { SeqTransport } from '@datalust/winston-seq';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new SeqTransport({
      serverUrl: "http://localhost",
      onError: (e => { console.error(e) }),
      handleExceptions: true,
      handleRejections: true,
    })
  ]
});

export default logger;