CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`remarks` text NOT NULL,
	`next_followup_date` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action
);
