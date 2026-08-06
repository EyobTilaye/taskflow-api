// src/modules/user/user.repository.ts

import { prisma } from '../../lib/prisma';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const findByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const findById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const create = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
    },
  });
};

export const update = async (
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    avatar?: string | null;
    isVerified?: boolean;
  }
): Promise<User> => {
  const updateData: any = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.password !== undefined) updateData.password = data.password;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
};

export const deleteUser = async (id: string): Promise<User> => {
  return prisma.user.delete({
    where: { id },
  });
};

export const findMany = async (params: {
  skip?: number;
  take?: number;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
}): Promise<User[]> => {
  return prisma.user.findMany({
    skip: params.skip || 0,
    take: params.take || 10,
    where: params.where || {},
    orderBy: params.orderBy || { createdAt: 'desc' },
  });
};

export const count = async (where?: Prisma.UserWhereInput): Promise<number> => {
  return prisma.user.count({
    where: where || {},
  });
};

export const exists = async (email: string): Promise<boolean> => {
  const count = await prisma.user.count({
    where: { email },
  });
  return count > 0;
};

export const verifyEmail = async (id: string): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: { isVerified: true },
  });
};

export const updateAvatar = async (id: string, avatarUrl: string | null): Promise<User> => {
  return prisma.user.update({
    where: { id },
    data: { avatar: avatarUrl },
  });
};