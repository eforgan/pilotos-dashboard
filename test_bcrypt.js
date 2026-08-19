import bcrypt from "bcryptjs";
async function main() {
    const hash = await bcrypt.hash("admin123", 10);
    console.log("Hash for admin123:", hash);
}
main();
