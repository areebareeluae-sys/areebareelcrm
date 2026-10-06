CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`entity_id` text NOT NULL,
	`file_url` text NOT NULL,
	`title` text,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
