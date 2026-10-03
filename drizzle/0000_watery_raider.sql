CREATE TABLE `crminvoice` (
	`id` text PRIMARY KEY NOT NULL,
	`propertyid` text NOT NULL,
	`companycommission` integer NOT NULL,
	`govttax` text NOT NULL,
	`discount` text NOT NULL,
	`totalammount` text NOT NULL,
	`createdby` text NOT NULL,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customer` (
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
	`createdby` text NOT NULL,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `property` (
	`refname` text NOT NULL,
	`refnumber` text NOT NULL,
	`refemail` text NOT NULL,
	`refaddress` text NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`price` numeric NOT NULL,
	`minprice` numeric NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`country` text NOT NULL,
	`bathrooms` integer NOT NULL,
	`bedrooms` integer NOT NULL,
	`area` numeric NOT NULL,
	`garages` integer NOT NULL,
	`images` text NOT NULL,
	`salescustomerid` text NOT NULL,
	`buyercustomerid` text NOT NULL,
	`createdby` text NOT NULL,
	`closedby` text NOT NULL,
	`closedprice` numeric NOT NULL,
	`closeddate` text NOT NULL,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`phone` text NOT NULL,
	`country` text NOT NULL,
	`created_at` text,
	`status` text DEFAULT 'Active' NOT NULL
);
