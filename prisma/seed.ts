import "dotenv/config";
import { PrismaClient, UserRole } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10;
  const guestPassword = "guest";
  const hashedPassword = await bcrypt.hash(guestPassword, saltRounds);

  const contractorUser = await prisma.users.upsert({
    where: { username: "guest" },
    update: {},
    create: {
      username: "guest",
      password: hashedPassword,
      role: UserRole.contractor,
      name: "Contractor Guest",
    },
  });

  console.log(
    `Created/updated contractor user: ${contractorUser.username} with ID: ${contractorUser.id}`,
  );

  const moreHomeowners = [
    { username: "guest.homeowner", name: "Guest Homeowner" },
    { username: "guest.homeowner2", name: "Guest Homeowner 2" },
    { username: "guest.homeowner3", name: "Guest Homeowner 3" },
    { username: "guest.homeowner4", name: "Guest Homeowner 4" },
    { username: "guest.homeowner5", name: "Guest Homeowner 5" },
  ];

  for (const { username, name } of moreHomeowners) {
    const user = await prisma.users.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password: hashedPassword,
        role: UserRole.homeowner,
        name,
      },
    });

    console.log(
      `Created/updated homeowner user: ${user.username} with ID: ${user.id}`,
    );
  }

  console.log(`Seeding finished.`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
