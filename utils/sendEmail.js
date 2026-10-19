
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, message) {
  const { data, error } = await resend.emails.send({
    from: "CampusEvents <onboarding@resend.dev>",
    to: [to],
    subject,
    text: message
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = sendEmail;
