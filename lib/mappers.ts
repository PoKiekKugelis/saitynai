import type { Photoshoot, Photo, Comment } from '@prisma/client';
import { 
  PhotoshootDTO, 
  PhotoDTO, 
  CommentDTO,
  CreatePhotoshootDTO,
  CreatePhotoDTO,
  CreateCommentDTO,
  UpdatePhotoshootDTO,
  UpdatePhotoDTO,
  UpdateCommentDTO
} from './dtos';

export function photoshootToDTO(ps: Photoshoot): PhotoshootDTO {
  return {
    id: ps.id,
    title: ps.title,
    description: ps.description ?? null,
    date: ps.date ? ps.date.toISOString() : null,
    ownerId: ps.ownerId ?? null,
    createdAt: ps.created_at.toISOString(),
    updatedAt: ps.updated_at.toISOString(),
  };
}

export function photoToDTO(p: Photo): PhotoDTO {
  return {
    id: p.id,
    photoshootId: p.photoshootId,
    filename: p.filename,
    caption: p.caption ?? null,
    CreatedAt: p.created_at.toISOString(),
  };
}

export function commentToDTO(c: Comment): CommentDTO {
  return {
    id: c.id,
    photoId: c.photoId,
    authorId: c.authorId,
    body: c.body,
  };
}

export function createPhotoshootDTOToPrisma(dto: CreatePhotoshootDTO) {
  return {
    title: dto.title,
    description: dto.description ?? null,
    date: dto.date ? new Date(dto.date) : null,
    ownerId: dto.ownerId ?? null,
  };
}

export function updatePhotoshootDTOToPrisma(dto: UpdatePhotoshootDTO) {
  const updateData: any = {};
  
  if (dto.title !== undefined) updateData.title = dto.title;
  if (dto.description !== undefined) updateData.description = dto.description;
  if (dto.date !== undefined) updateData.date = dto.date ? new Date(dto.date) : null;
  if (dto.ownerId !== undefined) updateData.ownerId = dto.ownerId;
  
  return updateData;
}

export function createPhotoDTOToPrisma(dto: CreatePhotoDTO, photoshootId: string) {
  return {
    photoshootId: parseInt(photoshootId),
    filename: dto.filename,
    caption: dto.caption ?? null,
  };
}

export function updatePhotoDTOToPrisma(dto: UpdatePhotoDTO) {
  const updateData: any = {};
  
  if (dto.filename !== undefined) updateData.filename = dto.filename;
  if (dto.caption !== undefined) updateData.caption = dto.caption;
  
  return updateData;
}

export function createCommentDTOToPrisma(dto: CreateCommentDTO, photoId: string) {
  return {
    photoId: parseInt(photoId),
    authorId: dto.authorId,
    body: dto.body,
  };
}

export function updateCommentDTOToPrisma(dto: UpdateCommentDTO) {
  return {
    body: dto.body,
  };
}
