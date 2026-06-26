import { getZodError } from "./../utils/getZodError.js";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import {
  createProjectSchema,
  getProjectByIdSchema,
  patchProjectSchema,
} from "../validators/project.validator.js";
import { AppError } from "../errors/AppError.js";
import { db } from "../db/index.js";
import { projects } from "../db/schema/projects.js";
import { ApiRes } from "./auth.controller.js";
import { and, eq } from "drizzle-orm";

const selectData = {
  id: projects.id,
  title: projects.title,
  description: projects.description,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
};

export const createProject = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = createProjectSchema.safeParse(req.body);

    if (!result.success) {
      const errorMsg = result.error || "Validation failed";
      throw new AppError(getZodError(errorMsg), 400);
    }

    const { title, description } = result.data;
    const { id: userID } = req.user;

    const [newProject] = await db
      .insert(projects)
      .values({ userId: userID, title, description })
      .returning(selectData);

    if (!newProject) {
      throw new AppError("Project creation failed", 500);
    }

    res.status(201).json({
      status: "success",
      message: "Project created successfully",
      data: newProject,
    });
  },
);

export const getAllProjects = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const { id: userID } = req.user;

    const allProjects = await db
      .select(selectData)
      .from(projects)
      .where(eq(projects.userId, userID));

    if (allProjects.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No projects found",
        data: allProjects,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Projects fetched successfully",
      data: allProjects,
    });
  },
);

export const getProjectById = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = getProjectByIdSchema.safeParse(req.params);

    if (!result.success) {
      const errorMsg = result.error || "Validation failed";
      throw new AppError(getZodError(errorMsg), 400);
    }

    const { id: projectID } = result.data;
    const { id: userID } = req.user;

    const [fetchedProject] = await db
      .select(selectData)
      .from(projects)
      .where(and(eq(projects.id, projectID), eq(projects.userId, userID)));

    if (!fetchedProject) {
      throw new AppError("Project not found", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Project fetched successfully",
      data: fetchedProject,
    });
  },
);

export const patchProject = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const paramResult = getProjectByIdSchema.safeParse(req.params);

    if (!paramResult.success) {
      const errorMsg = paramResult.error || "Validation failed";
      throw new AppError(getZodError(errorMsg), 400);
    }

    const { id: projectID } = paramResult.data;

    const bodyResult = patchProjectSchema.safeParse(req.body);

    if (!bodyResult.success) {
      const errorMsg = bodyResult.error || "Validation failed";
      throw new AppError(getZodError(errorMsg), 400);
    }

    const updateData = bodyResult.data;
    const { id: userID } = req.user;

    const [updatedProject] = await db
      .update(projects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(and(eq(projects.id, projectID), eq(projects.userId, userID)))
      .returning(selectData);

    if (!updatedProject) {
      throw new AppError("Project not found or update failed", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Project updated successfully",
      data: updatedProject,
    });
  },
);

export const deleteProject = catchAsync(
  async (req: Request, res: Response<ApiRes>, next: NextFunction) => {
    const result = getProjectByIdSchema.safeParse(req.params);

    if (!result.success) {
      const errorMsg = result.error || "Validation failed";
      throw new AppError(getZodError(errorMsg), 400);
    }

    const { id: projectID } = result.data;
    const { id: userID } = req.user;

    const [deletedProject] = await db
      .delete(projects)
      .where(and(eq(projects.id, projectID), eq(projects.userId, userID)))
      .returning(selectData);
    if (!deletedProject) {
      throw new AppError("Project not found or delete failed", 404);
    }

    res.status(200).json({
      status: "success",
      message: "Project deleted successfully",
      data: deletedProject,
    });
  },
);
