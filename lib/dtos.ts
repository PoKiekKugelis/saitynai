import { z } from 'zod';

export interface PhotoshootDTO {
  id: number;
  title: string;
  description?: string | null;
  date?: string | null;
  ownerId?: number | null;
  public: boolean;
  sharedWith: number[];
  createdAt: string;
  updatedAt: string;
}

export const CreatePhotoshootDTOZ = z.object({
  title: z.string().trim().min(1).max(50),
  description: z.string().trim().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  ownerId: z.number().int().positive().optional().nullable(),
  public: z.boolean().optional().default(false),
  sharedWith: z.array(z.number().int().positive()).optional().default([]),
});

export type CreatePhotoshootDTO = z.infer<typeof CreatePhotoshootDTOZ>;

export const UpdatePhotoshootDTOZ = z.object({
  title: z.string().trim().min(1).max(50).optional(),
  description: z.string().trim().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  ownerId: z.number().int().positive().optional().nullable(),
  public: z.boolean().optional(),
  sharedWith: z.array(z.number().int().positive()).optional(),
});

export type UpdatePhotoshootDTO = z.infer<typeof UpdatePhotoshootDTOZ>;

export interface PhotoDTO {
  id: number;
  photoshootId: number;
  filename: string;
  caption?: string | null;
  CreatedAt: string;
}

export const CreatePhotoDTOZ = z.object({
  filename: z.string().min(1).max(100),
  caption: z.string().trim().optional().nullable(),
});

export type CreatePhotoDTO = z.infer<typeof CreatePhotoDTOZ>;

export const UpdatePhotoDTOZ = z.object({
  filename: z.string().min(1).max(100).optional(),
  caption: z.string().trim().optional().nullable(),
});

export type UpdatePhotoDTO = z.infer<typeof UpdatePhotoDTOZ>;

export interface CommentDTO {
  id: number;
  photoId: number;
  authorId: number;
  body: string;
  authorUsername?: string;
}

export const CreateCommentDTOZ = z.object({
  body: z.string().trim().min(1).max(500)
});

export type CreateCommentDTO = z.infer<typeof CreateCommentDTOZ>;

export const UpdateCommentDTOZ = z.object({
  body: z.string().trim().min(1).max(500)
});

export type UpdateCommentDTO = z.infer<typeof UpdateCommentDTOZ>;

export const CreateUserDTOZ = z.object({
  email: z.email().trim().max(50),
  password: z.string().trim().min(4).max(30),
  phoneNumber: z.string().trim().min(9).max(30).regex(/^[0-9+]+$/),
  username: z.string().trim().min(3).max(50),
});

export const UpdateUserDTOZ = z.object({
  email: z.email().trim().max(50).optional(),
  password: z.string().trim().min(4).max(30).optional(),
  phoneNumber: z.string().trim().min(9).max(30).regex(/^[0-9+]+$/).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserDTOZ>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTOZ>;

