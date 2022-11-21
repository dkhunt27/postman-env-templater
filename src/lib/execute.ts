import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { displayUsage } from './display-usage';
import { setupAwsConfig } from './setup-aws-config';
import { template } from './template';

export const execute = async (args: any) => {
  if (Object.keys(args).length <= 1 || args.help) {
    displayUsage();
  } else {
    console.log(' ');
    console.log(' postman-env-templater executing...');
    const workingDir = args.w || args['working-dir'] || __dirname;
    const templateToProcess = args.t || args['template-file'];
    const outputDir = args.o || args['output-dir'];
    const region = args.r || args.region;

    const templateFullPath = path.join(workingDir, templateToProcess);
    const outputDirFullPath = path.join(workingDir, outputDir);

    if (!existsSync(templateFullPath)) {
      console.error(`ERROR: No such file or directory '${templateFullPath}'`);
      throw new Error(`No such file or directory '${templateFullPath}'`);
    } else {
      if (!existsSync(outputDirFullPath)) {
        console.log(` ... output dir does not exist; creating ${outputDir}`);
        mkdirSync(outputDirFullPath);
      }

      console.log(` ... templating ${templateFullPath}`);

      const awsConfig = setupAwsConfig({ region });
      const templateContents = readFileSync(templateFullPath).toString();
      const variables = JSON.parse(templateContents);

      const result = await template({ variables, awsConfig });

      const outputFilePath = path.join(
        outputDirFullPath,
        result.name + '.postman_environment.json',
      );
      writeFileSync(outputFilePath, JSON.stringify(result, null, 2));
      console.log(` ... ${outputFilePath} has been templated`);
    }
  }
};
