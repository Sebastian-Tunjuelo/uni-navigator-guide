import pino from 'pino';
import { config } from './env';

const isProd = config.isProduction;

export const logger = pino(
  {
    level: config.logLevel,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    ...(isProd
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              ignore: 'pid,hostname',
              singleLine: false,
              translateTime: 'SYS:standard',
            },
          },
        }),
  },
  isProd ? undefined : process.stdout
);

export default logger;
