const { StatusCodes } = require("http-status-codes");
const DonationService = require("../services/donation.service");
const MailService = require("../services/mail.service");

class DonationController {
  static async createDonation(req, res, next) {
    try {
      const result = await DonationService.createDonation(req);

      res.status(StatusCodes.CREATED).json({
        status: "success",
        message: "Donation payment created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyDonation(req, res, next) {
    try {
      const result = await DonationService.verifyDonation(req);

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Donation verification completed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleWebhook(req, res, next) {
    try {
      const result = await DonationService.handleWebhook(req);

      // If payment is successful, automatically send thank you email
      const { payment_status, transaction_status, order_id, amount } = req.body;
      
      if (payment_status === 'SUCCESS' || transaction_status === 'SUCCESS') {
        // Extract donor info from order_id or use webhook data
        // This is a simplified version - in production you'd store this data
        console.log(`Donation ${order_id} completed - webhook processed`);
      }

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Webhook processed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sendThankYouEmail(req, res, next) {
    try {
      const result = await MailService.sendThankYouEmail(req);

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Thank you email sent successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDonationStatus(req, res, next) {
    try {
      const { orderId } = req.params;
      
      // This would typically query your database for donation status
      // For now, return a simple response
      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Donation status retrieved",
        data: {
          orderId: orderId,
          status: "pending", // This would come from your database
          message: "Donation is being processed"
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DonationController;