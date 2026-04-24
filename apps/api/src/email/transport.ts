import nodemailer from "nodemailer";
import { config } from "../config.js";

export const transport = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: false,
  auth: config.SMTP_USER
    ? { user: config.SMTP_USER, pass: config.SMTP_PASS ?? "" }
    : undefined,
});

export const FROM = config.SMTP_FROM;
