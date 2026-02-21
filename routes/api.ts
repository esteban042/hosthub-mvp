import { Router } from 'express';
import apiRoutes from './api/index.js';

const router = Router();

router.use('/', apiRoutes);

export default router;
