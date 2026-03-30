import express from 'express';
import Favorite from './favorite.model.js';
import { protect } from '../../shared/middleware/auth.middleware.js';
import { asyncHandler } from '../../shared/middleware/error.middleware.js';

const router = express.Router();
router.use(protect);

// Get my favorites
router.get('/', asyncHandler(async (req, res) => {
  const { collection } = req.query;
  const favorites = await Favorite.getUserFavorites(req.user.id, collection);
  
  res.json({
    success: true,
    count: favorites.length,
    data: favorites
  });
}));

// Get collections
router.get('/collections', asyncHandler(async (req, res) => {
  const collections = await Favorite.getCollections(req.user.id);
  
  res.json({
    success: true,
    data: collections
  });
}));

// Add to favorites
router.post('/', asyncHandler(async (req, res) => {
  const { service, collection, note } = req.body;
  
  const favorite = await Favorite.addToFavorites(
    req.user.id,
    service,
    collection || 'default'
  );
  
  res.status(201).json({
    success: true,
    message: 'Added to favorites',
    data: favorite
  });
}));

// Remove from favorites
router.delete('/:id', asyncHandler(async (req, res) => {
  await Favorite.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Removed from favorites'
  });
}));

// Update favorite
router.patch('/:id', asyncHandler(async (req, res) => {
  const { collection, note } = req.body;
  
  const favorite = await Favorite.findByIdAndUpdate(
    req.params.id,
    { collection, note },
    { new: true }
  );
  
  res.json({
    success: true,
    data: favorite
  });
}));

export default router;
