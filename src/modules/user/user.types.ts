
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;        
  avatar: string | null;   
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface UserResponse {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface CreateUserInput {
  name: string;
  email: string;
  password: string;        
}


export interface UpdateUserInput {
  name?: string;
  email?: string;
  avatar?: string | null;
  isVerified?: boolean;
  password?: string;       
}


export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isVerified?: boolean;
}


export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}