const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zubairua471@gmail.com",
    pass: "zdxx bmqx zjgq xafq"   // App password
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: '"Online Complaint System" <zubairua471@gmail.com>',
    to,
    subject,
    text
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
