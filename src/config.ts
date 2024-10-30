import dotenv from "dotenv";
import { Config } from "./types";

dotenv.config();

export const config: Config = {
  telegramToken: process.env.TELEGRAM_TOKEN || "",
  authorizedUsers: process.env.AUTHORIZED_USERS
    ? process.env.AUTHORIZED_USERS.split(",").map(Number)
    : [],
};
