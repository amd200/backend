import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";

export const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      bio: true,
      profilePicture: true,
      isEmailVerified: true,
      role: true,
      reviews: true,
      properties: { select: { id: true, name: true } },
      cart: true,
      orders: true,
      requests: true,
    },
  });
  res.status(StatusCodes.OK).json({ users });
};

export const getUserById = async (req, res) => {
  const { id: userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      bio: true,
      profilePicture: true,
      isEmailVerified: true,
      role: true,
      reviews: true,
      properties: { select: { id: true, name: true } },
      cart: true,
      orders: true,
      requests: true,
    },
  });
  if (!user) {
    throw new NotFoundError(`No user found with id: ${id}`);
  }
  res.status(StatusCodes.OK).json({ user });
};

export const updateUser = async (req, res) => {
  const { id: userId } = req.params;
  const { name, email, phoneNumber, bio } = req.body;
  const findUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!findUser) {
    throw new NotFoundError(`No user found with id: ${id}`);
  }
  let profilePicture = findUser.profilePicture;

  if (req.files && req.files.profilePicture) {
    const result = await cloudinary.uploader.upload(req.files.profilePicture.tempFilePath, {
      use_filename: true,
      folder: "lms-images",
    });
    fs.unlinkSync(req.files.profilePicture.tempFilePath);
    profilePicture = result.secure_url;
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      name,
      email,
      phoneNumber,
      bio,
      profilePicture,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      bio: true,
      profilePicture: true,
      isEmailVerified: true,
      role: true,
      reviews: true,
      cart: true,
      orders: true,
    },
  });
  res.status(StatusCodes.OK).json({ user });
};

export const deleteUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  res.status(StatusCodes.OK).json({ msg: `User with id: ${userId} deleted.` });
};

export const getUserOrders = async (req, res) => {
  const { id: userId } = req.params;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!orders) {
    throw new NotFoundError(`No orders found with this userId ${userId}`);
  }
  res.status(StatusCodes.OK).json({ orders });
};
