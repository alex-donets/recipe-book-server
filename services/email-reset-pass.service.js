const { sendEmail } = require("../tools/email");
const { htmlTemplate } = require("../templates/reset-password-email");
const { getWebUrl } = require("../helpers");

const env = process.env.NODE_ENV;
const webUrl = getWebUrl(env);

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
