CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`propertyid` text NOT NULL,
	`property_id` integer NOT NULL,
	`action` text NOT NULL,
	`details` text NOT NULL,
	`performed_by` text NOT NULL,
	`created_at` text
);
