import { PrismaClient } from "@prisma/client";

// Prisma does not exist in global object, so have to declare and add the prisma model to it
declare global {
  var prisma: PrismaClient | undefined;
}

// prevent hot reload for initalization
const prismadb = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prismadb;
}

export default prismadb;
