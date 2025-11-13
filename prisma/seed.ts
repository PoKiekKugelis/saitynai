import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const photoshootTitle = "Sunset Beach Session";

  // Step 1: Create/update photoshoot
  const photoshoot = await prisma.photoshoot.upsert({
    where: { title: photoshootTitle },
    update: {},
    create: {
      title: photoshootTitle,
      description: "A relaxed sunset photoshoot on the beach",
      date: new Date(),
    },
  });
  console.log("Created photoshoot:", photoshoot);

  // Step 2: Create photos separately (idempotent - check if exists first)
  const photo1Data = { filename: "sunset-1.jpg", caption: "Golden hour over the waves" };
  let photo1 = await prisma.photo.findFirst({
    where: { photoshootId: photoshoot.id, filename: photo1Data.filename },
  });
  if (!photo1) {
    photo1 = await prisma.photo.create({
      data: {
        filename: photo1Data.filename,
        caption: photo1Data.caption,
        photoshoot: { connect: { id: photoshoot.id } },
      },
    });
    console.log("Created photo 1:", photo1);
  }

  const photo2Data = { filename: "sunset-2.jpg", caption: "Silhouette on the sand" };
  let photo2 = await prisma.photo.findFirst({
    where: { photoshootId: photoshoot.id, filename: photo2Data.filename },
  });
  if (!photo2) {
    photo2 = await prisma.photo.create({
      data: {
        filename: photo2Data.filename,
        caption: photo2Data.caption,
        photoshoot: { connect: { id: photoshoot.id } },
      },
    });
    console.log("Created photo 2:", photo2);
  }

  // Step 3: Create comment separately (idempotent)
  const commentBody = "Lovely colors!";
  const existingComment = await prisma.comment.findFirst({
    where: { photoId: photo1.id, body: commentBody },
  });
  if (!existingComment) {
    const comment = await prisma.comment.create({
      data: {
        body: commentBody,
        authorId: 1, // Placeholder author ID for seed
        photo: { connect: { id: photo1.id } },
      },
    });
    console.log("Created comment:", comment);
  }
  
  // Step 4: Create users (idempotent)
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
    },
  });
  console.log("Created admin user");

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: 'user123',
      role: 'USER',
    },
  });
  console.log("Created regular user");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
