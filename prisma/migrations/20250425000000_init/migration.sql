-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `libraryName` VARCHAR(191) NOT NULL,
    `setupCompleted` BOOLEAN NOT NULL DEFAULT false,
    `theme` VARCHAR(191) NULL DEFAULT 'system',
    `language` VARCHAR(191) NULL DEFAULT 'en',
    `autoBackup` BOOLEAN NOT NULL DEFAULT false,
    `lastAutoBackup` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Game` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `background_image` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `released` VARCHAR(191) NULL,
    `metacritic` INTEGER NULL,
    `rating` DOUBLE NULL,
    `ratings_count` INTEGER NULL,
    `status` VARCHAR(191) NULL DEFAULT 'Not Started',
    `userRating` INTEGER NULL,
    `userNotes` TEXT NULL,
    `solutions` TEXT NULL,
    `favorite` BOOLEAN NOT NULL DEFAULT false,
    `addedDate` DATETIME(3) NOT NULL,
    `lastModified` DATETIME(3) NOT NULL,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `playTime` INTEGER NULL,
    `completionPercentage` INTEGER NULL,
    `wishlist` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Genre` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Platform` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlaySession` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,
    `gameId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GameToGenre` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GameToGenre_AB_unique`(`A`, `B`),
    INDEX `_GameToGenre_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GameToPlatform` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GameToPlatform_AB_unique`(`A`, `B`),
    INDEX `_GameToPlatform_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_GameToTag` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_GameToTag_AB_unique`(`A`, `B`),
    INDEX `_GameToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlaySession` ADD CONSTRAINT `PlaySession_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `Game`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToGenre` ADD CONSTRAINT `_GameToGenre_A_fkey` FOREIGN KEY (`A`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToGenre` ADD CONSTRAINT `_GameToGenre_B_fkey` FOREIGN KEY (`B`) REFERENCES `Genre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToPlatform` ADD CONSTRAINT `_GameToPlatform_A_fkey` FOREIGN KEY (`A`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToPlatform` ADD CONSTRAINT `_GameToPlatform_B_fkey` FOREIGN KEY (`B`) REFERENCES `Platform`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToTag` ADD CONSTRAINT `_GameToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Game`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GameToTag` ADD CONSTRAINT `_GameToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE; 