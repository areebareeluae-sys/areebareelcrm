PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`remarks` text NOT NULL,
	`next_followup_date` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`customer_id`) REFERENCES `leadcustomer`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_leads`("id", "customer_id", "remarks", "next_followup_date", "status", "created_by", "created_at") SELECT "id", "customer_id", "remarks", "next_followup_date", "status", "created_by", "created_at" FROM `leads`;--> statement-breakpoint
DROP TABLE `leads`;--> statement-breakpoint
ALTER TABLE `__new_leads` RENAME TO `leads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;