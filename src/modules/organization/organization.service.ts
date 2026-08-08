import * as repository from "./organization.repository";
import { OrganizationResponse,createOrganizationInput } from "./organization.type";
import { ConflictError } from "../../shared/types/errors";
import { logger } from "../../shared/utils/logger/logger";




export const createOrganization = async(userId: string, data: createOrganizationInput): Promise<OrganizationResponse> =>{

  const slug = data.name.toLowerCase().replace(/[a-z0-9]+/g,'-');

  const isNameExist = await repository.findBySlug(slug);
  if(isNameExist) throw new ConflictError('Organization with this name is already exists');
  
  const organization = await repository.create({
    name: data.name,
    slug,
    description: data.description || null,});


  //add owner using the userId and membershipRole - owner
  await repository.addMember({organizationId: organization.id,userId,role: "OWNER"});


  logger.info(`Organization create: ${organization.name}`,{
    organizationId: organization.id,
    userId,
    slug
  });

  return {...organization,role: 'OWNER'};


};