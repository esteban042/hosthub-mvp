import { Router } from 'express';
import apartmentsRouter from './apartments';
import bookingsRouter from './bookings';
import hostsRouter from './hosts';
import usersRouter from './users';
import blockedDatesRouter from './blocked-dates';
import availabilityRouter from './availability';
import messagesRouter from './messages';
import miscRouter from './misc';

const router = Router();

router.use('/apartments', apartmentsRouter);
router.use('/bookings', bookingsRouter);
router.use('/hosts', hostsRouter);
router.use('/users', usersRouter);
router.use('/availability', availabilityRouter);
router.use('/messages', messagesRouter);
router.use('/', blockedDatesRouter);
router.use('/', miscRouter);

export default router;
