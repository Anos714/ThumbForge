import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .max(255, {
      message: "Project title cannot be longer than 255 characters",
    })
    .optional()
    .default("Untitled Project"),
  description: z
    .string()
    .max(500, {
      message: "Project description cannot be longer than 500 characters",
    })
    .optional()
    .default("No description"),
});

export const getProjectByIdSchema = z.object({
  id: z.string().uuidv7({
    message: "Invalid project ID",
  }),
});

export const patchProjectSchema = z
  .object({
    title: z
      .string()
      .max(255, {
        message: "Project title cannot be longer than 255 characters",
      })
      .optional(),
    description: z
      .string()
      .max(500, {
        message: "Project description cannot be longer than 500 characters",
      })
      .optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: "At least one field (title or description) must be provided",
    },
  );
