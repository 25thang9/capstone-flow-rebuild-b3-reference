/*
  Warnings:

  - A unique constraint covering the columns `[institutionCode]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "institutionCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_institutionCode_key" ON "user"("institutionCode");
