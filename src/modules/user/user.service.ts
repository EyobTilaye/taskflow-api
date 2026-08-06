
import bcrypt from 'bcrypt';
import * as userRepository from './user.repository';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  UserResponse, 
  UserQueryParams,
  PaginatedUsersResponse 
} from './user.types';
import { createAppError } from '../../shared/middleware/errorHandler';
import { logger } from '../../shared/utils/logger/logger';


const SALT_ROUNDS = 12;


const toUserResponse = (user: any): UserResponse => {
  // Destructure to remove password
  const { password, ...safeUser } = user;
  return safeUser as UserResponse;
};


const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};


const validateName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw createAppError('Name must be at least 2 characters', 400);
  }
  if (trimmed.length > 100) {
    throw createAppError('Name is too long', 400);
  }
  return trimmed;
};


export const registerUser = async (data: CreateUserInput): Promise<UserResponse> => {
  // 1. Validate and normalize inputs
  const normalizedEmail = normalizeEmail(data.email);
  const trimmedName = validateName(data.name);

  // 2. Check if user already exists
  const existingUser = await userRepository.findByEmail(normalizedEmail);
  if (existingUser) {
    throw createAppError('User with this email already exists', 409);
  }

  // 3. Hash the password
  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

  // 4. Create user in database
  const user = await userRepository.create({
    name: trimmedName,
    email: normalizedEmail,
    password: hashedPassword,
  });

  // 5. Log the event
  logger.info(`User registered: ${user.email}`, {
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  // 6. Return safe user data (exclude password)
  return toUserResponse(user);
};


export const loginUser = async (email: string, password: string): Promise<UserResponse> => {
  // 1. Normalize email and find user
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);
  
  if (!user) {
    throw createAppError('Invalid email or password', 401);
  }

  // 2. Compare provided password with stored hash
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createAppError('Invalid email or password', 401);
  }

  // 3. Log successful login
  logger.info(`User logged in: ${user.email}`, {
    userId: user.id,
    email: user.email,
  });

  // 4. Return safe user data
  return toUserResponse(user);
};


export const getUserById = async (id: string): Promise<UserResponse> => {
  const user = await userRepository.findById(id);
  
  if (!user) {
    throw createAppError('User not found', 404);
  }

  return toUserResponse(user);
};


export const getUserByEmail = async (email: string): Promise<UserResponse> => {
  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);
  
  if (!user) {
    throw createAppError('User not found', 404);
  }

  return toUserResponse(user);
};


export const updateUser = async (
  id: string, 
  data: UpdateUserInput
): Promise<UserResponse> => {
  // 1. Check if user exists
  const existingUser = await userRepository.findById(id);
  if (!existingUser) {
    throw createAppError('User not found', 404);
  }

  // 2. Prepare update data
  const updateData: any = {};

  // Handle name update
  if (data.name !== undefined) {
    updateData.name = validateName(data.name);
  }

  // Handle email update (check uniqueness)
  if (data.email !== undefined) {
    const normalizedEmail = normalizeEmail(data.email);
    
    // Check if email is different from current
    if (normalizedEmail !== existingUser.email) {
      const emailExists = await userRepository.exists(normalizedEmail);
      if (emailExists) {
        throw createAppError('Email already taken', 409);
      }
      updateData.email = normalizedEmail;
    }
  }

  // Handle password update (hash it)
  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  // Handle avatar update
  if (data.avatar !== undefined) {
    updateData.avatar = data.avatar;
  }

  // Handle isVerified update (only if explicitly provided)
  if (data.isVerified !== undefined) {
    updateData.isVerified = data.isVerified;
  }

  // 3. If no fields to update, return existing user
  if (Object.keys(updateData).length === 0) {
    return toUserResponse(existingUser);
  }

  // 4. Update user in database
  const updatedUser = await userRepository.update(id, updateData);

  // 5. Log the event
  logger.info(`User updated: ${updatedUser.email}`, {
    userId: updatedUser.id,
    email: updatedUser.email,
    changes: Object.keys(updateData),
  });

  // 6. Return safe user data
  return toUserResponse(updatedUser);
};


export const deleteUser = async (id: string): Promise<void> => {
  // 1. Check if user exists
  const user = await userRepository.findById(id);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // 2. Delete user from database
  await userRepository.deleteUser(id);

  // 3. Log the event
  logger.info(`User deleted: ${user.email}`, {
    userId: user.id,
    email: user.email,
  });
};

/**
 * List users with pagination and search
 * 
 * Business Rules:
 * 1. Default page = 1, limit = 10
 * 2. Maximum limit = 100
 * 3. Search across name and email (case insensitive)
 * 4. Sort by createdAt descending (newest first)
 * 
 * @param params - Query parameters (page, limit, search, isVerified)
 * @returns Paginated users with metadata
 */
export const listUsers = async (
  params: UserQueryParams
): Promise<PaginatedUsersResponse> => {
  // 1. Parse and validate pagination parameters
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  // 2. Build search filter
  const where: any = {};
  
  if (params.search) {
    const searchTerm = params.search.trim();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (params.isVerified !== undefined) {
    where.isVerified = params.isVerified;
  }

  // 3. Fetch users and total count in parallel (better performance)
  const [users, total] = await Promise.all([
    userRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: 'desc' },
    }),
    userRepository.count(where),
  ]);

  // 4. Convert to safe format (exclude passwords)
  const userResponses = users.map(toUserResponse);

  // 5. Calculate pagination metadata
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  // 6. Return paginated response
  return {
    users: userResponses,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  };
};


export const verifyEmail = async (id: string): Promise<UserResponse> => {
  // 1. Check if user exists
  const user = await userRepository.findById(id);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // 2. Check if already verified
  if (user.isVerified) {
    throw createAppError('Email already verified', 400);
  }

  // 3. Update user as verified
  const verifiedUser = await userRepository.verifyEmail(id);

  // 4. Log the event
  logger.info(`Email verified: ${verifiedUser.email}`, {
    userId: verifiedUser.id,
    email: verifiedUser.email,
  });

  // 5. Return safe user data
  return toUserResponse(verifiedUser);
};



export const updateAvatar = async (
  id: string, 
  avatarUrl: string | null
): Promise<UserResponse> => {
  // 1. Check if user exists
  const user = await userRepository.findById(id);
  if (!user) {
    throw createAppError('User not found', 404);
  }

  // 2. Update avatar
  const updatedUser = await userRepository.updateAvatar(id, avatarUrl);

  // 3. Log the event
  logger.info(`Avatar updated: ${updatedUser.email}`, {
    userId: updatedUser.id,
    email: updatedUser.email,
    hasAvatar: !!avatarUrl,
  });

  // 4. Return safe user data
  return toUserResponse(updatedUser);
};