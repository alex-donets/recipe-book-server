const { sendEmail } = require("../tools/email");
const { htmlTemplate } = require("../templates/reset-password-email");

const webUrl = process.env.NODE_ENV === 'development' ? process.env.WEB_APP_URL_DEV : process.env.WEB_APP_URL_PROD;

module.exports.sendResetPassEmail = function (emailAddress, token) {
    const linkTemplate = replaceLink(htmlTemplate, `${webUrl}/set-password/${token}`);

    sendEmail(
        emailAddress,
        'Recipe Book Reset Password',
        '',
        linkTemplate,
        (result) => {
            console.log(result);
        }
    );
};

function replaceLink(template, link) {
    return template.replace("{{{resetLink}}}", link);
}
