-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.1.2-MariaDB - MariaDB Server
-- Server OS:                    Win64
-- HeidiSQL Version:             12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for information_schema

-- Dumping database structure for procurement_management_system
CREATE DATABASE IF NOT EXISTS `procurement_management_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `procurement_management_system`;

-- Dumping structure for table procurement_management_system.inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `item_Id` int(11) NOT NULL AUTO_INCREMENT,
  `item_type` varchar(50) DEFAULT NULL,
  `item_name` varchar(100) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'หน่วย',
  `remain` int(11) DEFAULT 0,
  `unit_price` decimal(10,2) DEFAULT NULL,
  `Company_shop` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`item_Id`),
  UNIQUE KEY `item_name` (`item_name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table procurement_management_system.inventory: ~10 rows (approximately)
DELETE FROM `inventory`;
INSERT INTO `inventory` (`item_Id`, `item_type`, `item_name`, `unit`, `remain`, `unit_price`, `Company_shop`) VALUES
	(1, 'วัสดุสำนักงาน', 'กระดาษ A4 Double A (รีม)', 'รีม', 500, 125.00, 'Office Mate'),
	(2, 'วัสดุสำนักงาน', 'ปากกาลูกลื่นสีน้ำเงิน (ด้าม)', 'ด้าม', 200, 12.00, 'ร้านสมใจ'),
	(3, 'วัสดุสำนักงาน', 'แฟ้มเจาะกระดาษ (เล่ม)', 'เล่ม', 100, 45.00, 'Office Mate'),
	(4, 'วัสดุสำนักงาน', 'คลิปหนีบกระดาษดำ (กล่อง)', 'กล่อง', 300, 25.00, 'B2S'),
	(5, 'วัสดุคอมพิวเตอร์', 'เมาส์ไร้สาย Logitech', 'อัน', 50, 450.00, 'JIB Computer'),
	(6, 'วัสดุคอมพิวเตอร์', 'คีย์บอร์ด USB', 'อัน', 30, 350.00, 'Advice'),
	(7, 'วัสดุคอมพิวเตอร์', 'หมึกพิมพ์ HP 680 (ตลับ)', 'ตลับ', 20, 590.00, 'IT City'),
	(8, 'ครุภัณฑ์', 'เก้าอี้สำนักงานมีล้อ', 'ตัว', 10, 2500.00, 'Index Living Mall'),
	(9, 'วัสดุทำความสะอาด', 'น้ำยาถูพื้น (แกลลอน)', 'แกลลอน', 40, 180.00, 'Big C'),
	(10, 'วัสดุทำความสะอาด', 'กระดาษทิชชู่ม้วนใหญ่ (แพ็ค)', 'แพ็ค', 100, 150.00, 'Makro');

-- Dumping structure for table procurement_management_system.plan_detail
CREATE TABLE IF NOT EXISTS `plan_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_Id` int(11) NOT NULL,
  `item_Id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_Id` (`plan_Id`),
  KEY `item_Id` (`item_Id`),
  CONSTRAINT `1` FOREIGN KEY (`plan_Id`) REFERENCES `plan_header` (`plan_Id`) ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`item_Id`) REFERENCES `inventory` (`item_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table procurement_management_system.plan_detail: ~23 rows (approximately)
DELETE FROM `plan_detail`;
INSERT INTO `plan_detail` (`id`, `plan_Id`, `item_Id`, `quantity`) VALUES
	(1, 1, 1, 50),
	(2, 1, 2, 100),
	(3, 1, 3, 20),
	(4, 1, 4, 10),
	(5, 2, 1, 30),
	(6, 2, 7, 5),
	(7, 3, 5, 10),
	(8, 3, 6, 10),
	(9, 4, 9, 10),
	(10, 4, 10, 20),
	(11, 4, 1, 40),
	(12, 5, 8, 2),
	(13, 6, 1, 100),
	(14, 6, 2, 100),
	(15, 6, 3, 50),
	(16, 6, 4, 50),
	(17, 6, 8, 5),
	(18, 7, 9, 20),
	(19, 7, 10, 50),
	(20, 8, 2, 50),
	(21, 8, 1, 20),
	(22, 9, 7, 2),
	(23, 10, 9, 5);

-- Dumping structure for table procurement_management_system.plan_header
CREATE TABLE IF NOT EXISTS `plan_header` (
  `plan_Id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) DEFAULT NULL,
  `plan_date` date DEFAULT NULL,
  `plan_status` varchar(50) DEFAULT 'รออนุมัติ',
  PRIMARY KEY (`plan_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table procurement_management_system.plan_header: ~10 rows (approximately)
DELETE FROM `plan_header`;
INSERT INTO `plan_header` (`plan_Id`, `plan_name`, `plan_date`, `plan_status`) VALUES
	(1, 'แผนจัดซื้อประจำเดือน มกราคม', '2024-01-05', 'อนุมัติแล้ว'),
	(2, 'แผนจัดซื้อประจำเดือน กุมภาพันธ์', '2024-02-01', 'อนุมัติแล้ว'),
	(3, 'แผนจัดซื้อด่วน (อุปกรณ์คอมพิวเตอร์)', '2024-02-10', 'อนุมัติแล้ว'),
	(4, 'แผนจัดซื้อประจำเดือน มีนาคม', '2024-03-01', 'รออนุมัติ'),
	(5, 'แผนซ่อมบำรุงสำนักงาน', '2024-03-15', 'รอตรวจสอบ'),
	(6, 'แผนจัดซื้อครุภัณฑ์ประจำปี', '2024-01-15', 'ไม่อนุมัติ'),
	(7, 'แผนจัดซื้อวัสดุสิ้นเปลือง Q1', '2024-01-20', 'อนุมัติแล้ว'),
	(8, 'แผนเตรียมงานสัมมนา', '2024-04-01', 'ร่างแผน'),
	(9, 'แผนจัดซื้อประจำเดือน เมษายน', '2024-04-05', 'ร่างแผน'),
	(10, 'แผนฉุกเฉิน (น้ำยาทำความสะอาด)', '2024-04-10', 'รออนุมัติ');

-- Dumping structure for table procurement_management_system.user
CREATE TABLE IF NOT EXISTS `user` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(100) NOT NULL DEFAULT '0',
  `userPass` varchar(100) NOT NULL DEFAULT '0',
  `Fname` varchar(100) DEFAULT NULL,
  `Lname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userName` (`userName`,`Fname`),
  UNIQUE KEY `Lname` (`Lname`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Dumping data for table procurement_management_system.user: ~4 rows (approximately)
DELETE FROM `user`;
INSERT INTO `user` (`userId`, `userName`, `userPass`, `Fname`, `Lname`, `email`, `phone`, `role`) VALUES
	(1, 'jon', '1234', 'Somluck', 'Jaiyai', 'Kfso@gmail.com', '0864317996', 'member'),
	(2, 'joe2', '1234', 'Suwannapom', 'Jailek', '1234@gmail.com ', '000000000', 'admin'),
	(17, 'jon', '$2b$12$lCzgBtMcGKPZpnwvpYQequmZTLhUNEbSOP3Qltq.nr8KCnmoIXfAu', 'ศุภากิต ', 'จอมพลัง', 'wachirapatboonmee@gmail.com', '12355', 'member'),
	(20, 'Thepeekai', '$2b$12$vgG1huEmjwpR3zJ/kVvwkec6LgAWpbTp3l64eNaJ9r9FbtlEit9K.', 'ศุภากิต ', 'กันจอมพลัง', '0864317996@dqwewqw', '123456', 'member');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
