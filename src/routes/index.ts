import express from 'express';
// import logger from '../utils/logger';
import { healthCheck } from '../handlers/healthcheck';
import { data } from '../data/todos';

const router = express.Router();

/* GET home page. */
router.get('/', healthCheck);
router.get('/api/categories', (_, res) => {
  res.send(data);
});
router.get('/api/categories/:id', (req, res) => {
  const id: string = req.params.id;
  res.send(data.categories.find((el) => el.id === id));
});

export default router;
