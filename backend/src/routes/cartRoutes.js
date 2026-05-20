/**
 * Cart API — native MongoDB driver (matches Mongoose Cart model / carts collection).
 * The TS routes in carts.ts are not mounted by server.js; this file is the live implementation.
 */
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { getDb } from '../db.js';
import { respondIfMongoOrDbUnavailable } from '../lib/serviceUnavailableMongo.js';

const router = Router();
const COL = 'carts';

const ITEM_TYPES = new Set([
  'program',
  'service',
  'pass',
  'course',
  'facility',
  'booking',
  'application',
  'retreat',
  'product',
]);

function cartIdentity(req) {
  const userId = req.user?.id ? String(req.user.id) : null;
  const anonymousId = (req.headers['x-anonymous-id'] || '').toString().trim() || null;
  return { userId, anonymousId };
}

function requireUserOrAnon(req, res) {
  const { userId, anonymousId } = cartIdentity(req);
  if (!userId && !anonymousId) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required' },
    });
    return null;
  }
  return { userId, anonymousId };
}

function queryFor({ userId, anonymousId }) {
  return userId ? { userId } : { anonymousId };
}

/** Shape expected by src/lib/api/cart.ts CartResponse */
function jsonCart(doc) {
  if (!doc) return null;
  const cart = {
    _id: String(doc._id),
    userId: doc.userId,
    anonymousId: doc.anonymousId,
    items: Array.isArray(doc.items) ? doc.items : [],
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt,
  };
  return cart;
}

router.get('/', authenticate, async (req, res) => {
  const id = requireUserOrAnon(req, res);
  if (!id) return;
  try {
    const db = getDb();
    const col = db.collection(COL);
    let cart = await col.findOne(queryFor(id));
    const now = new Date();
    if (!cart) {
      const doc = {
        userId: id.userId || undefined,
        anonymousId: !id.userId ? id.anonymousId : undefined,
        items: [],
        createdAt: now,
        updatedAt: now,
      };
      const ins = await col.insertOne(doc);
      cart = await col.findOne({ _id: ins.insertedId });
    }
    return res.json({
      success: true,
      data: { cart: jsonCart(cart) },
    });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[carts GET]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get cart' },
    });
  }
});

router.post('/items', authenticate, async (req, res) => {
    const id = requireUserOrAnon(req, res);
    if (!id) return;
    const { itemId, itemType, title } = req.body || {};
    if (!itemId || typeof itemId !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'itemId is required' } });
    }
    if (!itemType || !ITEM_TYPES.has(itemType)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid itemType' } });
    }
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ success: false, error: { message: 'title is required' } });
    }
    const qRaw = req.body?.quantity;
    if (qRaw != null) {
      const qn = Number(qRaw);
      if (!Number.isFinite(qn) || qn < 1) {
        return res.status(400).json({ success: false, error: { message: 'quantity must be a positive number' } });
      }
    }
    try {
      const db = getDb();
      const col = db.collection(COL);
      let cart = await col.findOne(queryFor(id));
      const now = new Date();
      if (!cart) {
        const ins = await col.insertOne({
          userId: id.userId || undefined,
          anonymousId: !id.userId ? id.anonymousId : undefined,
          items: [],
          createdAt: now,
          updatedAt: now,
        });
        cart = await col.findOne({ _id: ins.insertedId });
      }

      const b = req.body || {};
      const subtitle = b.subtitle;
      const thumbnail = b.thumbnail;
      const price = b.price;
      const quantity = b.quantity != null ? Number(b.quantity) : 1;
      const metadata = b.metadata;
      const registrationUrl = b.registrationUrl;

      const items = Array.isArray(cart.items) ? [...cart.items] : [];
      const existingIndex = items.findIndex((item) => item.itemId === itemId && item.itemType === itemType);
      if (existingIndex >= 0) {
        items[existingIndex].quantity = (items[existingIndex].quantity || 0) + quantity;
      } else {
        items.push({
          itemId,
          itemType,
          title,
          subtitle,
          thumbnail,
          price,
          quantity: quantity || 1,
          metadata,
          addedAt: new Date(),
          registrationUrl,
        });
      }

      await col.updateOne(
        { _id: cart._id },
        { $set: { items, updatedAt: new Date() } }
      );
      cart = await col.findOne({ _id: cart._id });
      return res.json({ success: true, data: { cart: jsonCart(cart) } });
    } catch (err) {
      if (respondIfMongoOrDbUnavailable(res, err)) return;
      console.error('[carts POST items]', err);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to add item to cart' },
      });
    }
});

