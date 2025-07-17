const { sendMail } = require("../helpers/nodemailer");
const { sendThanksSchema } = require("../validator/donation.validator");
const { formatCurrency, formatDate } = require("../helpers/helpers");
const { BadRequestError } = require("../errors");

class MailService {
  static async sendThankYouEmail(req) {
    // Validate Request
    const { error, value } = sendThanksSchema.validate(req.body, {
      abortEarly: false,
    });

    // Throw Error
    if (error) {
      throw new BadRequestError(
        error.details.map((err) => err.message).join("|")
      );
    }

    const { donor_email, donor_name, amount, transaction_id, donation_date = new Date() } = value;

    const senderEmail = process.env.EMAIL_USER;
    const formattedAmount = formatCurrency(amount);
    const formattedDate = formatDate(donation_date);

    let detail = {
      from: `Oyagema Team <${senderEmail}>`,
      to: donor_email,
      subject: "Thank You for Your Generous Donation! 🎵",
      text: `Dear ${donor_name}, thank you for your donation of ${formattedAmount} to support Oyagema music platform.`,
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Thank You for Your Donation - Oyagema</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .receipt { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .amount { font-size: 24px; font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .heart { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Thank You for Supporting Oyagema!</h1>
            <p>Your generosity keeps the music playing for everyone</p>
          </div>
          
          <div class="content">
            <h2>Dear ${donor_name},</h2>
            
            <p>We are incredibly grateful for your generous donation to the Oyagema music platform. Your support helps us continue providing a beautiful musical experience for our community.</p>
            
            <div class="receipt">
              <h3>🧾 Donation Receipt</h3>
              <p><strong>Donation Amount:</strong> <span class="amount">${formattedAmount}</span></p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Transaction ID:</strong> ${transaction_id}</p>
              <p><strong>Donor:</strong> ${donor_name}</p>
            </div>
            
            <h3>How Your Donation Helps:</h3>
            <ul>
              <li>🎶 Maintaining high-quality music streaming</li>
              <li>🔧 Improving platform features and user experience</li>
              <li>💾 Ensuring reliable music storage and backup</li>
              <li>🌟 Supporting independent artists and creators</li>
              <li>📱 Developing new features for better music discovery</li>
            </ul>
            
            <p>Your contribution, no matter the size, makes a real difference in our mission to bring beautiful music to everyone. We're honored to have supporters like you who believe in the power of music to connect and inspire.</p>
            
            <p>Thank you once again for your kindness and support. We hope you continue to enjoy the Oyagema experience!</p>
            
            <p>With heartfelt gratitude,<br>
            <strong>The Oyagema Team</strong> <span class="heart">❤️</span></p>
          </div>
          
          <div class="footer">
            <p>This is an automated receipt for your donation to Oyagema.<br>
            If you have any questions, please contact us at support@oyagema.com</p>
            <p>© 2024 Oyagema - Bringing Music to Life</p>
          </div>
        </div>
      </body>
      </html>
      `,
    };

    try {
      await sendMail(detail);
      console.log(`Thank you email sent to ${donor_email} for donation of ${formattedAmount}`);
      
      return {
        success: true,
        message: "Thank you email sent successfully",
        recipient: donor_email,
        amount: formattedAmount
      };
    } catch (error) {
      console.log("Error sending thank you email:", error);
      throw new BadRequestError("Failed to send thank you email. Please contact support.");
    }
  }

  static async sendDonationNotification(donationData) {
    // Internal method to send notification to admin about new donation
    const { donor_name, donor_email, amount, transaction_id } = donationData;
    const senderEmail = process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL || senderEmail;
    
    const detail = {
      from: `Oyagema System <${senderEmail}>`,
      to: adminEmail,
      subject: `New Donation Received - ${formatCurrency(amount)}`,
      html: `
        <h2>New Donation Received!</h2>
        <p><strong>Donor:</strong> ${donor_name} (${donor_email})</p>
        <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
        <p><strong>Transaction ID:</strong> ${transaction_id}</p>
        <p><strong>Date:</strong> ${formatDate(new Date())}</p>
      `
    };

    try {
      await sendMail(detail);
      console.log(`Admin notification sent for donation from ${donor_name}`);
    } catch (error) {
      console.log("Error sending admin notification:", error);
      // Don't throw error for admin notification failure
    }
  }
}

module.exports = MailService;