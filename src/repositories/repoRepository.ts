import { prisma } from '../lib/prisma.js';

export class RepoRepository {
  async findById(id: string) {
    return prisma.repository.findUnique({
      where: { id }
    });
  }

  async findByOwnerAndName(owner: string, name: string) {
    return prisma.repository.findUnique({
      where: {
        owner_name: { owner, name }
      }
    });
  }

  async list() {
    return prisma.repository.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: {
    owner: string;
    name: string;
    defaultBranch?: string;
    webhookSecret?: string;
  }) {
    return prisma.repository.create({
      data: {
        owner: data.owner,
        name: data.name,
        defaultBranch: data.defaultBranch ?? 'main',
        webhookSecret: data.webhookSecret
      }
    });
  }

  async upsert(data: {
    owner: string;
    name: string;
    defaultBranch?: string;
  }) {
    return prisma.repository.upsert({
      where: {
        owner_name: { owner: data.owner, name: data.name }
      },
      update: {
        defaultBranch: data.defaultBranch ?? 'main'
      },
      create: {
        owner: data.owner,
        name: data.name,
        defaultBranch: data.defaultBranch ?? 'main'
      }
    });
  }
}

export const repoRepository = new RepoRepository();
