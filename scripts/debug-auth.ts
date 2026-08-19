import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function testAuth() {
  const email = "admin@empresa.com";
  const password = "adminpassword123";

  console.log("Checking user in DB...");
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User found. ID:", user.id);
  console.log("Stored hash:", user.password);

  const isValid = await bcrypt.compare(password, user.password || "");
  console.log("Is password valid?", isValid);
  
  // Also try manual hashing to compare
  const newHash = await bcrypt.hash(password, 10);
  console.log("New hash for same password:", newHash);
  const isValidNew = await bcrypt.compare(password, newHash);
  console.log("Is new hash valid with same password?", isValidNew);
}

testAuth().catch(console.error);
