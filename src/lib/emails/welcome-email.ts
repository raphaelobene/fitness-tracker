import { site } from "@/lib/constants";
import { sendEmail } from "./send-email";

export async function sendWelcomeEmail(user: { email: string; name: string }) {
  await sendEmail({
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${site.name}!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for signing up to ${site.name}! We're excited to have you on board.</p>
        <p>Best regards,
        <br>
        ${site.name} Team</p>
      </div>
    `,
    subject: `Welcome to ${site.name}!`,
    text: `Hello ${user.name},\n\nThank you for signing up to ${site.name}! We're excited to have you on board.\n\nBest regards,\n${site.name} Team`,
    to: user.email,
  });
}
