CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`userId` text NOT NULL,
	`completed` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `todo_userId_idx` ON `todos` (`userId`);