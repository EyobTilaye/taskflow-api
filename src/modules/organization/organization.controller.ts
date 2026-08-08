import { asyncHandler } from "../../shared/middleware/asyncHandler";
import {Request, Response} from "express";
import { sendSuccess } from "../../shared/utils/response";
import { createOrganizationDto } from "./organization.dto";
import * as organizationService from "./organization.service";



export const createOrganizationHandler = asyncHandler(async (req: Request,res: Response)=>{
  const userId = req.user!.userId;
  const data = req.body as createOrganizationDto;

  const organization = await organizationService.createOrganization(userId,data);

  
  sendSuccess(res,organization,'Create Organization - WIP');
});


export const getOrganization = asyncHandler(async (req: Request, res: Response)=>{

});

export const getOrganizationById = asyncHandler(async(req: Request, res: Response)=>{


});

