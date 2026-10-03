CREATE TABLE `security_guards` (
	`id` text PRIMARY KEY NOT NULL,
	`building_no` integer NOT NULL,
	`building_name` text NOT NULL,
	`security_guard` text NOT NULL,
	`contact_number` text NOT NULL,
	`construction_status` text NOT NULL,
	`tags` text DEFAULT '',
	`created_at` text
);
--> statement-breakpoint
ALTER TABLE `property` ALTER COLUMN "Purchaseorderid" TO "Purchaseorderid" text DEFAULT '';