import fs from "fs";
import chalk from "chalk";

const loggerToFile = (data: any, filename: string) => {
  fs.writeFileSync(`./src/logs/${filename}`, JSON.stringify(data, null, 2), {
    flag: "a",
  });
};
const loggerToFileNormal = (data: any, filename: string) => {
  fs.writeFileSync(`./src/logs/${filename}`, data, {
    flag: "a",
  });
};

export const Logger = () => {
  const info = (data: any) => {
    console.log(chalk.cyan(data));
  };
  const error = (data: any) => {
    console.log(chalk.red(data));
  };
  const success = (data: any) => {
    console.log(chalk.green(data));
  };
  const warn = (data: any) => {
    console.log(chalk.yellow(data));
  };
  const bold = (data: any) => {
    console.log(chalk.bold(data));
  };
  const table = (data: any) => {
    console.table(data);
  };
  return { info, error, success, warn, table, bold };
};

const logger = Logger();

export { logger, loggerToFile, loggerToFileNormal };
