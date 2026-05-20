import { Router, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authenticate, AuthRequest, requireAuth } from '../middleware/auth';
import { Shop } from '../models/Shop';
import { Product } from '../models/Product';
import { Cart } from '../models/Cart';
import { Order } from '../models/Order';
import { Counter } from '../models/Counter';

export const marketplaceRouter = Router();

function validate(req: AuthRequest, res: Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, error: { message: 'Validation failed', errors: errors.array() } });
    return false;
  }
  return true;
}

/**
 * GET /api/v1/marketplace/shops
 */
marketplaceRouter.get('/shops', async (_req, res) => {
  const shops = await Shop.find({ status: 'active' }).sort({ name: 1 }).lean();
  res.json({ success: true, data: { shops } });
  return;
});

/**
 * GET /api/v1/marketplace/shops/:slug
 */
marketplaceRouter.get(
  '/shops/:slug',
  [param('slug').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const shop = await Shop.findOne({ slug: req.params.slug.toLowerCase(), status: 'active' }).lean();
    if (!shop) {
      res.status(404).json({ success: false, error: { message: 'Shop not found' } });
      return;
    }
    res.json({ success: true, data: { shop } });
    return;
  }
);

/**
 * GET /api/v1/marketplace/products?shopSlug=&q=&tag=
 */
marketplaceRouter.get(
  '/products',
  [query('shopSlug').optional().isString().trim(), query('q').optional().isString().trim(), query('tag').optional().isString().trim()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const shopSlug = String(req.query.shopSlug || '').trim().toLowerCase();
    const q = String(req.query.q || '').trim();
    const tag = String(req.query.tag || '').trim();

    let shopId: mongoose.Types.ObjectId | undefined;
    if (shopSlug) {
      const shop = await Shop.findOne({ slug: shopSlug, status: 'active' }).select('_id').lean();
      if (!shop) {
        res.json({ success: true, data: { products: [] } });
        return;
      }
      shopId = shop._id as any;
    }

    const filter: any = { isPublished: true };
    if (shopId) filter.shopId = shopId;
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (tag) filter.tags = tag;

    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ success: true, data: { products } });
    return;
  }
);

/**
 * GET /api/v1/marketplace/products/:shopSlug/:slug
 */
marketplaceRouter.get(
  '/products/:shopSlug/:slug',
  [param('shopSlug').isString().trim().notEmpty(), param('slug').isString().trim().notEmpty()],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;
    const shop = await Shop.findOne({ slug: req.params.shopSlug.toLowerCase(), status: 'active' }).select('_id').lean();
    if (!shop) {
      res.status(404).json({ success: false, error: { message: 'Shop not found' } });
      return;
    }
    const product = await Product.findOne({ shopId: shop._id, slug: req.params.slug.toLowerCase(), isPublished: true }).lean();
    if (!product) {
      res.status(404).json({ success: false, error: { message: 'Product not found' } });
      return;
    }
    res.json({ success: true, data: { product } });
    return;
  }
);

async function nextOrderNumber(): Promise<string> {
  const key = `order:${new Date().getFullYear()}`;
  const counter = await Counter.findOneAndUpdate({ key }, { $inc: { value: 1 } }, { new: true, upsert: true });
  const n = counter.value;
  return `ORD-${new Date().getFullYear()}-${String(n).padStart(6, '0')}`;
}

/**
 * POST /api/v1/marketplace/checkout
 * Creates an Order from cart product items.
 */
marketplaceRouter.post(
  '/checkout',
  authenticate,
  requireAuth,
  [
    body('shippingAddress.fullName').isString().trim().notEmpty(),
    body('shippingAddress.email').optional().isEmail(),
    body('shippingAddress.phone').optional().isString().trim(),
    body('shippingAddress.addressLine1').isString().trim().notEmpty(),
    body('shippingAddress.addressLine2').optional().isString().trim(),
    body('shippingAddress.city').isString().trim().notEmpty(),
    body('shippingAddress.state').isString().trim().notEmpty(),
    body('shippingAddress.country').isString().trim().notEmpty(),
    body('shippingAddress.postalCode').isString().trim().notEmpty(),
    body('promoCode').optional().isString().trim(),
    body('paymentProvider').optional().isIn(['razorpay', 'stripe', 'paypal', 'manual']),
  ],
  async (req: AuthRequest, res: Response) => {
    if (!validate(req, res)) return;

    const cart = await Cart.findOne(req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, error: { message: 'Cart is empty' } });
      return;
    }

    const productItems = cart.items.filter((i) => i.itemType === 'product');
    if (productItems.length === 0) {
      res.status(400).json({ success: false, error: { message: 'No marketplace products in cart' } });
      return;
    }

    // Fetch products, validate stock, compute totals.
    const productIds = productItems.map((i) => i.itemId);
    const products = await Product.find({ _id: { $in: productIds }, isPublished: true }).lean();
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const orderItems: any[] = [];
    let subtotalCents = 0;
    let currency = 'INR';

    for (const ci of productItems) {
      const p = byId.get(ci.itemId);
      if (!p) {
        res.status(400).json({ success: false, error: { message: `Product not found: ${ci.itemId}` } });
        return;
      }
      if (p.stock < ci.quantity) {
        res.status(400).json({ success: false, error: { message: `Insufficient stock for ${p.name}` } });
        return;
      }
      currency = p.currency || currency;
      const line = p.priceCents * ci.quantity;
      subtotalCents += line;
      orderItems.push({
        shopId: p.shopId,
        productId: p._id,
        name: p.name,
        unitPriceCents: p.priceCents,
        quantity: ci.quantity,
        currency: p.currency || 'INR',
        imageUrl: p.images?.[0],
      });
    }

    const shippingCents = 0;
    const discountCents = 0;
    const totalCents = subtotalCents - discountCents + shippingCents;

    const orderNumber = await nextOrderNumber();
    const provider = (req.body.paymentProvider as any) || 'manual';

    const created = await Order.create({
      userId: req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined,
      anonymousId: req.userId ? undefined : req.anonymousId,
      orderNumber,
      status: 'pending',
      items: orderItems,
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      currency,
      promoCode: req.body.promoCode || undefined,
      shippingAddress: req.body.shippingAddress,
      payments: [
        {
          provider,
          status: 'created',
          amountCents: totalCents,
          currency,
          raw: { providerRequested: provider },
          createdAt: new Date(),
        },
      ],
      statusHistory: [{ status: 'pending', at: new Date(), note: 'Order created' }],
    });

    // Decrement stock (best-effort; for real systems use transactions).
    await Promise.all(
      productItems.map(async (ci) => {
        await Product.updateOne({ _id: ci.itemId, stock: { $gte: ci.quantity } }, { $inc: { stock: -ci.quantity } });
      })
    );

    // Remove only product items from cart (leave other items intact).
    cart.items = cart.items.filter((i) => i.itemType !== 'product');
    await cart.save();

    res.status(201).json({ success: true, data: { order: created } });
    return;
  }
);

/**
 * GET /api/v1/marketplace/orders (my orders)
 */
marketplaceRouter.get('/orders', authenticate, requireAuth, async (req: AuthRequest, res: Response) => {
  const filter = req.userId ? { userId: req.userId } : { anonymousId: req.anonymousId };
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50).lean();
  res.json({ success: true, data: { orders } });
  return;
});

