// Simple logger utility for frontend
class Logger {
  constructor() {
    this.levels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.currentLevel = process.env.NODE_ENV === 'production' ? this.levels.info : this.levels.debug;
  }

  debug(message, ...args) {
    if (this.currentLevel <= this.levels.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.currentLevel <= this.levels.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.currentLevel <= this.levels.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.currentLevel <= this.levels.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

const logger = new Logger();
export default logger;
