import Docker from "dockerode";
import { DockerContainer } from "./types";

export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker();
  }

  async listContainers(): Promise<DockerContainer[]> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers;
    } catch (error) {
      throw new Error(`Failed to list containers: ${error}`);
    }
  }

  async restartContainer(containerName: string): Promise<void> {
    try {
      const container = this.docker.getContainer(containerName);
      await container.restart();
    } catch (error) {
      throw new Error(`Failed to restart container: ${error}`);
    }
  }
}
