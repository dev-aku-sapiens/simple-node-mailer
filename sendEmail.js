require('dotenv').config();

const fs = require('fs').promises; // Use the Promise-based version of the fs module
const path = require('path');
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');

const recipients = require('./template/account-5/recipients.json');

async function getHtmlContent(templateName, replacements) {
  const filePath = path.resolve(
    __dirname,
    'template',
    'account-5',
    templateName
  );

  try {
    const htmlContent = await fs.readFile(filePath, 'utf8');
    const template = Handlebars.compile(htmlContent);
    return template(replacements);
  } catch (error) {
    console.error('Error reading template file:', error);
    throw error; // Rethrow the error after logging it
  }
}

const emailTransportConfig = {
  port: 465,
  secure: true,
  service: 'Gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_USER, // More descriptive variable name
    pass: process.env.EMAIL_PASSWORD, // More descriptive variable name
  },
};

const transporter = nodemailer.createTransport(emailTransportConfig);

async function sendEmail(mailOptions) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response} ${mailOptions.subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

const emails = ['raj1711dell@gmail.com', 'rajkumar@seminal.one'];

recipients.forEach(async (recipient) => {
  // Mark function as async
  if (recipient.initiate) {
    try {
      const htmlContent = await getHtmlContent(
        recipient.template,
        recipient.data
      );

      const mailOptions = {
        html: htmlContent,
        subject: recipient.subject,
        from: process.env.EMAIL_USER,
        to: emails, // Use the emails field from the JSON
      };

      await sendEmail(mailOptions); // Wait for the email to be sent
    } catch (error) {
      console.error('Error processing recipient:', error);
    }
  } else {
    console.log(`Skipping email for ${recipient.subject}`);
  }
});
