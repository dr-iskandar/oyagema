const Joi = require("joi");

const createDonationSchema = Joi.object({
  donor_name: Joi.string().min(3).max(100).required(),
  donor_email: Joi.string().email().required(),
  amount: Joi.number().min(1).required(),
  payment_method: Joi.string().valid('QRIS').default('QRIS'),
  message: Joi.string().max(500).allow('').optional()
});

const verifyDonationSchema = Joi.object({
  payment_id: Joi.string().min(3).max(100).required(),
  merchant_key: Joi.string().min(3).max(100).required(),
});

const sendThanksSchema = Joi.object({
  donor_email: Joi.string().email().required(),
  donor_name: Joi.string().min(3).max(100).required(),
  amount: Joi.number().min(1).required(),
  transaction_id: Joi.string().required(),
  donation_date: Joi.date().optional()
});

module.exports = {
  createDonationSchema,
  verifyDonationSchema,
  sendThanksSchema
};