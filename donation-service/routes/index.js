const router = require("express").Router();
const donationRouter = require("./donation.router.js");

router.use("/donation", donationRouter);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Donation Service is running",
    timestamp: new Date().toISOString(),
    service: "donation-service",
    version: "1.0.0"
  });
});

module.exports = router;