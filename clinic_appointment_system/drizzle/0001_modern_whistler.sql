CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`confirmationCode` varchar(20) NOT NULL,
	`doctorId` int NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`patientPhone` varchar(20) NOT NULL,
	`appointmentDate` date NOT NULL,
	`appointmentTime` time NOT NULL,
	`status` enum('معلق','مؤكد','ملغى') NOT NULL DEFAULT 'معلق',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`),
	CONSTRAINT `appointments_confirmationCode_unique` UNIQUE(`confirmationCode`)
);
--> statement-breakpoint
CREATE TABLE `doctor_time_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`doctorId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` time NOT NULL,
	`endTime` time NOT NULL,
	`slotDurationMinutes` int NOT NULL DEFAULT 30,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctor_time_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`specialty` varchar(255) NOT NULL,
	`phone` varchar(20),
	`email` varchar(320),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `doctors_id` PRIMARY KEY(`id`)
);
