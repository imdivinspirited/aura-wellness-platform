/**
 * Cart Routes
 *
 * Cart management endpoints.
 */

import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Cart, ICartItem } from '../models/Cart';
import { authenticate, AuthRequest, requireAuth } from '../middleware/auth';

export const cartsRouter = Router();

/**
 * GET /api/v1/carts
 * Get user's cart
 */
cartsRouter.get('/', authenticate, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const identifier = req.userId || req.anonymousId;
    if (!identifier) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const cart = await Cart.findOne(
      req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
    );

    if (!cart) {
      // Create empty cart
      const newCart = new Cart({
        userId: req.userId,
        anonymousId: req.anonymousId,
        items: [],
      });
      await newCart.save();
      return res.json({
        success: true,
        data: { cart: newCart },
      });
    }

    res.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get cart' },
    });
  }
});

/**
 * POST /api/v1/carts/items
 * Add item to cart
 */
cartsRouter.post(
  '/items',
  authenticate,
  requireAuth,
  [
    body('itemId').notEmpty(),
    body('itemType').isIn(['program', 'service', 'pass', 'course', 'facility', 'booking', 'application', 'retreat']),
    body('title').notEmpty(),
    body('quantity').optional().isInt({ min: 1 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      let cart = await Cart.findOne(
        req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
      );

      if (!cart) {
        cart = new Cart({
          userId: req.userId,
          anonymousId: req.anonymousId,
          items: [],
        });
      }

      const { itemId, itemType, title, subtitle, thumbnail, price, quantity = 1, metadata, registrationUrl } = req.body;

      // Check if item already exists
      const existingIndex = cart.items.findIndex(
        (item) => item.itemId === itemId && item.itemType === itemType
      );

      if (existingIndex >= 0) {
        // Update quantity
        cart.items[existingIndex].quantity += quantity;
      } else {
        // Add new item
        const newItem: ICartItem = {
          itemId,
          itemType,
          title,
          subtitle,
          thumbnail,
          price,
          quantity,
          metadata,
          addedAt: new Date(),
          registrationUrl,
        };
        cart.items.push(newItem);
      }

      await cart.save();

      res.json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to add item to cart' },
      });
    }
  }
);

/**
 * DELETE /api/v1/carts/items/:itemId
 * Remove item from cart
 */
cartsRouter.delete(
  '/items/:itemId',
  authenticate,
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const cart = await Cart.findOne(
        req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
      );

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: { message: 'Cart not found' },
        });
      }

      cart.items = cart.items.filter((item) => item.itemId !== req.params.itemId);
      await cart.save();

      res.json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to remove item from cart' },
      });
    }
  }
);

/**
 * PUT /api/v1/carts/items/:itemId
 * Update item quantity
 */
cartsRouter.put(
  '/items/:itemId',
  authenticate,
  requireAuth,
  [
    body('quantity').isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const identifier = req.userId || req.anonymousId;
      if (!identifier) {
        return res.status(401).json({
          success: false,
          error: { message: 'Not authenticated' },
        });
      }

      const cart = await Cart.findOne(
        req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
      );

      if (!cart) {
        return res.status(404).json({
          success: false,
          error: { message: 'Cart not found' },
        });
      }

      const { quantity } = req.body;

      if (quantity === 0) {
        // Remove item
        cart.items = cart.items.filter((item) => item.itemId !== req.params.itemId);
      } else {
        // Update quantity
        const item = cart.items.find((item) => item.itemId === req.params.itemId);
        if (item) {
          item.quantity = quantity;
        } else {
          return res.status(404).json({
            success: false,
            error: { message: 'Item not found in cart' },
          });
        }
      }

      await cart.save();

      res.json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update cart' },
      });
    }
  }
);

/**
 * DELETE /api/v1/carts
 * Clear cart
 */
cartsRouter.delete('/', authenticate, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const identifier = req.userId || req.anonymousId;
    if (!identifier) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const cart = await Cart.findOne(
      req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId }
    );

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: { message: 'Cart not found' },
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to clear cart' },
    });
  }
});

/**
 * POST /api/v1/carts/merge
 * Merge anonymous cart with user cart after login
 */
cartsRouter.post(
  '/merge',
  authenticate,
  requireUser,
  [
    body('anonymousId').notEmpty(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Validation failed', errors: errors.array() },
        });
      }

      const { anonymousId } = req.body;

      // Get both carts
      const userCart = await Cart.findOne({ userId: req.userId });
      const anonymousCart = await Cart.findOne({ anonymousId });

      if (!anonymousCart || anonymousCart.items.length === 0) {
        return res.json({
          success: true,
          data: { cart: userCart || new Cart({ userId: req.userId, items: [] }) },
        });
      }

      if (!userCart) {
        // Move anonymous cart to user
        anonymousCart.userId = req.userId;
        anonymousCart.anonymousId = undefined;
        await anonymousCart.save();
        return res.json({
          success: true,
          data: { cart: anonymousCart },
        });
      }

      // Merge items
      anonymousCart.items.forEach((anonItem) => {
        const existingIndex = userCart.items.findIndex(
          (item) => item.itemId === anonItem.itemId && item.itemType === anonItem.itemType
        );

        if (existingIndex >= 0) {
          userCart.items[existingIndex].quantity += anonItem.quantity;
        } else {
          userCart.items.push(anonItem);
        }
      });

      await userCart.save();
      await Cart.deleteOne({ _id: anonymousCart._id });

      res.json({
        success: true,
        data: { cart: userCart },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Failed to merge carts' },
      });
    }
  }
);
