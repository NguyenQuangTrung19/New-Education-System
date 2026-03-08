import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = await prisma.subject.findMany();
  const nameCount: Record<string, number> = {};
  
  subjects.forEach(s => {
    nameCount[s.name] = (nameCount[s.name] || 0) + 1;
  });
  
  const duplicates = Object.keys(nameCount).filter(n => nameCount[n] > 1);
  console.log("Duplicate names:", duplicates);
  
  if (duplicates.length > 0) {
    const dupSubjects = await prisma.subject.findMany({
      where: { name: { in: duplicates } }
    });
    console.log(JSON.stringify(dupSubjects, null, 2));
    
    // Auto-fix by appending code to duplicate names
    for (const name of duplicates) {
        const matching = dupSubjects.filter(s => s.name === name);
        // Keep the first one, modify the rest
        for (let i = 1; i < matching.length; i++) {
            const subj = matching[i];
            await prisma.subject.update({
                where: { id: subj.id },
                data: { name: `${subj.name} (${subj.code})` }
            });
            console.log(`Updated subject ${subj.id} name to ${subj.name} (${subj.code})`);
        }
    }
    console.log("Fixed duplicates.");
  } else {
    console.log("No duplicates found.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
