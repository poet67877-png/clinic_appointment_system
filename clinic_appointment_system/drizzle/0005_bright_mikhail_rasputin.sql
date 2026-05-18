CREATE TABLE `clinic_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`adminId` int NOT NULL,
	`note` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinic_notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `clinic_notes_clinic_idx` ON `clinic_notes` (`clinicId`);--> statement-breakpoint
CREATE INDEX `clinic_notes_admin_idx` ON `clinic_notes` (`adminId`);