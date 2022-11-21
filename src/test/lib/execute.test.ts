import { execute } from '../../lib/execute';
import { displayUsage } from '../../lib/display-usage';
import { setupAwsConfig } from '../../lib/setup-aws-config';
import { template } from '../../lib/template';
import { readFileSync } from 'fs';
import mock from 'mock-fs';

jest.mock('../../lib/display-usage');
jest.mock('../../lib/setup-aws-config');
jest.mock('../../lib/template');

describe('lib/execute', () => {
  beforeEach(() => {
    expect.hasAssertions();
    global.console.log = jest.fn();
    global.console.error = jest.fn();
    global.process.exit = jest.fn() as jest.Mock<never, any>;

    // mock out some files
    mock({ 'some/path': { 'some-file.txt': 'abc' } });
  });
  afterEach(() => {
    mock.restore();
    jest.clearAllMocks();
  });
  describe('execute', () => {
    beforeEach(() => {
      (displayUsage as jest.Mock).mockReturnValue('');
      (setupAwsConfig as jest.Mock).mockReturnValue({ some: 'awsConfig' });
      (template as jest.Mock).mockResolvedValue('');
    });
    test('when no params sent; should display usage', async () => {
      await execute({});
      expect(displayUsage).toHaveBeenCalledTimes(1);
      expect(setupAwsConfig).toHaveBeenCalledTimes(0);
      expect(template).toHaveBeenCalledTimes(0);
      expect(global.process.exit).toHaveBeenCalledTimes(0);
    });
    test('when help params sent; should display usage', async () => {
      await execute({ help: true });
      expect(displayUsage).toHaveBeenCalledTimes(1);
      expect(setupAwsConfig).toHaveBeenCalledTimes(0);
      expect(template).toHaveBeenCalledTimes(0);
      expect(global.process.exit).toHaveBeenCalledTimes(0);
    });
    test('when env file does not exist; should error', async () => {
      mock({ 'some/working/dir/env-templates': { 'notDev.json': 'abc' } });
      await expect(
        execute({
          help: false,
          'working-dir': 'some/working/dir',
          'template-file': './env-templates/dev.json',
          'output-dir': 'some/working/dir/environments',
          region: 'someRegion',
        }),
      ).rejects.toThrow(
        "No such file or directory 'some/working/dir/env-templates/dev.json'",
      );

      expect(displayUsage).toHaveBeenCalledTimes(0);
      expect(setupAwsConfig).toHaveBeenCalledTimes(0);
      expect(template).toHaveBeenCalledTimes(0);
      expect(global.process.exit).toHaveBeenCalledTimes(0);
    });
    // test('when template file exists but output dir does not exist; should error', async () => {
    //   mock({ 'some/working/dir/env-templates': { 'dev.json': 'abc' } });
    //   await expect(
    //     execute({
    //       help: false,
    //       'working-dir': 'some/working/dir',
    //       'template-file': './env-templates/dev.json',
    //       'output-dir': 'some/working/dir/environments',
    //       region: 'someRegion',
    //     }),
    //   ).rejects.toThrow(
    //     "No such file or directory 'some/working/dir/env-templates/dev.json'",
    //   );

    //   expect(displayUsage).toHaveBeenCalledTimes(0);
    //   expect(setupAwsConfig).toHaveBeenCalledTimes(0);
    //   expect(template).toHaveBeenCalledTimes(0);
    //   expect(global.process.exit).toHaveBeenCalledTimes(0);
    // });
    test('when template file and output dir exist; should template', async () => {
      mock({
        'some/working/dir/env-templates': {
          'dev.json': JSON.stringify({
            name: 'dev',
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
          }),
        },
        'some/working/dir/environments': {},
      });
      (template as jest.Mock).mockResolvedValue({
        name: 'dev',
        some: 'setupResult',
      });
      await expect(
        execute({
          help: false,
          'working-dir': 'some/working/dir',
          'template-file': './env-templates/dev.json',
          'output-dir': './environments',
          region: 'someRegion',
        }),
      ).resolves.toBeUndefined();

      const newEnvFile = JSON.parse(
        readFileSync(
          'some/working/dir/environments/dev.postman_environment.json',
        ).toString(),
      );
      expect(newEnvFile).toEqual({ name: 'dev', some: 'setupResult' });
      expect(displayUsage).toHaveBeenCalledTimes(0);
      expect(setupAwsConfig).toHaveBeenCalledTimes(1);
      expect(template).toHaveBeenCalledTimes(1);
      expect(global.process.exit).toHaveBeenCalledTimes(0);
    });
  });
});
