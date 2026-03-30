import nodemailer from 'nodemailer';
import envVars from '../../config/env.js';
import logger from '../../shared/utils/logger.js';

/**
 * Email Service
 * Handles sending transactional emails
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

  // Use console for development if no SMTP configured
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const transporter = createTransporter();

/**
 * Email templates
 */
const templates = {
  bookingConfirmation: (data) => ({
    subject: 'Booking Confirmation',
    html: `
      <h1>Booking Confirmed! 🎉</h1>
      <p>Hi ${data.customerName},</p>
      <p>Your booking for <strong>${data.serviceTitle}</strong> has been confirmed.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${data.serviceTitle}</p>
        <p><strong>Provider:</strong> ${data.providerName}</p>
        <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleString()}</p>
        <p><strong>Price:</strong> $${data.amount}</p>
      </div>
      <p>We'll send you a reminder before your appointment.</p>
      <p>Thank you for using mrNibras Local Market!</p>
    `
  }),

  bookingStatusUpdate: (data) => ({
    subject: `Booking Status Update: ${data.status}`,
    html: `
      <h1>Booking Update</h1>
      <p>Hi ${data.customerName},</p>
      <p>Your booking status has been updated to <strong>${data.status}</strong>.</p>
      ${data.message ? `<p><strong>Note:</strong> ${data.message}</p>` : ''}
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${data.serviceTitle}</p>
        <p><strong>Provider:</strong> ${data.providerName}</p>
        <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleString()}</p>
      </div>
    `
  }),

  paymentReceipt: (data) => ({
    subject: 'Payment Receipt',
    html: `
      <h1>Payment Receipt 🧾</h1>
      <p>Hi ${data.customerName},</p>
      <p>Thank you for your payment!</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Service:</strong> ${data.serviceTitle}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can access your receipt anytime from your account.</p>
    `
  }),

  newBooking: (data) => ({
    subject: 'New Booking Request',
    html: `
      <h1>New Booking Request! 📅</h1>
      <p>Hi ${data.providerName},</p>
      <p>You have a new booking request.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${data.serviceTitle}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
        <p><strong>Date:</strong> ${new Date(data.bookingDate).toLocaleString()}</p>
        <p><strong>Price:</strong> $${data.amount}</p>
      </div>
      <p>Please accept or reject this booking from your dashboard.</p>
    `
  }),

  reviewReceived: (data) => ({
    subject: 'New Review Received',
    html: `
      <h1>New Review! ⭐</h1>
      <p>Hi ${data.providerName},</p>
      <p>You received a new review for <strong>${data.serviceTitle}</strong>.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Rating:</strong> ${'⭐'.repeat(data.rating)}</p>
        <p><strong>Comment:</strong> ${data.comment}</p>
        <p><strong>Customer:</strong> ${data.customerName}</p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hi ${data.userName},</p>
      <p>You requested to reset your password.</p>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reset Code:</strong> ${data.resetCode}</p>
        <p>This code will expire in 15 minutes.</p>
      </div>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to mrNibras Local Market!',
    html: `
      <h1>Welcome! 🎉</h1>
      <p>Hi ${data.userName},</p>
      <p>Welcome to mrNibras Local Market - your gateway to quality local services.</p>
      ${data.role === 'provider' ? 
        '<p>Start by creating your first service listing and reaching customers in your area.</p>' :
        '<p>Browse services, book professionals, and get things done!</p>'
      }
      <p>We're excited to have you on board!</p>
      <p>The mrNibras Team</p>
    `
  })
};

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>}
 */
export const sendEmail = async (options) => {
  const { to, subject, html, template, data } = options;

  // Use template if provided
  let emailContent = { subject, html };
  if (template && templates[template]) {
    emailContent = templates[template](data);
  }

  const mailOptions = {
    from: envVars.SMTP_FROM || 'mrNibras <noreply@mrnibras.com>',
    to,
    ...emailContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (booking, customer, provider) => {
  return await sendEmail({
    to: customer.email,
    template: 'bookingConfirmation',
    data: {
      customerName: customer.name,
      serviceTitle: booking.service?.title || 'Service',
      providerName: provider.name,
      bookingDate: booking.bookingDate,
      amount: booking.price
    }
  });
};

/**
 * Send booking status update email
 */
export const sendBookingUpdate = async (booking, customer, provider, status, message) => {
  return await sendEmail({
    to: customer.email,
    template: 'bookingStatusUpdate',
    data: {
      customerName: customer.name,
      status,
      message,
      serviceTitle: booking.service?.title,
      providerName: provider.name,
      bookingDate: booking.bookingDate
    }
  });
};

/**
 * Send payment receipt email
 */
export const sendPaymentReceipt = async (payment, customer) => {
  return await sendEmail({
    to: customer.email,
    template: 'paymentReceipt',
    data: {
      customerName: customer.name,
      amount: payment.amount,
      serviceTitle: payment.service?.title,
      transactionId: payment.stripePaymentIntentId
    }
  });
};

/**
 * Send new booking notification to provider
 */
export const sendNewBookingNotification = async (booking, provider, customer) => {
  return await sendEmail({
    to: provider.email,
    template: 'newBooking',
    data: {
      providerName: provider.name,
      serviceTitle: booking.service?.title,
      customerName: customer.name,
      bookingDate: booking.bookingDate,
      amount: booking.price
    }
  });
};

/**
 * Send review notification
 */
export const sendReviewNotification = async (review, provider, customer) => {
  return await sendEmail({
    to: provider.email,
    template: 'reviewReceived',
    data: {
      providerName: provider.name,
      serviceTitle: review.service?.title,
      rating: review.rating,
      comment: review.comment,
      customerName: customer.name
    }
  });
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (user, resetCode) => {
  return await sendEmail({
    to: user.email,
    template: 'passwordReset',
    data: {
      userName: user.name,
      resetCode
    }
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  return await sendEmail({
    to: user.email,
    template: 'welcome',
    data: {
      userName: user.name,
      role: user.role
    }
  });
};
