/*
  Warnings:

  - Changed the type of `updatedAt` on the `Habit` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `HabitLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable: Convert updatedAt from DATETIME(3) to INTEGER for Habit table
-- Step 1: Add temporary INTEGER column
ALTER TABLE `Habit` ADD COLUMN `updatedAt_temp` INTEGER NOT NULL DEFAULT 0;

-- Step 2: Convert DATETIME values to Unix timestamp (seconds since epoch)
UPDATE `Habit` SET `updatedAt_temp` = UNIX_TIMESTAMP(`updatedAt`);

-- Step 3: Drop the old DATETIME column
ALTER TABLE `Habit` DROP COLUMN `updatedAt`;

-- Step 4: Rename the temporary column to updatedAt
ALTER TABLE `Habit` CHANGE COLUMN `updatedAt_temp` `updatedAt` INTEGER NOT NULL;

-- AlterTable: Convert updatedAt from DATETIME(3) to INTEGER for HabitLog table
-- Step 1: Add temporary INTEGER column
ALTER TABLE `HabitLog` ADD COLUMN `updatedAt_temp` INTEGER NOT NULL DEFAULT 0;

-- Step 2: Convert DATETIME values to Unix timestamp (seconds since epoch)
UPDATE `HabitLog` SET `updatedAt_temp` = UNIX_TIMESTAMP(`updatedAt`);

-- Step 3: Drop the old DATETIME column
ALTER TABLE `HabitLog` DROP COLUMN `updatedAt`;

-- Step 4: Rename the temporary column to updatedAt
ALTER TABLE `HabitLog` CHANGE COLUMN `updatedAt_temp` `updatedAt` INTEGER NOT NULL;
