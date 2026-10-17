ALTER TABLE `leadcustomer` ADD `next_followup_date` text NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` DROP COLUMN `next_followup_date`;