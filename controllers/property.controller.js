import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";
import cloudinary from "../configs/cloudinaryConfig.js";
import fs from "fs";

export const createProperty = async (req, res) => {
  const userId = req.user.userId;
  const { name, description, phoneNumber, propertyType, area, roomsNumber, bathroomNumber, bedroomNumber, floorsNumber, status, finishType, price, paymentType, street, country, city, zipCode } = req.body;

  if (!name || !description || !phoneNumber || !propertyType || !area || !roomsNumber || !bathroomNumber || !floorsNumber || !status || !finishType || !price || !paymentType || !street || !country || !city || !zipCode) {
    throw new BadRequestError("Please provide all values");
  }

  let additionalFeatures = [];
  if (typeof req.body.additionalFeatures === "string") {
    try {
      additionalFeatures = JSON.parse(req.body.additionalFeatures);
    } catch (error) {
      additionalFeatures = req.body.additionalFeatures.split(",");
    }
  } else if (Array.isArray(req.body.additionalFeatures)) {
    additionalFeatures = req.body.additionalFeatures;
  }

  let amenities = [];
  if (typeof req.body.amenities === "string") {
    try {
      amenities = JSON.parse(req.body.amenities);
    } catch (error) {
      amenities = req.body.amenities.split(",");
    }
  } else if (Array.isArray(req.body.amenities)) {
    amenities = req.body.amenities;
  }

  let facilities = [];
  if (typeof req.body.facilities === "string") {
    try {
      facilities = JSON.parse(req.body.facilities);
    } catch (error) {
      facilities = req.body.facilities.split(",");
    }
  } else if (Array.isArray(req.body.facilities)) {
    facilities = req.body.facilities;
  }

  const media = [];
  if (req.files && req.files.media) {
    const files = Array.isArray(req.files.media) ? req.files.media : [req.files.media]; // Ensure we handle both single and multiple files

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: "lms-media",
        resource_type: "auto",
      });
      fs.unlinkSync(file.tempFilePath);
      media.push(result.secure_url);
    }
  }

  const property = await prisma.property.create({
    data: {
      name,
      description,
      phoneNumber,
      propertyType,
      area: parseInt(area),
      roomsNumber: parseInt(roomsNumber),
      bathroomNumber: parseInt(bathroomNumber),
      bedroomNumber: parseInt(bedroomNumber),
      floorsNumber: parseInt(floorsNumber),
      status,
      finishType,
      price: parseFloat(price),
      paymentType,
      additionalFeatures,
      userId,
      street,
      country,
      city,
      zipCode,
      facilities,
      amenities,
      media,
    },
  });

  res.status(StatusCodes.CREATED).json({ property });
};

