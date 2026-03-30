import express from 'express';
import Dispute from './dispute.model.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { restrictTo } from '../../shared/middleware/role.middleware.js';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';

const router = express.Router();
router.use(protect);

// Create dispute
router.post('/', asyncHandler(async (req, res) => {
  const { booking, service, reason, description, evidence } = req.body;
  
  const dispute = await Dispute.createDispute({
    booking,
    service,
    raisedBy: req.user.id,
    against: req.body.against,
    reason,
    description,
    evidence
  });
  
  res.status(201).json({
    success: true,
    message: 'Dispute created successfully',
    data: dispute
  });
}));

// Get my disputes
router.get('/my-disputes', asyncHandler(async (req, res) => {
  const disputes = await Dispute.getUserDisputes(
    req.user.id,
    req.user.role
  );
  
  res.json({
    success: true,
    count: disputes.length,
    data: disputes
  });
}));

// Get dispute by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('booking', 'bookingDate status')
    .populate('service', 'title')
    .populate('raisedBy', 'name email')
    .populate('against', 'name email');
  
  // Authorization check
  if (dispute.raisedBy._id.toString() !== req.user.id &&
      dispute.against._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }
  
  res.json({
    success: true,
    data: dispute
  });
}));

// Add message to dispute
router.post('/:id/message', asyncHandler(async (req, res) => {
  const { message } = req.body;
  
  const dispute = await Dispute.findById(req.params.id);
  await dispute.addMessage(req.user.id, message);
  
  res.json({
    success: true,
    message: 'Message added'
  });
}));

// Update dispute status (Admin/Provider)
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const dispute = await Dispute.findById(req.params.id);
  await dispute.updateStatus(status, req.user.role === 'admin' ? req.user.id : null);
  
  res.json({
    success: true,
    data: dispute
  });
}));

// Resolve dispute (Admin only)
router.patch('/:id/resolve', restrictTo('admin'), asyncHandler(async (req, res) => {
  const { resolution, outcome, refundAmount } = req.body;
  
  const dispute = await Dispute.findById(req.params.id);
  await dispute.resolve(resolution, outcome, refundAmount, req.user.id);
  
  res.json({
    success: true,
    message: 'Dispute resolved',
    data: dispute
  });
}));

// Admin: Get all disputes
router.get('/', restrictTo('admin'), asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  
  const filter = {};
  if (status) filter.status = status;
  
  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('booking service raisedBy against'),
    Dispute.countDocuments(filter)
  ]);
  
  res.json({
    success: true,
    data: disputes,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }
  });
}));

export default router;
