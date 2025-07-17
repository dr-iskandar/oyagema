const { v4: uuidv4 } = require('uuid');

const generateDonationOrderId = (donorName) => {
  // Get the current date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const hour = String(today.getHours()).padStart(2, "0");
  const minute = String(today.getMinutes()).padStart(2, "0");
  const second = String(today.getSeconds()).padStart(2, "0");

  // Extract the first name
  const name = String(donorName).split(" ")[0].toLowerCase();
  
  // Generate unique donation ID
  const donationId = `DON-${year}${month}${day}${hour}${minute}${second}-${name}`;

  return donationId;
};

const generateTransactionId = () => {
  return `TXN-${uuidv4()}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

module.exports = {
  generateDonationOrderId,
  generateTransactionId,
  formatCurrency,
  formatDate
}