import * as repository from "./organization.repository";
import { OrganizationResponse,UpdateOrganizationInput,createOrganizationInput } from "./organization.type";
import { ConflictError } from "../../shared/types/errors";
import { logger } from "../../shared/utils/logger/logger";
import slugify from "slugify";
import { createAppError } from "../../shared/middleware/errorHandler";

//helper functions
const excludeSensitiveData = (org: any): OrganizationResponse => {
  const { deletedAt, ...safeOrg } = org;
  return safeOrg;
};


export const createOrganization = async(userId: string, data: createOrganizationInput): Promise<OrganizationResponse> =>{

  const slug = slugify(data.name, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()'"!:@]/g // Remove these characters
  });

  const isNameExist = await repository.findBySlug(slug);
  if(isNameExist) throw new ConflictError('Organization with this name is already exists');
  
  const organization = await repository.create({
    name: data.name,
    slug,
    description: data.description || null,
    logoUrl: data.logoUrl || null
  });


  //add owner using the userId and membershipRole - owner
  await repository.addMember({organizationId: organization.id,userId,role: "OWNER"});


  logger.info(`Organization create: ${organization.name}`,{
    organizationId: organization.id,
    userId,
    slug
  });

  return {...organization,role: 'OWNER'};

};



export const updateOrganization = async(id: string, userId: string, data: UpdateOrganizationInput): Promise<OrganizationResponse> =>{
  const organization = repository.findById(id);
  if(!organization || organization.deletedAt){
    throw createAppError("Organization not found",404);
  }

  const membership = await repository.getUserRole(userId,id);
  if(!membership || !['OWNER','ADMIN'].includes(membership.role)){
    throw createAppError("You dont have permission to update this organization", 403);
  }
   // If name is being updated, check slug
  if (data.name) {
    const newSlug = slugify(data.name, { lower: true, strict: true });
    if (newSlug !== organization.slug) {
      const existing = await repository.findBySlug(newSlug);
      if (existing && existing.id !== id) {
        throw createAppError('Organization with this name already exists', 409);
      }
      data = { ...data, slug: newSlug } as any;
    }
  }

  const updated = await repository.update(id, data);
  logger.info(`Organization updated: ${updated.name} by user ${userId}`);
  return excludeSensitiveData(updated);

};