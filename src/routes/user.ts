import express from 'express';
import controller from '../controllers/user';

const router = express.Router();

router.get('/validate', controller.validateToken);
router.post('/signup', controller.signup);
router.post('/login', controller.login);

export = router;