export const getAllProperties = async (req, res) => {
  const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", name, price, averageRatings, propertyType, minPrice, maxPrice } = req.query;
  const currentPage = parseInt(page);
  const itemsPerPage = parseInt(limit);

  const filters = {};
  if (name) {
    filters.name = { contains: name, mode: "insensitive" };
  }
  if (price) {
    filters.price = parseInt(price);
  }
  if (propertyType) {
    filters.propertyType = propertyType;
  }
  if (averageRatings) {
    filters.averageRatings = parseInt(averageRatings);
  }
  if (minPrice) {
    filters.price = { ...filters.price, gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    filters.price = { ...filters.price, lte: parseFloat(maxPrice) };
  }

  const totalProperties = await prisma.property.count({
    where: filters,
  });
  const totalPages = Math.ceil(totalProperties / itemsPerPage);
  const properties = await prisma.property.findMany({
    where: filters,
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        select: {
          id: true,
          userId: true,
          rating: true,
          comment: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json({
    properties,
    metadata: {
      totalProperties,
      currentPage,
      itemsPerPage,
      totalPages,
    },
  });
};

export const getPropertyById = async (req, res) => {
  const { id: propertyId } = req.params;
  const property = await prisma.property.findUnique({
    where: {
      id: parseInt(propertyId),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: {
        select: {
          id: true,
          userId: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!property) {
    throw new NotFoundError(`No property found with id: ${propertyId}`);
  }

  res.status(StatusCodes.OK).json({ property });
};

export const updateProperty = async (req, res) => {
  const { id: propertyId } = req.params;
  const { name, description, phoneNumber, propertyType, addressId, area, roomsNumber, bathroomNumber, floorsNumber, status, finishType, price, paymentType, amenityIds, facilityIds } = req.body;

  // Check if the property exists
  const property = await prisma.property.findUnique({
    where: {
      id: parseInt(propertyId),
    },
  });

  if (!property) {
    throw new NotFoundError(`No property found with id: ${propertyId}`);
  }

  let additionalFeatures = [];
  if (typeof req.body.additionalFeatures === "string") {
    try {
      additionalFeatures = JSON.parse(req.body.additionalFeatures);
    } catch (error) {
      additionalFeatures = req.body.additionalFeatures.split(",");
    }
  } else if (Array.isArray(req.body.additionalFeatures)) {
    additionalFeatures = req.body.additionalFeatures;
  }

  // Validate address availability if updating
  if (addressId) {
    const address = await prisma.address.findUnique({
      where: {
        id: parseInt(addressId),
      },
    });
    if (!address) {
      throw new NotFoundError(`No address found with id: ${addressId}`);
    }
  }

  let parsedAmenityIds = [];
  if (amenityIds) {
    parsedAmenityIds = Array.isArray(amenityIds) ? amenityIds.map((id) => ({ id: parseInt(id) })) : JSON.parse(amenityIds).map((id) => ({ id: parseInt(id) }));
  }

  let parsedFacilityIds = [];
  if (facilityIds) {
    parsedFacilityIds = Array.isArray(facilityIds) ? facilityIds.map((id) => ({ id: parseInt(id) })) : JSON.parse(facilityIds).map((id) => ({ id: parseInt(id) }));
  }

  const media = [...property.media];
  if (req.files && req.files.media) {
    const files = Array.isArray(req.files.media) ? req.files.media : [req.files.media];

    for (const file of files) {
      const result = await cloudinary.uploader.upload(file.tempFilePath, {
        use_filename: true,
        folder: "lms-media",
        resource_type: "auto",
      });
      fs.unlinkSync(file.tempFilePath);
      media.push(result.secure_url);
    }
  }

  const updatedProperty = await prisma.property.update({
    where: {
      id: parseInt(propertyId),
    },
    data: {
      name: name || undefined,
      description: description || undefined,
      phoneNumber: phoneNumber || undefined,
      propertyType: propertyType || undefined,
      address: addressId
        ? {
            connect: { id: parseInt(addressId) },
          }
        : undefined,
      area: area ? parseInt(area) : undefined,
      roomsNumber: roomsNumber ? parseInt(roomsNumber) : undefined,
      bathroomNumber: bathroomNumber ? parseInt(bathroomNumber) : undefined,
      floorsNumber: floorsNumber ? parseInt(floorsNumber) : undefined,
      status: status || undefined,
      finishType: finishType || undefined,
      price: price ? parseFloat(price) : undefined,
      paymentType: paymentType || undefined,
      additionalFeatures: additionalFeatures.length > 0 ? additionalFeatures : undefined,
      media: media.length > 0 ? media : undefined,
      amenities:
        parsedAmenityIds.length > 0
          ? {
              set: parsedAmenityIds,
            }
          : undefined,
      facilities:
        parsedFacilityIds.length > 0
          ? {
              set: parsedFacilityIds,
            }
          : undefined,
    },
  });

  res.status(StatusCodes.OK).json({ property: updatedProperty });
};

export const deleteProperty = async (req, res) => {
  const { id: propertyId } = req.params;
  const property = await prisma.property.findUnique({
    where: {
      id: parseInt(propertyId),
    },
  });
  if (!property) {
    throw new NotFoundError(`No property found with id: ${propertyId}`);
  }
  const deleteProperty = await prisma.property.delete({
    where: {
      id: parseInt(propertyId),
    },
  });
  res.status(StatusCodes.OK).json({ msg: `Property with id: ${propertyId} deleted.` });
};
