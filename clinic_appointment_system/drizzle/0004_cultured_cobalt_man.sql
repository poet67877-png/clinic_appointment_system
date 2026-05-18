CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`bankName` varchar(255) NOT NULL,
	`accountHolderName` varchar(255) NOT NULL,
	`accountNumber` varchar(50) NOT NULL,
	`iban` varchar(50),
	`isDefault` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`subscriptionId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`amount` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'IQD',
	`invoiceStatus` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issueDate` timestamp NOT NULL,
	`dueDate` timestamp NOT NULL,
	`paidDate` timestamp,
	`bankDetails` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`clinicId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentMethod` enum('bank_transfer','cash','check') NOT NULL,
	`transactionId` varchar(100),
	`bankName` varchar(255),
	`accountNumber` varchar(50),
	`notes` text,
	`paymentStatus` enum('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clinicId` int NOT NULL,
	`planId` int NOT NULL,
	`subscriptionStatus` enum('trial','active','paused','cancelled') NOT NULL DEFAULT 'trial',
	`trialStartDate` timestamp NOT NULL,
	`trialEndDate` timestamp NOT NULL,
	`subscriptionStartDate` timestamp,
	`subscriptionEndDate` timestamp,
	`autoRenew` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_clinicId_unique` UNIQUE(`clinicId`)
);
--> statement-breakpoint
CREATE INDEX `bank_accounts_clinic_idx` ON `bank_accounts` (`clinicId`);--> statement-breakpoint
CREATE INDEX `invoices_clinic_idx` ON `invoices` (`clinicId`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`invoiceStatus`);--> statement-breakpoint
CREATE INDEX `invoices_due_date_idx` ON `invoices` (`dueDate`);--> statement-breakpoint
CREATE INDEX `payments_invoice_idx` ON `payments` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `payments_clinic_idx` ON `payments` (`clinicId`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`paymentStatus`);--> statement-breakpoint
CREATE INDEX `subscriptions_clinic_idx` ON `subscriptions` (`clinicId`);--> statement-breakpoint
CREATE INDEX `subscriptions_plan_idx` ON `subscriptions` (`planId`);