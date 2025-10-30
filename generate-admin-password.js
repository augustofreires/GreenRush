import bcrypt from "bcrypt";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Digite a nova senha do admin: ", async (password) => {
  const hash = await bcrypt.hash(password, 10);
  console.log("\nAdicione esta linha ao arquivo .env:");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  rl.close();
});
