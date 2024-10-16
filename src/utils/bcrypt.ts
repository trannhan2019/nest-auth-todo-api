import { hash, compare } from 'bcrypt';

export const encrypt = async (toHash: string) => {
  const saltRounds = 10;

  return await hash(toHash, saltRounds);
};

export const decrypt = async (toDeHash: string, hash: string) => {
  return await compare(toDeHash, hash);
};
