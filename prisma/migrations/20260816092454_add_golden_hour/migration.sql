-- AlterTable
ALTER TABLE `court` ADD COLUMN `goldenDiscount` INTEGER NULL DEFAULT 0,
    ADD COLUMN `goldenHourEnd` VARCHAR(191) NULL,
    ADD COLUMN `goldenHourStart` VARCHAR(191) NULL;
