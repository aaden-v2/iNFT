create database `NFTADS`;

USE `NFTADS`;

CREATE TABLE `t_users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `user_data` text COMMENT 'user_data',
  `address` varchar(1024) DEFAULT NULL COMMENT 'EOA address',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 yes 0 no',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_tokens` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `images_content` text COMMENT 'images_content',
  `description` text COMMENT 'description json',
  `token_ipfs_url` varchar(1024) DEFAULT NULL COMMENT 'token ipfs_url',
  `img_ipfs_url` varchar(1024) DEFAULT NULL COMMENT 'img ipfs_url',
  `creator_address` varchar(1024) DEFAULT NULL COMMENT 'creator EOA address',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 yes 0 no',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
