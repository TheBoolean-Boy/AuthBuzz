import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv"

dotenv.config();

export const mailtrapClient = new MailtrapClient({
  endpoint:process.env.MAIL_ENDPOINT,
  token:process.env.MAIL_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "AuthBuzz",
};

