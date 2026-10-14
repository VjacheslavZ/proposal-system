import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

// Fixed IDs make the seed idempotent: re-running it never creates duplicates.
const MEMBER_ID = "member_james_whitfield";
const RESERVATION_ID = "reservation_punta_mita";

async function main() {
  const member = {
    name: "James Whitfield",
    email: "james.whitfield@example.com",
  };
  await prisma.member.upsert({
    where: { id: MEMBER_ID },
    update: member,
    create: { id: MEMBER_ID, ...member },
  });

  const reservation = {
    member_id: MEMBER_ID,
    destination: "Punta Mita, Mexico",
    villa: "Villa Punta Mita",
    arrival_date: new Date("2027-12-15T00:00:00.000Z"),
    departure_date: new Date("2027-12-22T00:00:00.000Z"),
  };
  await prisma.reservation.upsert({
    where: { id: RESERVATION_ID },
    update: reservation,
    create: { id: RESERVATION_ID, ...reservation },
  });

  console.log("Seeded member and reservation.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
