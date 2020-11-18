const { sendEmail } = require("../tools/email");
const { htmlTemplate } = require("../templates/reset-password-email");

module.exports.sendResetPassEmail = function (emailAddress, token) {
    const linkTemplate = replaceLink(htmlTemplate, `${process.env.WEB_APP_URL}/set-password/${token}`);

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
