/*
  Warnings:

  - You are about to drop the column `useId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "useId",
ADD COLUMN     "userId" TEXT NOT NULL;
