import { mailClient, mailSender } from "./index.js";

export async function sendPasswordResetEmail(
  email: string,
  resetURL: string,
): Promise<void> {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new Error("invalid email address provided.");
  }
  if (!resetURL || typeof resetURL !== "string") {
    throw new Error("invalid reset URL provided.");
  }

  try {
    const recipient = [{ email }];

    const response = await mailClient.send({
      from: mailSender,
      to: recipient,
      subject: "Password Reset",
      text: `Reset Url: ${resetURL}`,
      category: "Password Reset",
    });

    console.log("email is sent", response);
  } catch (err) {
    const errorMessage = `error occurred while sending a password reset email: ${(err as Error).message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

export async function sendPasswordSuccessEmail(email: string): Promise<void> {
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    throw new Error("invalid email address provided.");
  }

  try {
    const recipient = [{ email }];
    const response = await mailClient.send({
      from: mailSender,
      to: recipient,
      subject: "Password Reset",
      text: "Password has been reset",
      category: "Password Reset",
    });

    console.log("password has been reset", response);
  } catch (err) {}
}
