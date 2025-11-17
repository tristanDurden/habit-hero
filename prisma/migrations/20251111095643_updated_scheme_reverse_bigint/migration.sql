/*
  Warnings:

  - You are about to alter the column `lastCompleted` on the `Habit` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- AlterTable
ALTER TABLE `Habit` MODIFY `lastCompleted` INTEGER NOT NULL DEFAULT 0;
