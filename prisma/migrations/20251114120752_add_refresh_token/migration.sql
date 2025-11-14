/*
  Warnings:

  - You are about to drop the column `refreshTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshTokenExpiry",
ADD COLUMN     "refreshTokenExpiration" TIMESTAMP(3);
