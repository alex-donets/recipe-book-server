const sgMail = require('@sendgrid/mail');

exports.sendEmail = function (address, subject, text, html, callback) {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    var msg = {
        to: address,
        from: process.env.SENDGRID_EMAIL_FROM,
        subject: subject,
    };

    if (text)
        msg.text = text;
    if (html)
        msg.html = html;


    sgMail.send(msg)
        .then(() => {
            callback({ msg: "Reset password email has been sent" });
        })
        .catch(error => {
            callback({ msg: error.toString() });
        });
};
