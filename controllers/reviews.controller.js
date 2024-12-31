import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/bad-request.js';
import NotFoundError from '../errors/not-found.js';

export const createReview = async (req, res) => {
  const { rating, comment, propertyId } = req.body;
  const userId = req.user.userId;
  if (!rating || !comment || !propertyId) {
    throw new BadRequestError('Please provide all values');
  }

  if (rating < 1 || rating > 5) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }

  const property = await prisma.property.findUnique({
    where: {
      id: parseInt(propertyId),
    },
  });
  if (!property) {
    throw new NotFoundError(`No property found with id: ${propertyId}`);
  }

  // check if the user has already reviewed the product
  const userReview = await prisma.review.findFirst({
    where: {
      propertyId: parseInt(propertyId),
      userId,
    },
  });
  if (userReview) {
    throw new BadRequestError(
      'You have already reviewed this product. You can only review a product once.'
    );
  }

  const review = await prisma.review.create({
    data: {
      rating: parseInt(rating),
      comment,
      userId,
      propertyId: parseInt(propertyId),
    },
  });

  // update numberOfReviews and AverageRating for property
  const reviews = await prisma.review.findMany({
    where: {
      propertyId: parseInt(propertyId),
    },
    select: {
      rating: true,
    },
  });

  const numberOfReviews = reviews.length;
  const averageRatings =
    reviews.reduce((total, review) => total + review.rating, 0) /
    numberOfReviews;

  await prisma.property.update({
    where: {
      id: parseInt(propertyId),
    },
    data: {
      numberOfReviews,
      averageRatings: Math.round(averageRatings),
    },
  });
  res.status(StatusCodes.CREATED).json({ review });
};

export const getAllReviews = async (req, res) => {
  const reviews = await prisma.review.findMany();
  res.status(StatusCodes.OK).json({ reviews });
};

export const getReviewById = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await prisma.review.findUnique({
    where: {
      id: parseInt(reviewId),
    },
  });
  if (!review) {
    throw new NotFoundError(`No review found with id: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ review });
};

export const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, comment } = req.body;
  const review = await prisma.review.findUnique({
    where: {
      id: parseInt(reviewId),
    },
  });
  if (!review) {
    throw new NotFoundError(`No review found with id: ${reviewId}`);
  }
  const updateReview = await prisma.review.update({
    where: {
      id: parseInt(reviewId),
    },
    data: {
      rating: parseInt(rating),
      comment,
    },
  });

  // update numberOfReviews and AverageRating for property
  const property = await prisma.property.findUnique({
    where: {
      id: review.propertyId,
    },
  });

  const reviews = await prisma.review.findMany({
    where: {
      propertyId: property.id,
    },
    select: {
      rating: true,
    },
  });

  const numberOfReviews = reviews.length;
  const averageRatings =
    reviews.reduce((total, review) => total + review.rating, 0) /
    numberOfReviews;

  await prisma.property.update({
    where: {
      id: property.id,
    },
    data: {
      numberOfReviews,
      averageRatings: Math.round(averageRatings),
    },
  });
  res.status(StatusCodes.OK).json({ updateReview });
};

export const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await prisma.review.findUnique({
    where: {
      id: parseInt(reviewId),
    },
  });
  if (!review) {
    throw new NotFoundError(`No review found with id: ${reviewId}`);
  }
  const deleteReview = await prisma.review.delete({
    where: {
      id: parseInt(reviewId),
    },
  });

  // update numberOfReviews and AverageRating for property
  const property = await prisma.property.findUnique({
    where: {
      id: review.propertyId,
    },
  });

  const reviews = await prisma.review.findMany({
    where: {
      propertyId: property.id,
    },
    select: {
      rating: true,
    },
  });

  const numberOfReviews = reviews.length;
  const averageRatings =
    reviews.reduce((total, review) => total + review.rating, 0) /
    numberOfReviews;

  await prisma.property.update({
    where: {
      id: property.id,
    },
    data: {
      numberOfReviews,
      averageRatings: Math.round(averageRatings),
    },
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: `Review with id: ${reviewId} deleted.` });
};
