import axios from 'axios';
import envVars from '../../config/env.js';
import logger from '../../shared/utils/logger.js';

/**
 * Telegram Notification Service
 * Sends notifications to providers via Telegram bot
 */

/**
 * Send Telegram message
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Message text
 * @param {Object} options - Additional options
 * @returns {Promise<Object>}
 */
export const sendTelegramMessage = async (chatId, message, options = {}) => {
  try {
    if (!envVars.TELEGRAM_BOT_TOKEN || !chatId) {
      logger.warn('Telegram bot token or chat ID not configured');
      return { success: false, error: 'Telegram not configured' };
    }

    const url = `https://api.telegram.org/bot${envVars.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options
    });

    logger.info(`Telegram message sent to ${chatId}`);

    return {
      success: true,
      messageId: response.data.result.message_id
    };
  } catch (error) {
    logger.error(`Telegram notification error: ${error.message}`);
    return {
      success: false,
      error: error.response?.data?.description || error.message
    };
  }
};

/**
 * Send booking confirmation notification
 * @param {Object} params - Notification parameters
 * @returns {Promise<Object>}
 */
export const sendBookingConfirmation = async (params) => {
  const {
    providerChatId,
    providerName,
    customerName,
    serviceTitle,
    bookingDate,
    duration,
    price,
    bookingId,
    notes
  } = params;

  const message = `
🔔 <b>NEW BOOKING CONFIRMED!</b>

👤 <b>Customer:</b> ${customerName}
🛠 <b>Service:</b> ${serviceTitle}
📅 <b>Date:</b> ${new Date(bookingDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
⏱ <b>Duration:</b> ${duration} minutes
💰 <b>Price:</b> ${price} ETB

📝 <b>Notes:</b> ${notes || 'No notes provided'}

🆔 <b>Booking ID:</b> ${bookingId}

✅ Please accept this booking to confirm it.
  `;

  return await sendTelegramMessage(providerChatId, message);
};

/**
 * Send new message notification
 * @param {Object} params - Notification parameters
 * @returns {Promise<Object>}
 */
export const sendMessageNotification = async (params) => {
  const {
    providerChatId,
    providerName,
    customerName,
    serviceTitle,
    subject,
    message: messageText,
    messageId
  } = params;

  const message = `
💬 <b>NEW MESSAGE RECEIVED!</b>

👤 <b>From:</b> ${customerName}
🛠 <b>Service:</b> ${serviceTitle}
📧 <b>Subject:</b> ${subject}

📝 <b>Message:</b>
${messageText}

🆔 <b>Message ID:</b> ${messageId}

💡 Login to your dashboard to respond.
  `;

  return await sendTelegramMessage(providerChatId, message);
};

/**
 * Send booking status update notification
 * @param {Object} params - Notification parameters
 * @returns {Promise<Object>}
 */
export const sendBookingStatusUpdate = async (params) => {
  const {
    providerChatId,
    customerName,
    serviceTitle,
    bookingDate,
    status,
    bookingId
  } = params;

  const statusEmoji = {
    accepted: '✅',
    rejected: '❌',
    completed: '🎉',
    cancelled: '⚠️'
  };

  const statusText = {
    accepted: 'ACCEPTED',
    rejected: 'REJECTED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED'
  };

  const emoji = statusEmoji[status] || '📋';
  const text = statusText[status] || status;

  const message = `
${emoji} <b>BOOKING ${text}</b>

👤 <b>Customer:</b> ${customerName}
🛠 <b>Service:</b> ${serviceTitle}
📅 <b>Date:</b> ${new Date(bookingDate).toLocaleDateString()}

🆔 <b>Booking ID:</b> ${bookingId}
  `;

  return await sendTelegramMessage(providerChatId, message);
};

/**
 * Send payment received notification
 * @param {Object} params - Notification parameters
 * @returns {Promise<Object>}
 */
export const sendPaymentNotification = async (params) => {
  const {
    providerChatId,
    customerName,
    serviceTitle,
    amount,
    paymentId
  } = params;

  const message = `
💰 <b>PAYMENT RECEIVED!</b>

👤 <b>From:</b> ${customerName}
🛠 <b>Service:</b> ${serviceTitle}
💵 <b>Amount:</b> ${amount} ETB

🆔 <b>Payment ID:</b> ${paymentId}

✅ Payment has been processed successfully.
  `;

  return await sendTelegramMessage(providerChatId, message);
};

/**
 * Get bot info (for testing)
 * @returns {Promise<Object>}
 */
export const getBotInfo = async () => {
  try {
    if (!envVars.TELEGRAM_BOT_TOKEN) {
      return { success: false, error: 'Telegram bot token not configured' };
    }

    const response = await axios.get(
      `https://api.telegram.org/bot${envVars.TELEGRAM_BOT_TOKEN}/getMe`
    );

    return {
      success: true,
      bot: response.data.result
    };
  } catch (error) {
    logger.error(`Telegram bot info error: ${error.message}`);
    return {
      success: false,
      error: error.response?.data?.description || error.message
    };
  }
};
