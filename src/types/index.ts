export type PostmanEnvironmentVariablesType = {
  name: string;
  values: PostmanEnvironmentVariableType[];
};

export type PostmanEnvironmentVariableType = {
  key: string;
  value: string;
  type: string;
  enabled: boolean;
};
