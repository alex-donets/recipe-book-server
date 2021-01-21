const { sendEmail } = require('../tools/email');
const { htmlTemplate } = require('../templates/reset-password-email');
const { getWebUrl, envVars } = require('../helpers');

const env = process.env.NODE_ENV;
const webUrl = getWebUrl(env);
const subDomain = env === envVars.stage ? process.env.WEB_APP_SUB_DOMAIN : '';

module.exports.sendResetPassEmail = async(emailAddress, token) => {
  try {
    const linkTemplate = replaceLink(htmlTemplate, `${webUrl}${subDomain}/set-password/${token}`);

    return sendEmail(emailAddress, 'Recipe Book Reset Password', '', linkTemplate);
  } catch (e) {
    throw new Error(e);
  }
};

const replaceLink = (template, link) => {
  return template.replace('{{{resetLink}}}', link);
};
