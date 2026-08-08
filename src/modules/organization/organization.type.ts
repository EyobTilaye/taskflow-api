import {MembershipRole} from '@prisma/client';

export interface Organization{
  id: string,
  name: string,
  slug: string,
  description: string,
  logoUrl: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
};

export interface createOrganizationInput{
  name: string,
  description?: string,
  logoUrl?: string
};


export interface UpdateOrganizationInput{
  id?: string,
  name?: string,
  description?: string,
  logoUrl?: string,
  createdAt?: Date,
  updatedAt?: Date,
  deletedAt?: Date
};


export interface OrganizationResponse {
  id: string;                   
  name: string;                
  slug: string;                 
  description: string | null;  
  logoUrl: string | null;       
  role: MembershipRole;         
  createdAt: Date;             
  updatedAt: Date;       
};



export interface MembershipResponse {
  id: string;
  userId: string;
  organizationId: string;
  role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST';
  joinedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export interface InviteMemberInput {
  email: string;
  role?: 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST';
}