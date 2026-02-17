import bcrypt from "bcrypt";

export async function hashToken(token) {
  const saltRounds = 12;
  return bcrypt.hash(token, saltRounds);
}

export async function compareToken(token, tokenHash) {
  return bcrypt.compare(token, tokenHash);
}
