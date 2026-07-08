import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@portalnews.com";
  const ketuaEmail = "ketua@portalnews.com";
  const adminPassword = "admin123";
  const ketuaPassword = "ketua123";
  const adminHash = createHash("sha256").update(adminPassword).digest("hex");
  const ketuaHash = createHash("sha256").update(ketuaPassword).digest("hex");

  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  if (adminUser) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "admin",
        provider: "email",
        passwordHash: adminHash,
        isVerified: true,
        name: "Admin",
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        role: "admin",
        provider: "email",
        passwordHash: adminHash,
        isVerified: true,
      },
    });
  }

  const ketuaUser = await prisma.user.findUnique({
    where: { email: ketuaEmail },
  });
  if (ketuaUser) {
    await prisma.user.update({
      where: { email: ketuaEmail },
      data: {
        role: "ketua",
        provider: "email",
        passwordHash: ketuaHash,
        isVerified: true,
        name: "Ketua",
      },
    });
  } else {
    await prisma.user.create({
      data: {
        name: "Ketua",
        email: ketuaEmail,
        role: "ketua",
        provider: "email",
        passwordHash: ketuaHash,
        isVerified: true,
      },
    });
  }

  console.log("Seeded admin account with password:", adminPassword);
  console.log("Seeded ketua account with password:", ketuaPassword);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
