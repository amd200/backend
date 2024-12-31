import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();

// Rest of packages
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';

// Middlewares
import notFoundMiddleware from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';

// SwaggerUI Docs
import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';
const swaggerDocument = yaml.load('./swagger.yaml');

// Routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
import reviewsRouter from './routes/review.routes.js';
import orderRouter from './routes/order.routes.js';
import requestRouter from './routes/request.tour.routes.js';

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3001', // Frontend URL
    credentials: true, // Allow cookies
  })
);
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(cookieParser(process.env.JWT_SECRET));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp',
  })
);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/property', propertyRouter);
app.use('/api/v1/review', reviewsRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/request', requestRouter);

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get('/', (req, res) => {
  res.send(
    '<h1>RealEstate API</h1><p>Documentation <a href="/api-docs">here</a></p>'
  );
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
};

startServer();
