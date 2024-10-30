export interface DockerContainer {
  Id: string;
  Names: string[];
  State: string;
  Status: string;
}

export interface Config {
  telegramToken: string;
  authorizedUsers: number[];
}
