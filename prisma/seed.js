const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const plots = [
  { township: "ချမ်းမြသာစည်", street: "၆၂ လမ်း", width: 40, height: 60, grant: "ဂရန်မြေ", priceLakh: 250, facing: "အရှေ့", road: "၂၀ ပေ", tag: "ထူးခြား" },
  { township: "ပြည်ကြီးတံခွန်", street: "၁၀၈ လမ်း", width: 60, height: 80, grant: "ဂရန်မြေ", priceLakh: 480, facing: "တောင်", road: "၃၀ ပေ", tag: "အသစ်" },
  { township: "အောင်မြေသာစံ", street: "၂၆ လမ်း", width: 25, height: 50, grant: "ပါမစ်မြေ", priceLakh: 155, facing: "မြောက်", road: "၁၂ ပေ" },
  { township: "မဟာအောင်မြေ", street: "၈၄ လမ်း", width: 40, height: 60, grant: "ဘိုးဘွားပိုင်", priceLakh: 320, facing: "အနောက်", road: "၂၀ ပေ" },
  { township: "ချမ်းအေးသာစံ", street: "၇၃ လမ်း", width: 50, height: 70, grant: "ဂရန်မြေ", priceLakh: 650, facing: "အရှေ့", road: "၄၀ ပေ", tag: "ထူးခြား" },
  { township: "အမရပူရ", street: "ရွှေစက်ကုန်း", width: 80, height: 100, grant: "မြေပုံကျ", priceLakh: 920, facing: "တောင်", road: "ကားလမ်းမ" },
  { township: "ချမ်းမြသာစည်", street: "၅၈ လမ်း", width: 30, height: 55, grant: "ပါမစ်မြေ", priceLakh: 190, facing: "မြောက်", road: "၁၅ ပေ" },
  { township: "ပြည်ကြီးတံခွန်", street: "၁၁၆ လမ်း", width: 40, height: 70, grant: "ဂရန်မြေ", priceLakh: 370, facing: "အရှေ့", road: "၂၀ ပေ" },
];

async function main() {
  // Create a seed/demo user to own the seed plots
  const seedUser = await prisma.user.upsert({
    where: { email: "seed@mandalayland.com" },
    update: {},
    create: { email: "seed@mandalayland.com", name: "Demo" },
  });

  await prisma.plot.deleteMany();
  for (const p of plots) {
    await prisma.plot.create({ data: { ...p, userId: seedUser.id } });
  }
  console.log("Seeded", plots.length, "plots ✔");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
