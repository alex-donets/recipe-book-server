module.exports.htmlTemplate = `
    <html>
    <head>
      <title></title>
    </head>
    <body>
      <div>
          <br>
          <br>
          <br>
            Hello!
          <br>
          <br>
              &nbsp; 
              You recently requested to reset your password for your Recipe Book account. Please set a secure password by clicking on the link below.<br>&nbsp; Note that the link will be active for the <b>next 30 minutes</b>.
          <br>
          <br>
          <a href="{{{resetLink}}}" target="_blank" data-saferedirecturl="https://www.google.com/url?q=http://jhghjg&amp;source=gmail&amp;ust=1603957968927000&amp;usg=AFQjCNFxutTDPJo710nLNnFfjLJRu46RoQ">
            Set a secure password
          </a>
          <br>
          <br>
            &nbsp; If you did not requested a password reset, please ignore this email.
          <br>
          <br>
            &nbsp; Thanks,
            <br>
            &nbsp; Recipe Book team.
      </div>
    </body>
  </html>


`;
