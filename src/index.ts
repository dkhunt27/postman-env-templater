import fg from 'fast-glob';
import {
  appendEnvTemplateToEnvironment,
  backupThunderClientEnvironmentFile,
  parseConfig,
  processEnvTemplate,
} from './lib/template';
import path from 'path';
import { ProcessedVariablesType } from './types/index.js';
import { writeFileSync } from 'fs';

const execute = async (): Promise<void> => {
  // parse config
  const config = parseConfig();

  // list of env templates
  const envTemplateFiles = await fg(config.templateFiles);
  console.log('... templates to process', envTemplateFiles);

  let tcEnvironment: ProcessedVariablesType[] = [];

  // loop through them and template
  for (const templateFile of envTemplateFiles) {
    const templated = await processEnvTemplate({
      templateFullPath: templateFile,
      awsRegion: config.awsRegion,
    });

    tcEnvironment = appendEnvTemplateToEnvironment({
      templated,
      thunderClientEnvironment: tcEnvironment,
    });
  }

  // overwrite environment file
  const outputPath = path.join(
    config.thunderClientEnvironmentFileDir,
    'thunderEnvironment.json',
  );
  backupThunderClientEnvironmentFile(outputPath);
  writeFileSync(outputPath, JSON.stringify(tcEnvironment, null, 2));
  console.log(` ... creating thunder client environment file: ${outputPath}`);
};

execute()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
