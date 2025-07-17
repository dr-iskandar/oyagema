const { default: axios } = require("axios");
const CryptoJS = require("crypto-js");
const {
  createDonationSchema,
  verifyDonationSchema,
} = require("../validator/donation.validator");
const { generateDonationOrderId, generateTransactionId } = require("../helpers/helpers");
const { PAYMENT_GATEWAY_URI, PAYMENT_CLIENT_ID, PAYMENT_CLIENT_SECRET, FRONTEND_URL, DONATION_SERVICE_URL } = require("../constant");
const { BadRequestError } = require("../errors");

class DonationService {
  static async createDonation(req) {
    // Validate Request
    const { error, value } = createDonationSchema.validate(req.body, {
      abortEarly: false,
    });

    // Throw Error
    if (error) {
      throw new BadRequestError(
        error.details.map((err) => err.message).join("|")
      );
    }

    const { donor_name, donor_email, amount, payment_method = 'QRIS', message } = value;

    const XCLIENTID = btoa(PAYMENT_CLIENT_ID);
    const timestamp = new Date().toISOString();
    const orderId = generateDonationOrderId(donor_name);
    const transactionId = generateTransactionId();

    const data = {
      expires_in: "3",
      order_id: orderId,
      user_id: donor_name.split(" ")[0].toLowerCase(),
      merchant_name: "PT IKAYAMA MANUSA SOLUSI",
      payment_method: payment_method,
      total_amount: amount,
      customer_name: donor_name,
      courier_agent: "JNE",
      currency: "IDR",
      push_url: `${DONATION_SERVICE_URL}/donation/webhook`,
      callback_url: `${FRONTEND_URL}/donation/success?orderId=${orderId}&email=${donor_email}&amount=${amount}&transactionId=${transactionId}`,
    };

    const payloadToHashed = [
      data.expires_in,
      data.order_id,
      data.user_id,
      data.merchant_name,
      payment_method,
      amount,
      donor_name,
      data.currency,
      data.push_url,
      data.callback_url,
    ].join(":");

    const hashedPayload = CryptoJS.SHA256(payloadToHashed)
      .toString(CryptoJS.enc.Hex)
      .toLowerCase();

    const hmac = CryptoJS.HmacSHA256(
      `${hashedPayload}:${PAYMENT_CLIENT_ID}:${timestamp}`,
      PAYMENT_CLIENT_SECRET
    );

    const signature = CryptoJS.enc.Base64.stringify(hmac);

    const headers = {
      Accept: "application/json",
    };

    const URL = `${PAYMENT_GATEWAY_URI}/api/v2.1/payment/create`;

    try {
      const payloadPayment = {
        ...data,
        "x-client-id": XCLIENTID,
        "x-timestamp": timestamp,
        "x-signature": signature,
      };

      console.log('Creating donation payment with payload:', {
        orderId,
        amount,
        donor_name,
        donor_email,
        payment_method
      });

      const result = await axios.post(URL, payloadPayment, {
        headers,
        withCredentials: true,
      });

      console.log('Payment gateway response:', {
        status: result.status,
        data: result.data,
        responseUrl: result.request?.res?.responseUrl,
        headers: result.headers
      });

      // Try different ways to get the payment URL
      const paymentUrl = result.data?.payment_url || 
                        result.data?.redirect_url || 
                        result.data?.url || 
                        result.request?.res?.responseUrl;

      console.log('Extracted payment URL:', paymentUrl);

      return {
        payment_url: paymentUrl,
        redirectUrl: paymentUrl, // Keep for backward compatibility
        orderId: orderId,
        transactionId: transactionId,
        amount: amount,
        donor_name: donor_name,
        donor_email: donor_email,
        rawResponse: result.data
      };
    } catch (error) {
      console.log("Donation creation error:", error?.response?.data || error.message);
      throw new BadRequestError("Failed to create donation payment. Please try again.");
    }
  }

  static async verifyDonation(req) {
    // Validate Request
    const { error, value } = verifyDonationSchema.validate(req.body, {
      abortEarly: false,
    });

    // Throw Error
    if (error) {
      throw new BadRequestError(
        error.details.map((err) => err.message).join("|")
      );
    }

    const { payment_id, merchant_key } = value;

    const URL = `${PAYMENT_GATEWAY_URI}/api/v2/general-check-payment`;

    try {
      const payload = {
        payment_id,
        merchant_key,
      };

      const result = await axios.post(URL, payload);
      console.log('Donation verification result:', result.data);

      return {
        ...result.data,
        isDonation: true
      };
    } catch (error) {
      console.log('Donation verification error:', error?.response?.data);
      
      if (error?.response?.data && error?.response?.data?.transaction_status === "FAILED") {
        const { order_id, transaction_id } = error?.response?.data;
        throw new BadRequestError(
          `Donation with ID: ${order_id} & Transaction ID: ${transaction_id} failed. Please contact support.`
        );
      }

      throw new BadRequestError("Failed to verify donation payment.");
    }
  }

  static async handleWebhook(req) {
    const {
      transaction_id,
      payment_method,
      transaction_time,
      transaction_status,
      payment_id,
      order_id,
      amount,
      payment_status,
      payment_time,
      account_number,
      issuer_name,
    } = req.body;

    console.log("Donation webhook received:", {
      transaction_id,
      payment_method,
      transaction_status,
      order_id,
      amount,
      payment_status
    });

    // Here you could save donation records to database
    // and trigger thank you email if payment is successful
    
    if (payment_status === 'SUCCESS' || transaction_status === 'SUCCESS') {
      console.log(`Donation ${order_id} completed successfully`);
      // Trigger thank you email here
    }

    return req.body;
  }
}

module.exports = DonationService;