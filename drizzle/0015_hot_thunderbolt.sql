CREATE TABLE `dealeruserscrm` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`cnic_number` text NOT NULL,
	`phone_number` text NOT NULL,
	`company_name` text NOT NULL,
	`company_address` text NOT NULL,
	`front_cnic_image` text NOT NULL,
	`back_cnic_image` text NOT NULL,
	`password` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `dealeruserscrm_email_unique` ON `dealeruserscrm` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `dealeruserscrm_cnic_number_unique` ON `dealeruserscrm` (`cnic_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `dealeruserscrm_phone_number_unique` ON `dealeruserscrm` (`phone_number`);