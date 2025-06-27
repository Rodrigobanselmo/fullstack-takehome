// prisma/seed.ts
import type { User } from "generated/gql/graphql";
import { JobStatus, PrismaClient, UserRole } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10;
  const guestPassword = "guest";
  const hashedPassword = await bcrypt.hash(guestPassword, saltRounds);

  const contractorUser = await prisma.user.upsert({
    where: { username: "guest.contractor" },
    update: {},
    create: {
      username: "guest.contractor",
      password: hashedPassword,
      role: UserRole.CONTRACTOR,
      name: "Contractor Guest",
    },
  });

  console.log(
    `Created/updated contractor user: ${contractorUser.username} with ID: ${contractorUser.id}`,
  );

  // Additional homeowners
  const moreHomeowners = [
    { username: "guest.homeowner", name: "Guest Homeowner" },
    { username: "guest.homeowner2", name: "Guest Homeowner 2" },
    { username: "guest.homeowner3", name: "Guest Homeowner 3" },
    { username: "guest.homeowner4", name: "Guest Homeowner 4" },
    { username: "guest.homeowner5", name: "Guest Homeowner 5" },
  ];

  const homeownerUsers: User[] = [];
  for (const { username, name } of moreHomeowners) {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        password: hashedPassword,
        role: UserRole.HOMEOWNER,
        name,
      },
    });
    homeownerUsers.push(user);

    console.log(
      `Created/updated homeowner user: ${user.username} with ID: ${user.id}`,
    );
  }

  const jobs = [
    {
      id: "seed-job-planning",
      description: "Kitchen Renovation Project",
      location: "123 Main St, Anytown, USA",
      status: JobStatus.PLANNING,
      cost: 25000.0,
      homeownerId: homeownerUsers[0]!.id,
    },
    {
      id: "seed-job-in-progress",
      description: "Bathroom Remodel",
      location: "456 Oak Ave, Somewhere, USA",
      status: JobStatus.IN_PROGRESS,
      cost: 15000.0,
      homeownerId: homeownerUsers[1]!.id,
    },
    {
      id: "seed-job-completed",
      description: "Deck Construction",
      location: "789 Pine Rd, Elsewhere, USA",
      status: JobStatus.COMPLETED,
      cost: 8000.0,
      homeownerId: homeownerUsers[2]!.id,
    },
    {
      id: "seed-job-canceled",
      description: "Basement Finishing",
      location: "321 Elm St, Nowhere, USA",
      status: JobStatus.CANCELED,
      cost: 30000.0,
      homeownerId: homeownerUsers[3]!.id,
    },
  ];

  const createdJobs = [];
  for (const jobData of jobs) {
    const job = await prisma.job.upsert({
      where: { id: jobData.id },
      update: {},
      create: {
        ...jobData,
        contractorId: contractorUser.id,
      },
    });

    await prisma.conversation.upsert({
      where: {
        contractorId_homeownerId: {
          contractorId: contractorUser.id,
          homeownerId: jobData.homeownerId,
        },
      },
      update: {},
      create: {
        contractorId: contractorUser.id,
        homeownerId: jobData.homeownerId,
      },
    });

    createdJobs.push(job);
    console.log(`Created/updated job: ${job.description} with ID: ${job.id}`);
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
