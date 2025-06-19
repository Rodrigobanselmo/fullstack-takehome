// prisma/seed.ts
import { JobStatus, PrismaClient, UserRole } from '../generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  const saltRounds = 10; 

  const contractorPassword = 'password123';
  const hashedContractorPassword = await bcrypt.hash(contractorPassword, saltRounds);
  const contractorUser = await prisma.user.upsert({
    where: { username: 'contractor' },
    update: {}, 
    create: {
      username: 'contractor',
      password: hashedContractorPassword,
      role: UserRole.CONTRACTOR, 
    },  
  });
  console.log(`Created/updated contractor user: ${contractorUser.username} with ID: ${contractorUser.id}`);

  const homeownerPassword = 'password123';
  const hashedHomeownerPassword = await bcrypt.hash(homeownerPassword, saltRounds);
  const homeownerUser = await prisma.user.upsert({
    where: { username: 'homeowner' },
    update: {},
    create: {
      username: 'homeowner',
      password: hashedHomeownerPassword,
      role: UserRole.HOMEOWNER,
    },
  });
  console.log(`Created/updated homeowner user: ${homeownerUser.username} with ID: ${homeownerUser.id}`);

  const job1 = await prisma.job.upsert({
      where: { id: 'seed-job-1' }, 
      update: {},
      create: {
          id: 'seed-job-1', 
          description: 'Kitchen Renovation Project',
          location: '123 Main St, Anytown, USA',
          status: JobStatus.PLANNING, 
          cost: 25000.00,
          contractorId: contractorUser.id,
          homeownerId: homeownerUser.id, 
      }
  });
  console.log(`Created/updated job: ${job1.description} with ID: ${job1.id}`);

  await prisma.message.createMany({
      data: [
          {
              text: 'Hello homeowner, welcome to the project!',
              jobId: job1.id,
              senderId: contractorUser.id,
          },
          {
              text: 'Thanks, contractor! Looking forward to it.',
              jobId: job1.id,
              senderId: homeownerUser.id,
          },
      ],
  });

  console.log(`Created messages for job ID: ${job1.id}`);
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