CREATE TABLE `clinic_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clinicId` int NOT NULL,
	`userClinicRole` enum('owner','admin','staff') NOT NULL DEFAULT 'staff',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinic_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_clinic_unique` UNIQUE(`userId`,`clinicId`)
);
--> statement-breakpoint
CREATE TABLE `clinics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`subdomain` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`address` text,
	`logo` varchar(500),
	`description` text,
	`ownerId` int NOT NULL,
	`planId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinics_id` PRIMARY KEY(`id`),
	CONSTRAINT `clinics_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `clinics_subdomain_unique` UNIQUE(`subdomain`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`maxDoctors` int NOT NULL DEFAULT 5,
	`maxAppointmentsPerMonth` int NOT NULL DEFAULT 1000,
	`features` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','superadmin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `appointments` ADD `clinicId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `doctor_time_slots` ADD `clinicId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `doctors` ADD `clinicId` int NOT NULL;--> statement-breakpoint
CREATE INDEX `clinic_users_clinic_idx` ON `clinic_users` (`clinicId`);--> statement-breakpoint
CREATE INDEX `clinic_users_user_idx` ON `clinic_users` (`userId`);--> statement-breakpoint
CREATE INDEX `subdomain_idx` ON `clinics` (`subdomain`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `clinics` (`slug`);--> statement-breakpoint
CREATE INDEX `clinic_owner_idx` ON `clinics` (`ownerId`);--> statement-breakpoint
CREATE INDEX `appointments_clinic_idx` ON `appointments` (`clinicId`);--> statement-breakpoint
CREATE INDEX `appointments_phone_idx` ON `appointments` (`patientPhone`);--> statement-breakpoint
CREATE INDEX `appointments_date_idx` ON `appointments` (`appointmentDate`);--> statement-breakpoint
CREATE INDEX `slots_clinic_idx` ON `doctor_time_slots` (`clinicId`);--> statement-breakpoint
CREATE INDEX `slots_doctor_idx` ON `doctor_time_slots` (`doctorId`);--> statement-breakpoint
CREATE INDEX `doctors_clinic_idx` ON `doctors` (`clinicId`);