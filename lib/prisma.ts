import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function getPrismaClient() {
  const dbUrl = process.env.MONGODB_URI ?? process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "MONGODB_URI or DATABASE_URL must be set in production for PrismaClient.",
    );
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return Reflect.get(client, prop);
  },
});

export default prisma;

export async function connectToPrisma() {
  const client = getPrismaClient();
  await client.$connect();
  return client;
}
