import { PrismaClient } from "@prisma/client";
let prisma = new PrismaClient();
import { StatusCodes } from "http-status-codes";
import BadRequestError from "../errors/bad-request.js";
import NotFoundError from "../errors/not-found.js";
import { sendEmail } from "../configs/sendgridConfig.js";

export const requestTour = async (req, res) => {
  const { name, email, phoneNumber, leaseType, fromDate, toDate, message } = req.body;
  if (!name || !email || !phoneNumber || !leaseType || !fromDate || !toDate || !message) {
    throw new BadRequestError("Please provide all required fields");
  }

  const requestNewTour = await prisma.request.create({
    data: {
      name,
      email,
      phoneNumber,
      leaseType,
      userId: req.user.userId,
      fromDate: new Date(fromDate).toISOString(),
      toDate: new Date(toDate).toISOString(),
      message,
    },
  });
  const emailSubject = "You requested a new tour!";
  const emailBody = `
  <div style="font-family: Arial, sans-serif; color: #333333; background-color: #f4f4f9; padding: 20px; border-radius: 8px;">
    <h2 style="color: #f8b32e;">Hi ${req.user.name},</h2>
    <p style="font-size: 16px;">Thank you for requesting a new tour! We are excited to help you explore your options. Here are the details of your request:</p>
    
    <h3 style="color: #5570f1;">Tour Details:</h3>
    <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <p style="font-size: 16px; margin: 5px 0;">🗓️ <strong>Lease Type:</strong> ${requestNewTour.leaseType}</p>
      <p style="font-size: 16px; margin: 5px 0;">📅 <strong>From:</strong> ${requestNewTour.fromDate}</p>
      <p style="font-size: 16px; margin: 5px 0;">📅 <strong>To:</strong> ${requestNewTour.toDate}</p>
    </div>
    
    <p style="font-size: 16px;">If you have any questions or need further assistance, feel free to reach out!</p>
    
    <p style="font-size: 16px;">Best regards, <br> The Unidorm Team</p>
  </div>
`;

  await sendEmail(requestNewTour.email, emailSubject, emailBody);
  res.status(StatusCodes.CREATED).json({ requestNewTour });
};

export const getAllRequests = async (req, res) => {
  const requests = await prisma.request.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  res.status(StatusCodes.OK).json({ requests });
};

export const getRequestById = async (req, res) => {
  const { id: requestId } = req.params;

  const request = await prisma.request.findUnique({
    where: { id: parseInt(requestId, 10) },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!request) {
    throw new NotFoundError(`No requests found with this id ${requestId}`);
  }
};
