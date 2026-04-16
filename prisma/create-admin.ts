import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = "admin@empresa.com";
  const password = "adminpassword123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Admin user already exists.");
    return;
  }

  await db.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  console.log(`Admin user created: ${email} | ${password}`);
}

createAdmin()
  .catch(err => console.error(err))
  .finally(() => process.exit(0));
