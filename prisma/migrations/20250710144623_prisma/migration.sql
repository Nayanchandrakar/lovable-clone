/*
  Warnings:

  - You are about to drop the `Fragment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fragment" DROP CONSTRAINT "Fragment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_projectId_fkey";

-- DropTable
DROP TABLE "Fragment";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "Project";

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "type" "MessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fragment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "sandboxUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "files" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fragment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fragment_messageId_key" ON "fragment"("messageId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fragment" ADD CONSTRAINT "fragment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
