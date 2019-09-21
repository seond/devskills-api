import { createConnection } from 'typeorm';

export const connection = createConnection().catch((error: Error) => {
  console.error(error);
});
