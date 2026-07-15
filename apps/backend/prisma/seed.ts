import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";
import { Role } from "../generated/prisma/enums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});
async function main() {
  const hashedPassword = await bcrypt.hash("Admin123!", 10);

  await prisma.user.upsert({
    where: {
      email: "admin@cooperative.com",
    },
    update: {},
    create: {
      email: "admin@cooperative.com",
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      mustChangePassword: false,
    },
  });

  console.log("✅ Admin account created (or already exists).");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });