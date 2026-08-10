import {prisma} from '../../lib/prisma';
import {MembershipRole, Organization} from '@prisma/client';


export const create = async (data: {
  name: string,
  slug: string,
  description: string | null,
  logoUrl: string | null,
})=>{
  const result = prisma.organization.create({data}); 
  return result;
}


export const findById = async (id: string) =>{
  return prisma.organization.findUnique({
    where: {id, deletedAt: null},
    include: {
      memberships: {
        include: {
          user: {
            select:{
              id: true,
              name: true,
              email: true,
              avatar: true
            },
          },
        },
      },
    },
  });
}

export const findBySlug = async(slug: string) =>{
  return prisma.organization.findUnique({
    where: {slug, deletedAt: null}
  });
};


// to add member 
export const addMember = async(data: {
  organizationId: string;
  userId: string;
  role: MembershipRole;
  invitedBy?: string
}) =>{
  return prisma.membership.create({
    data: {
      userId: data.userId,
      organizationId : data.organizationId,
      role: data.role,
      invitedBy: data.invitedBy
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  })

};

export const getUserRole = async(userId: string,organizationId: string) =>{
  console.log("userId: "+userId);
  return prisma.membership.findUnique({
     where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
  });
};


export const update = async(id: string, data: Partial<Organization>): Promise<Organization> =>{
  return prisma.organization.update({
    where: {id},
    data
  })
}