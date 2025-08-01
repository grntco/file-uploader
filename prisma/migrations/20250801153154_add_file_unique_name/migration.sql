/*
  Warnings:

  - A unique constraint covering the columns `[uniqueName]` on the table `file` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uniqueName` to the `file` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" ADD COLUMN     "uniqueName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "file_uniqueName_key" ON "file"("uniqueName");
