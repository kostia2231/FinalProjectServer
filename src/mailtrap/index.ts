import { MailtrapClient } from "mailtrap";
import "dotenv/config";

const mailToken: string = process.env.MAIL_TOKEN || "";

export const mailClient = new MailtrapClient({
  token: mailToken,
});

export const mailSender = {
  email: "hello@demomailtrap.com",
  name: "notaninstagram",
};
