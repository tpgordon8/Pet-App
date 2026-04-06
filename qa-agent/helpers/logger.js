import chalk from 'chalk';

/**
 * Color-coded logger for QA agent
 */
class Logger {
  constructor() {
    this.startTime = Date.now();
  }

  _getTimestamp() {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    return chalk.gray(`[${elapsed}s]`);
  }

  info(message) {
    console.log(`${this._getTimestamp()} ${chalk.blue('ℹ️')}  ${message}`);
  }

  success(message) {
    console.log(`${this._getTimestamp()} ${chalk.green('✅')} ${message}`);
  }

  error(message) {
    console.log(`${this._getTimestamp()} ${chalk.red('❌')} ${message}`);
  }

  warning(message) {
    console.log(`${this._getTimestamp()} ${chalk.yellow('⚠️')}  ${message}`);
  }

  bug(severity, message) {
    const icon = severity === 'critical' ? '🔴' : severity === 'major' ? '🟠' : '🟡';
    console.log(`${this._getTimestamp()} ${chalk.magenta(icon)} BUG: ${message}`);
  }

  step(stepNumber, action) {
    console.log(`${this._getTimestamp()} ${chalk.cyan(`[Step ${stepNumber}]`)} ${action}`);
  }

  section(title) {
    console.log('\n' + chalk.bold.white('═'.repeat(60)));
    console.log(chalk.bold.white(` ${title}`));
    console.log(chalk.bold.white('═'.repeat(60)) + '\n');
  }

  subsection(title) {
    console.log('\n' + chalk.white('─'.repeat(60)));
    console.log(chalk.white(` ${title}`));
    console.log(chalk.white('─'.repeat(60)));
  }
}

export default new Logger();
