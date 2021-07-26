import http from 'http';
import express from 'express';
import cors from 'cors';
import logging from './config/logging';
import config from './config/config';
import userRoutes from './routes/user';
import mongoose from 'mongoose';

const NAMESPACE = 'Server';
const router = express();

mongoose
  .connect(config.mongo.url, config.mongo.options)
  .then(() => {
    logging.info(NAMESPACE, 'Mongo Connected');
  })
  .catch((error) => {
    logging.error(NAMESPACE, error.message, error);
  });

router.use((req, res, next) => {
  logging.info(
    NAMESPACE,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
  );

  res.on('finish', () => {
    logging.info(
      NAMESPACE,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`,
    );
  });

  next();
});

router.use(express.json());
router.use(cors({ origin: 'http://localhost:3000', credentials: true }));

router.use('/users', userRoutes);

router.use((req, res) => {
  const error = new Error('Not found');

  res.status(404).json({
    message: error.message,
  });
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () =>
  logging.info(
    NAMESPACE,
    `Server is running ${config.server.hostname}:${config.server.port}`,
  ),
);
