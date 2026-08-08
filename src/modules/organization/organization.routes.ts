import { createOrganizationSchema } from "./organization.dto";
import { validate } from "../../shared/middleware/validate";
import {Router} from 'express';
import * as organizationController from './organization.controller';
import { authenticate } from "../../shared/middleware/auth";


const router = Router();



router.post('/create',authenticate,validate(createOrganizationSchema),organizationController.createOrganizationHandler);




export const organizationRoutes = router;