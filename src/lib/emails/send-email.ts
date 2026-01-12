// import { ServerClient } from "postmark";

// const postmarkClient = new ServerClient(process.env.POSTMARK_SERVER_TOKEN!);

export function sendEmail({
  html,
  subject,
  text,
  to,
}: {
  html: string;
  subject: string;
  text: string;
  to: string;
}) {
  console.log({
    HtmlBody: html,
    Subject: subject,
    TextBody: text,
    To: to,
  });
  // return postmarkClient.sendEmail({
  // 	From: process.env.POSTMARK_FROM_EMAIL!,
  // 	HtmlBody: html,
  // 	MessageStream: 'outbound',
  // 	Subject: subject,
  // 	TextBody: text,
  // 	To: to,
  // })
}
