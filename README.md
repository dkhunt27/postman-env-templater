# Postman-env-templater

Creating postman collections using environments so you can easily switch between dev, test, beta, prod, etc is a great thing. Makes it easy to to test and work with your code across all the environments you support. However, most api calls require some sort of secret information like an api key or auth credentials. And we cannot check that information into the repo. And maybe Postman Cloud is not a solution that you can use. Now when you use the environment for the first time or you want to pull in any updates to it, you will need to look up that secret information and update your local environments, but also, ensure your local copies with the secrets do not accidentally get check back into the repo.

This is where postman-env-templates helps. You save your secrets to SSM and update your env templates to have the ssm path. You can save your templates to the repo. The logic takes the template, looks up any SSM params needed, and then creates the real postman env files with the secret values. Lastly, you use gitignore to ensure those real environment files do not get checked into the repo.

## Help

```bash
postman-env-templater

Utility script for setting up postman environment files.  (i.e. update secrets from ssm)

Usage:
    postman-env-templater OPTION[S]

OPTIONS:
        --help               displays help
    -t  --template-file      environment template file to process
    -o  --output-dir         OPTIONAL: where to save processed environment file; defaults to current directory
    -w  --working-dir        OPTIONAL: where to set the working directory; defaults to current directory
    -r  --region             OPTIONAL: aws region to use

Examples:
    yarn postman-env-templater --template-file=./postman/env-templates/dev.json                  processes the dev environment file
```

### Install

- If using yarn, run `yarn add postman-env-templater`
- If using npm, run `npm install postman-env-templater`

### Usage

- Create a folder for your env templates. Create a json file for each environment that will be templated.

```bash
postman
  projectA.postman_collection.json
  - env-templates
    dev.json
    test.json
    beta.json
    prod.json
```

- Update .gitignore and add your environments folder which will be sibling to the env-templates folder

```bash
#.gitignore
postman/environments/
```

- Update the environment templates. In the values array, add any non secret variables and their correct values and set enabled to true. For secrets, append to the key "4TEMPLATER:" and its value should be ssm path appended with "ssm:" and set enabled to false. Like so:

```base
# postman/env-templates/dev.json
{
  "name": "project-a-dev",
  "values": [
    {
      "key": "baseUrl",
      "value": "https://dev-api.projecta.com/api",
      "type": "default",
      "enabled": true
    },
    {
      "key": "4TEMPLATER:username",
      "value": "ssm:/projectA/dev/username:false",
      "type": "secret",
      "enabled": false
    },
    {
      "key": "4TEMPLATER:password",
      "value": "ssm:/projectA/dev/password:true",
      "type": "secret",
      "enabled": false
    }
  ]
}
```

- Add `postman-env-templater` to your project as dev dependency
- Run the following command per environment you want to template. You will need to have the correct credentials in your default profile

```bash
# assuming using yarn
yarn postman-env-templater --working-dir=$PWD --template-file=./env-templates/dev.json -output-dir=./environments --region=us-west-2

```

- Now you can import the environment folder into postman with all the secrets populated
