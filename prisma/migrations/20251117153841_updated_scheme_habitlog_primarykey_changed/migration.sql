/*
  Warnings:

  - The primary key for the `HabitLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `HabitLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `HabitLog` DROP FOREIGN KEY `HabitLog_habitId_fkey`;

-- DropIndex
DROP INDEX `HabitLog_habitId_date_userId_key` ON `HabitLog`;

-- AlterTable
ALTER TABLE `HabitLog` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`habitId`, `date`, `userId`);

-- AddForeignKey
ALTER TABLE `Habit` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
