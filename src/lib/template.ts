import { PostmanEnvironmentVariablesType } from '$/types';
import { SSMClientConfig } from '@aws-sdk/client-ssm';
import { processSsmInstruction } from './process-ssm-instruction';

export const template = async (params: {
  variables: PostmanEnvironmentVariablesType;
  awsConfig: SSMClientConfig;
}): Promise<PostmanEnvironmentVariablesType> => {
  const { variables, awsConfig } = params;

  const templated: PostmanEnvironmentVariablesType = JSON.parse(
    JSON.stringify(variables),
  );

  for (const item of templated.values) {
    if (item.key.indexOf('4TEMPLATER:') === 0) {
      const keyParts = item.key.split(':');

      if (keyParts.length !== 2) {
        throw new Error(
          'key not in expected format 4TEMPLATER:newKeyName (' + item.key + ')',
        );
      }

      // replace the key with the name minus the 4TEMPLATER:
      item.key = keyParts[1];

      const valueParts = item.value.split(':');

      switch (valueParts[0]) {
        case 'ssm': {
          item.value = await processSsmInstruction({
            envVarValue: item.value,
            ssmConfig: awsConfig,
          });
          item.enabled = true;
          break;
        }
        default:
          throw new Error('instruction unknown (' + item.value + ')');
      }
    }
  }

  return templated;
};
