// prisma/seed.ts
import { JobStatus, PrismaClient, UserRole } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10;

  const contractorPassword = "password123";
  const hashedContractorPassword = await bcrypt.hash(
    contractorPassword,
    saltRounds,
  );
  const contractorUser = await prisma.user.upsert({
    where: { username: "contractor" },
    update: {},
    create: {
      username: "contractor",
      password: hashedContractorPassword,
      role: UserRole.CONTRACTOR,
    },
  });
  console.log(
    `Created/updated contractor user: ${contractorUser.username} with ID: ${contractorUser.id}`,
  );

  const homeownerPassword = "password123";
  const hashedHomeownerPassword = await bcrypt.hash(
    homeownerPassword,
    saltRounds,
  );
  const homeownerUser = await prisma.user.upsert({
    where: { username: "homeowner" },
    update: {},
    create: {
      username: "homeowner",
      password: hashedHomeownerPassword,
      role: UserRole.HOMEOWNER,
    },
  });
  console.log(
    `Created/updated homeowner user: ${homeownerUser.username} with ID: ${homeownerUser.id}`,
  );

  // Create jobs with each status from the job schema
  const jobs = [
    {
      id: "seed-job-planning",
      description: "Kitchen Renovation Project",
      location: "123 Main St, Anytown, USA",
      status: JobStatus.PLANNING,
      cost: 25000.0,
    },
    {
      id: "seed-job-in-progress",
      description: "Bathroom Remodel",
      location: "456 Oak Ave, Somewhere, USA",
      status: JobStatus.IN_PROGRESS,
      cost: 15000.0,
    },
    {
      id: "seed-job-completed",
      description: "Deck Construction",
      location: "789 Pine Rd, Elsewhere, USA",
      status: JobStatus.COMPLETED,
      cost: 8000.0,
    },
    {
      id: "seed-job-canceled",
      description: "Basement Finishing",
      location: "321 Elm St, Nowhere, USA",
      status: JobStatus.CANCELED,
      cost: 30000.0,
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
        homeownerId: homeownerUser.id,
      },
    });
    createdJobs.push(job);
    console.log(
      `Created/updated job: ${job.description} with ID: ${job.id} and status: ${job.status}`,
    );
  }

  // Create messages for the first job (planning status)
  const firstJob = createdJobs[0];
  if (firstJob) {
    await prisma.message.createMany({
      data: [
        {
          text: "Hello homeowner, welcome to the project!",
          jobId: firstJob.id,
          senderId: contractorUser.id,
        },
        {
          text: "Thanks, contractor! Looking forward to it.",
          jobId: firstJob.id,
          senderId: homeownerUser.id,
        },
      ],
    });

    console.log(`Created messages for job ID: ${firstJob.id}`);
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
