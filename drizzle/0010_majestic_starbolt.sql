CREATE TABLE `leadcustomer` (
	`refname` text NOT NULL,
	`refnumber` text NOT NULL,
	`refemail` text NOT NULL,
	`refaddress` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`fullname` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`country` text NOT NULL,
	`city` text NOT NULL,
	`address` text NOT NULL,
	`tags` text NOT NULL,
	`createdby` text NOT NULL,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
