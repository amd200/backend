import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";
import stripe from "../configs/stripeConfig.js";

export const addToCart = async (req, res) => {
  const { quantity, propertyId } = req.body;
  const userId = req.user.userId;

  if (!quantity || !propertyId) {
    throw new BadRequestError("Please provide all values");
  }

  const property = await prisma.property.findUnique({
    where: {
      id: parseInt(propertyId),
    },
  });

  if (!property) {
    throw new NotFoundError(`No property found with id: ${propertyId}`);
  }

  const existingCart = await prisma.cart.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId: parseInt(propertyId),
      },
    },
  });

  let cart;

  if (existingCart) {
    cart = await prisma.cart.update({
      where: {
        id: existingCart.id,
      },
      data: {
        quantity: {
          increment: parseInt(quantity),
        },
      },
    });
  } else {
    cart = await prisma.cart.create({
      data: {
        userId,
        propertyId: parseInt(propertyId),
        quantity: parseInt(quantity),
      },
    });
  }

  res.status(StatusCodes.CREATED).json({ cart });
};

export const getCart = async (req, res) => {
  const userId = req.user.userId;
  const cart = await prisma.cart.findMany({
    where: {
      userId,
    },
  });
  res.status(StatusCodes.OK).json({ cart });
};

export const clearCart = async (req, res) => {
  const userId = req.user.userId;
  await prisma.cart.deleteMany({
    where: {
      userId,
    },
  });
  res.status(StatusCodes.OK).json({ msg: "Cart cleared" });
};

export const checkoutWithStripe = async (req, res) => {
  const userId = req.user.userId;
  const cartItems = await prisma.cart.findMany({
    where: {
      userId,
    },
    include: {
      property: true,
    },
  });

  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: "usd",
      product_data: {
        name: item.property.name,
        images: item.property.media.length > 0 ? [item.property.media[0]] : [], // Use the first media item
      },
      unit_amount: Math.round(item.property.price * 100), // Convert to cents
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `http://localhost:3000/api/v1/orders/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `http://localhost:3000/cart`,
    metadata: {
      userId: userId,
    },
  });
  res.status(StatusCodes.OK).json({ url: session.url });
};

export const handleSuccess = async (req, res) => {
  const { session_id } = req.query;
  if (!session_id) {
    throw new BadRequestError("Please provide all values");
  }

  const session = await stripe.checkout.sessions.retrieve(session_id);
  const userId = session.metadata.userId;

  const cartItems = await prisma.cart.findMany({
    where: {
      userId,
    },
    include: {
      property: true,
    },
  });

  if (!cartItems || cartItems.length === 0) {
    throw new BadRequestError("Cart is empty");
  }

  const order = await prisma.order.create({
    data: {
      userId,
      paymentId: session.payment_intent,
      orderItems: cartItems.map((item) => ({
        propertyId: item.propertyId,
        quantity: item.quantity,
        price: item.property.price,
      })),
      totalPrice: cartItems.reduce((sum, item) => sum + item.property.price * item.quantity, 0),
      status: "COMPLETED",
    },
  });

  await prisma.cart.deleteMany({ where: { userId } });
  res.redirect(`/localhost:3001/user/dashboard`);
};

export const getAllOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, name: true } } },
  });
  res.status(StatusCodes.OK).json({ orders });
};

export const deleteOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await prisma.order.findUnique({
    where: {
      id: parseInt(orderId),
    },
  });
  if (!order) {
    throw new NotFoundError(`No order found with id: ${orderId}`);
  }
  const deleteOrder = await prisma.order.delete({
    where: {
      id: parseInt(orderId),
    },
  });
  res.status(StatusCodes.OK).json({ msg: `order with id: ${orderId} deleted.` });
};
