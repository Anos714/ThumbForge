import { ZodError } from "zod";

export const getZodError = (error: ZodError) =>
  Object.values(error.flatten().fieldErrors).flat().join(", ");
