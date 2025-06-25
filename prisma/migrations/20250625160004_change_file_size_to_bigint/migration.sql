/*
  Warnings:

  - The `size` column on the `file` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "file" DROP COLUMN "size",
ADD COLUMN     "size" BIGINT;
