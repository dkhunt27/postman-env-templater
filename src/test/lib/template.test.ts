import { template } from '../../lib/template';
import { processSsmInstruction } from '../../lib/process-ssm-instruction';
import { PostmanEnvironmentVariablesType } from '$/types';

jest.mock('../../lib/process-ssm-instruction');

describe('lib/template', () => {
  beforeEach(() => {
    expect.hasAssertions();
    global.console.log = jest.fn();
    global.console.error = jest.fn();
  });
  describe('template', () => {
    let variables: PostmanEnvironmentVariablesType;
    beforeEach(() => {
      variables = {
        name: 'test',
        values: [
          {
            key: 'baseUrl',
            value: 'https://some/url',
            type: 'default',
            enabled: true,
          },
          {
            key: '4TEMPLATER:someSsmKey',
            value: 'ssm:someSsmKey:true',
            type: 'secret',
            enabled: false,
          },
        ],
      };
    });
    test('when called, should template', async () => {
      (processSsmInstruction as jest.Mock).mockResolvedValue('someSsmValue');
      await expect(template({ variables, awsConfig: {} })).resolves.toEqual({
        name: 'test',
        values: [
          {
            key: 'baseUrl',
            value: 'https://some/url',
            type: 'default',
            enabled: true,
          },
          // {
          //   key: '4TEMPLATER:someSsmKey',
          //   value: 'ssm:someSsmKey:true',
          //   type: "secret",
          //   enabled: false,
          // },
          {
            key: 'someSsmKey',
            value: 'someSsmValue',
            type: 'secret',
            enabled: true,
          },
        ],
      });
    });
  });
});
