import nodemailer from 'nodemailer';
import envVars from '../../config/env.js';
import logger from '../../shared/utils/logger.js';

/**
 * Email Notification Service
 * Sends emails to providers for booking confirmations and messages
 */

// Configure transporter
const createTransporter = () => {
  if (envVars.SMTP_HOST && envVars.SMTP_USER) {
    return nodemailer.createTransport({
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT || 587,
      secure: envVars.SMTP_SECURE || false,
      auth: {
        user: envVars.SMTP_USER,
        pass: envVars.SMTP_PASS
      }
    });
  }

  // Return null if not configured
  return null;
};

const transporter = createTransporter();

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>}
 */
export const sendEmail = async (options) => {
  try {
    if (!transporter) {
      logger.warn('SMTP not configured - email not sent');
      return { success: false, error: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: envVars.SMTP_FROM || '"mrNibras" <noreply@mrnibras.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });

    logger.info(`Email sent to ${options.to}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send booking confirmation email
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>}
 */
export const sendBookingConfirmationEmail = async (params) => {
  const {
    providerEmail,
    providerName,
    customerName,
    customerEmail,
    serviceTitle,
    bookingDate,
    duration,
    price,
    bookingId,
    notes
  } = params;

  const subject = `🔔 New Booking Confirmed - ${serviceTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking Confirmed!</h1>
          <p>You have a new booking request</p>
        </div>
        <div class="content">
          <p>Hi <strong>${providerName}</strong>,</p>
          <p>A new booking has been confirmed for your service. Please review and accept it.</p>
          
          <h2 style="color: #667eea;">Booking Details</h2>
          
          <div class="detail-row">
            <span class="detail-label">👤 Customer:</span>
            <span>${customerName} (${customerEmail})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🛠 Service:</span>
            <span>${serviceTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span>${new Date(bookingDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">⏱ Duration:</span>
            <span>${duration} minutes</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">💰 Price:</span>
            <span><strong>${price} ETB</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🆔 Booking ID:</span>
            <span>${bookingId}</span>
          </div>
          
          ${notes ? `
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>📝 Customer Notes:</strong><br>
            ${notes}
          </div>
          ` : ''}
          
          <div style="text-align: center;">
            <a href="${envVars.APP_URL || 'http://localhost:5173'}/dashboard" class="button">
              View Booking in Dashboard
            </a>
          </div>
          
          <p style="margin-top: 20px;">Please accept this booking to confirm it with the customer.</p>
        </div>
        <div class="footer">
          <p>This email was sent by mrNibras Local Market</p>
          <p>© ${new Date().getFullYear()} mrNibras. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW BOOKING CONFIRMED!

Customer: ${customerName} (${customerEmail})
Service: ${serviceTitle}
Date: ${new Date(bookingDate).toLocaleString()}
Duration: ${duration} minutes
Price: ${price} ETB
Booking ID: ${bookingId}

${notes ? `Customer Notes: ${notes}` : ''}

Login to your dashboard to accept this booking: ${envVars.APP_URL || 'http://localhost:5173'}/dashboard
  `;

  return await sendEmail({
    to: providerEmail,
    subject,
    html,
    text
  });
};

/**
 * Send new message notification email
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>}
 */
export const sendMessageNotificationEmail = async (params) => {
  const {
    providerEmail,
    providerName,
    customerName,
    customerEmail,
    serviceTitle,
    subject: messageSubject,
    message: messageText,
    messageId
  } = params;

  const subject = `💬 New Message from ${customerName} - ${serviceTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .message-box { background: white; padding: 20px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
        .detail-label { font-weight: bold; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Message Received!</h1>
          <p>You have a new message from a customer</p>
        </div>
        <div class="content">
          <p>Hi <strong>${providerName}</strong>,</p>
          <p>You have received a new message regarding your service.</p>
          
          <h2 style="color: #f5576c;">Message Details</h2>
          
          <div class="detail-row">
            <span class="detail-label">👤 From:</span>
            <span>${customerName} (${customerEmail})</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🛠 Service:</span>
            <span>${serviceTitle}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📧 Subject:</span>
            <span>${messageSubject}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🆔 Message ID:</span>
            <span>${messageId}</span>
          </div>
          
          <div class="message-box">
            <strong>Message:</strong><br><br>
            ${messageText.replace(/\n/g, '<br>')}
          </div>
          
          <div style="text-align: center;">
            <a href="${envVars.APP_URL || 'http://localhost:5173'}/messages" class="button">
              View Messages in Dashboard
            </a>
          </div>
          
          <p style="margin-top: 20px;">Login to your dashboard to read and respond to this message.</p>
        </div>
        <div class="footer">
          <p>This email was sent by mrNibras Local Market</p>
          <p>© ${new Date().getFullYear()} mrNibras. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW MESSAGE RECEIVED!

From: ${customerName} (${customerEmail})
Service: ${serviceTitle}
Subject: ${messageSubject}

Message:
${messageText}

Message ID: ${messageId}

Login to your dashboard to respond: ${envVars.APP_URL || 'http://localhost:5173'}/messages
  `;

  return await sendEmail({
    to: providerEmail,
    subject,
    html,
    text
  });
};

export default {
  sendEmail,
  sendBookingConfirmationEmail,
  sendMessageNotificationEmail
};
