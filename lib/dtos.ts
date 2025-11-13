import { z } from 'zod';

export interface PhotoshootDTO {
  id: number;
  title: string;
  description?: string | null;
  date?: string | null;
  ownerId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export const CreatePhotoshootDTOZ = z.object({
  title: z.string().min(1).max(50),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  ownerId: z.number().int().positive().optional().nullable(),
});

export type CreatePhotoshootDTO = z.infer<typeof CreatePhotoshootDTOZ>;

export const UpdatePhotoshootDTOZ = z.object({
  title: z.string().min(1).max(50).optional(),
  description: z.string().optional().nullable(),
  date: z.string().datetime().optional().nullable(),
  ownerId: z.number().int().positive().optional().nullable(),
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
  caption: z.string().optional().nullable(),
});

export type CreatePhotoDTO = z.infer<typeof CreatePhotoDTOZ>;

export const UpdatePhotoDTOZ = z.object({
  filename: z.string().min(1).max(100).optional(),
  caption: z.string().optional().nullable(),
});

export type UpdatePhotoDTO = z.infer<typeof UpdatePhotoDTOZ>;

export interface CommentDTO {
  id: number;
  photoId: number;
  authorId: number;
  body: string;
}

export const CreateCommentDTOZ = z.object({
  body: z.string().min(2).max(500).trim(),
});

export type CreateCommentDTO = z.infer<typeof CreateCommentDTOZ>;

export const UpdateCommentDTOZ = z.object({
  body: z.string().min(2).max(500),
});

export type UpdateCommentDTO = z.infer<typeof UpdateCommentDTOZ>;
