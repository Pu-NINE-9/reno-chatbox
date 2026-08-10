CREATE TABLE `conversations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL DEFAULT '新对话',
	`model_name` varchar(100) NOT NULL DEFAULT 'deepseek-v4-pro',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`conversation_id` bigint NOT NULL,
	`role` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`age` int NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `upload_file` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`file_name` varchar(300) NOT NULL,
	`suffix` varchar(50),
	`raw_text` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `upload_file_id` PRIMARY KEY(`id`)
);
