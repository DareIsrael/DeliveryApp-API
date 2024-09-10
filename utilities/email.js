const nodemailer = require('nodemailer');
require('dotenv').config();
const ejs = require('ejs');
const path = require('path');
const cheerio = require('cheerio');

// dotenv.config();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.name; // or any other property you want
    this.url = url;
    this.from = 'dareisrael@gmail.com'; // Your email or a default email
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    try {
      const html = await ejs.renderFile(
        path.join(__dirname, `../views/email/${template}.ejs`),
        {
          name: this.name,
          url: this.url,
          subject,
        }
      );

      const $ = cheerio.load(html);

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: $.text(),
      };

      await this.newTransport().sendMail(mailOptions);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcome() {
    try {
      await this.send('welcome', 'Welcome to Michael Enterprise');
    } catch (error) {
      console.error('Sending welcome email failed:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordReset() {
    try {
      await this.send(
        'passwordReset',
        'Your password reset token (valid for only 10 minutes)'
      );
    } catch (error) {
      console.error('Sending password reset email failed:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendConfirmEmail() {
    try {
      await this.send(
        'confirmEmail',
        'Your email confirmation token (valid for only 10 minutes)'
      );
    } catch (error) {
      console.error('Sending confirmation email failed:', error);
      throw new Error('Failed to send confirmation email');
    }
  }
};
