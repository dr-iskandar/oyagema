const donationRouter = require("express").Router();
const DonationController = require("../controllers/donation.controller.js");

// Create donation payment
donationRouter.post("/create", DonationController.createDonation);

// Verify donation payment
donationRouter.post("/verify", DonationController.verifyDonation);

// Webhook handler for payment gateway
donationRouter.post("/webhook", DonationController.handleWebhook);

// Send thank you email
donationRouter.post("/send-thanks", DonationController.sendThankYouEmail);

// Get donation status
donationRouter.get("/status/:orderId", DonationController.getDonationStatus);

module.exports = donationRouter;