router.delete('/items/:itemId', authenticate, async (req, res) => {
  const id = requireUserOrAnon(req, res);
  if (!id) return;
  const itemId = (req.params.itemId || '').trim();
  if (!itemId) {
    return res.status(400).json({ success: false, error: { message: 'itemId required' } });
  }
  try {
    const db = getDb();
    const col = db.collection(COL);
    const cart = await col.findOne(queryFor(id));
    if (!cart) {
      return res.status(404).json({ success: false, error: { message: 'Cart not found' } });
    }
    const items = (Array.isArray(cart.items) ? cart.items : []).filter((item) => item.itemId !== itemId);
    await col.updateOne({ _id: cart._id }, { $set: { items, updatedAt: new Date() } });
    const next = await col.findOne({ _id: cart._id });
    return res.json({ success: true, data: { cart: jsonCart(next) } });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[carts DELETE item]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to remove item from cart' },
    });
  }
});

router.put('/items/:itemId', authenticate, async (req, res) => {
  const id = requireUserOrAnon(req, res);
  if (!id) return;
  const itemId = (req.params.itemId || '').trim();
  const quantity = Number(req.body?.quantity);
  if (!Number.isFinite(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
    return res.status(400).json({
      success: false,
      error: { message: 'quantity must be a non-negative integer' },
    });
  }
  try {
    const db = getDb();
    const col = db.collection(COL);
    const cart = await col.findOne(queryFor(id));
    if (!cart) {
      return res.status(404).json({ success: false, error: { message: 'Cart not found' } });
    }
    let items = Array.isArray(cart.items) ? [...cart.items] : [];
    if (quantity === 0) {
      items = items.filter((item) => item.itemId !== itemId);
    } else {
      const item = items.find((i) => i.itemId === itemId);
      if (!item) {
        return res.status(404).json({ success: false, error: { message: 'Item not found in cart' } });
      }
      item.quantity = quantity;
    }
    await col.updateOne({ _id: cart._id }, { $set: { items, updatedAt: new Date() } });
    const next = await col.findOne({ _id: cart._id });
    return res.json({ success: true, data: { cart: jsonCart(next) } });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[carts PUT item]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update cart' },
    });
  }
});

router.delete('/', authenticate, async (req, res) => {
  const id = requireUserOrAnon(req, res);
  if (!id) return;
  try {
    const db = getDb();
    const col = db.collection(COL);
    const cart = await col.findOne(queryFor(id));
    if (!cart) {
      return res.status(404).json({ success: false, error: { message: 'Cart not found' } });
    }
    await col.updateOne({ _id: cart._id }, { $set: { items: [], updatedAt: new Date() } });
    const next = await col.findOne({ _id: cart._id });
    return res.json({ success: true, data: { cart: jsonCart(next) } });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[carts DELETE]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to clear cart' },
    });
  }
});

router.post('/merge', authenticate, async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Login required to merge cart.' },
    });
  }
  const userId = String(req.user.id);
  const anonymousId = (req.body?.anonymousId || '').toString().trim();
  if (!anonymousId) {
    return res.status(400).json({
      success: false,
      error: { message: 'anonymousId is required' },
    });
  }
  try {
    const db = getDb();
    const col = db.collection(COL);
    const userCart = await col.findOne({ userId });
    const anonymousCart = await col.findOne({ anonymousId });

    if (!anonymousCart || !Array.isArray(anonymousCart.items) || anonymousCart.items.length === 0) {
      let cart = userCart;
      if (!cart) {
        const now = new Date();
        const ins = await col.insertOne({
          userId,
          items: [],
          createdAt: now,
          updatedAt: now,
        });
        cart = await col.findOne({ _id: ins.insertedId });
      }
      return res.json({
        success: true,
        data: { cart: jsonCart(cart), merged: true },
      });
    }

    if (!userCart) {
      await col.updateOne(
        { _id: anonymousCart._id },
        { $set: { userId, updatedAt: new Date() }, $unset: { anonymousId: '' } }
      );
      const moved = await col.findOne({ _id: anonymousCart._id });
      return res.json({
        success: true,
        data: { cart: jsonCart(moved), merged: true },
      });
    }

    const mergedItems = [...(userCart.items || [])];
    for (const anonItem of anonymousCart.items || []) {
      const idx = mergedItems.findIndex(
        (item) => item.itemId === anonItem.itemId && item.itemType === anonItem.itemType
      );
      if (idx >= 0) {
        mergedItems[idx].quantity = (mergedItems[idx].quantity || 0) + (anonItem.quantity || 0);
      } else {
        mergedItems.push(anonItem);
      }
    }
    await col.updateOne(
      { _id: userCart._id },
      { $set: { items: mergedItems, updatedAt: new Date() } }
    );
    await col.deleteOne({ _id: anonymousCart._id });
    const final = await col.findOne({ _id: userCart._id });
    return res.json({
      success: true,
      data: { cart: jsonCart(final), merged: true },
    });
  } catch (err) {
    if (respondIfMongoOrDbUnavailable(res, err)) return;
    console.error('[carts merge]', err);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to merge carts' },
    });
  }
});

export default router;
