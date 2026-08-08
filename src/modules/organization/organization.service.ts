import * as repository from "./organization.repository";
import { OrganizationResponse,createOrganizationInput } from "./organization.type";
import { ConflictError } from "../../shared/types/errors";
import { logger } from "../../shared/utils/logger/logger";
import slugify from "slugify";




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