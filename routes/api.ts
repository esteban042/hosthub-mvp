import { Router } from 'express';
import apiRoutes from './api/index';

const router = Router();

router.use('/', apiRoutes);

export default router;
