import { Context, Telegraf } from "telegraf";
import { Message } from "telegraf/types";
import { Config } from "./types";
import { DockerService } from "./docker";

export class Bot {
  private bot: Telegraf;
  private dockerService: DockerService;
  private config: Config;

  constructor(config: Config) {
    this.bot = new Telegraf(config.telegramToken);
    this.dockerService = new DockerService();
    this.config = config;

    this.setupCommands();
  }

  private isAuthorized(ctx: Context): boolean {
    const userId = ctx.from?.id;
    return userId ? this.config.authorizedUsers.includes(userId) : false;
  }

  private setupCommands(): void {
    // Middleware for authorization
    this.bot.use(async (ctx, next) => {
      if (!this.isAuthorized(ctx)) {
        await ctx.reply("Sorry, you are not authorized to use this bot.");
        return;
      }
      return next();
    });

    // List containers command
    this.bot.command("list", async (ctx) => {
      try {
        const containers = await this.dockerService.listContainers();

        if (containers.length === 0) {
          await ctx.reply("No containers found.");
          return;
        }

        const message = containers
          .map((container) => {
            const name = container.Names[0].replace("/", "");
            return `• ${name}\n  Status: ${
              container.State
            }\n  ID: ${container.Id.substring(0, 12)}\n`;
          })
          .join("\n");

        await ctx.reply(`🐳 Docker Containers:\n\n${message}`);
      } catch (error) {
        await ctx.reply(`Error listing containers: ${error}`);
      }
    });

    // Restart container command
    this.bot.command("restart", async (ctx) => {
      try {
        const message = ctx.message as Message.TextMessage;
        const containerName = message.text.split(" ")[1];

        if (!containerName) {
          await ctx.reply(
            "Please provide a container name.\nUsage: /restart container_name"
          );
          return;
        }

        await this.dockerService.restartContainer(containerName);
        await ctx.reply(
          `Container '${containerName}' has been restarted successfully.`
        );
      } catch (error) {
        await ctx.reply(`Error restarting container: ${error}`);
      }
    });
  }

  public start(): void {
    this.bot.launch();

    // Enable graceful stop
    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }
}
