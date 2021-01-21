const sgMail = require('@sendgrid/mail');

exports.sendEmail = async(address, subject, text, html) => {
  await sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  let msg = {
    to: address,
    from: process.env.SENDGRID_EMAIL_FROM,
    subject: subject
  };

  if (text) msg.text = text;
  if (html) msg.html = html;

  try {
    const sendEmail = await sgMail.send(msg);

    if (!sendEmail) {
      throw new Error('Email has not been sent');
    }

  return sendEmail;

  } catch (e) {
    throw new Error(e);
  }
};
