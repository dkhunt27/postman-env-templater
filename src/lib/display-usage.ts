export const displayUsage = () => {
  console.log('');
  console.log('postman-env-templater');
  console.log('');
  console.log(
    'Utility script for setting up postman environment files.  (i.e. update secrets from ssm)',
  );
  console.log('');
  console.log('Usage:');
  console.log('    postman-env-templater OPTION[S]');
  console.log('');
  console.log('OPTIONS:');
  console.log('        --help               displays help');
  console.log(
    '    -t  --template-file      environment template file to process',
  );
  console.log(
    '    -o  --output-dir         OPTIONAL: where to save processed environment file; defaults to current directory',
  );
  console.log(
    '    -w  --working-dir        OPTIONAL: where to set the working directory; defaults to current directory',
  );
  console.log('    -r  --region             OPTIONAL: aws region to use');
  console.log('');
  console.log('Examples:');
  console.log(
    '    yarn postman-env-templater --template-file=./postman/env-templates/dev.json                  processes the dev environment file',
  );
  console.log('');
};
