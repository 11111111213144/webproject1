-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               5.7.17-log - MySQL Community Server (GPL)
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


-- Dumping database structure for procurement_management_system
CREATE DATABASE IF NOT EXISTS `procurement_management_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `procurement_management_system`;

-- Dumping structure for table procurement_management_system.inventory
CREATE TABLE IF NOT EXISTS `inventory` (
  `item_Id` int(11) NOT NULL AUTO_INCREMENT,
  `item_type` varchar(50) DEFAULT NULL,
  `item_name` varchar(100) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'หน่วย',
  `remain` int(11) DEFAULT '0',
  `unit_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`item_Id`),
  UNIQUE KEY `idx_unique_item_name` (`item_name`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.inventory: ~2 rows (approximately)
INSERT INTO `inventory` (`item_Id`, `item_type`, `item_name`, `unit`, `remain`, `unit_price`) VALUES
	(22, 'วัสดุ', 'ยางลบ', 'รีม', 4, 100.00),
	(23, 'วัสดุ', 'กระดาษทราย', 'รีม', 4, 100.00);

-- Dumping structure for table procurement_management_system.plan_detail
CREATE TABLE IF NOT EXISTS `plan_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_Id` int(11) NOT NULL,
  `item_Id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_plan_detail_header` (`plan_Id`),
  KEY `fk_plan_detail_inventory` (`item_Id`),
  CONSTRAINT `fk_plan_detail_header` FOREIGN KEY (`plan_Id`) REFERENCES `plan_header` (`plan_Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_plan_detail_inventory` FOREIGN KEY (`item_Id`) REFERENCES `inventory` (`item_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.plan_detail: ~1 rows (approximately)

-- Dumping structure for table procurement_management_system.plan_header
CREATE TABLE IF NOT EXISTS `plan_header` (
  `plan_Id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_name` varchar(100) DEFAULT NULL,
  `plan_date` date DEFAULT NULL,
  `plan_status` varchar(50) DEFAULT 'รออนุมัติ',
  `item_plan` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`plan_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.plan_header: ~20 rows (approximately)
INSERT INTO `plan_header` (`plan_Id`, `plan_name`, `plan_date`, `plan_status`, `item_plan`) VALUES
	(11, 'แผนจัดซื้อวัสดุสำนักงาน ม.ค.', '2567-01-15', 'อนุมัติแล้ว', 'วัสดุ'),
	(12, 'แผนจัดซื้อครุภัณฑ์คอมพิวเตอร์ ก.พ.', '2567-02-10', 'อนุมัติแล้ว', 'ครุภัณฑ์'),
	(13, 'แผนจัดซื้อวัสดุสิ้นเปลือง มี.ค.', '2567-03-05', 'อนุมัติแล้ว', 'วัสดุ'),
	(14, 'แผนจัดซื้ออุปกรณ์ทำความสะอาด เม.ย.', '2567-04-20', 'อนุมัติแล้ว', 'วัสดุ'),
	(15, 'แผนจัดซื้อวัสดุงานบ้านงานครัว พ.ค.', '2567-05-12', 'อนุมัติแล้ว', 'วัสดุ'),
	(16, 'แผนซ่อมบำรุงเครื่องปรับอากาศ มิ.ย.', '2567-06-18', 'อนุมัติแล้ว', 'บริการ'),
	(17, 'แผนจัดซื้อหมึกพิมพ์และกระดาษ ก.ค.', '2567-07-01', 'อนุมัติแล้ว', 'วัสดุ'),
	(18, 'แผนจัดซื้อเวชภัณฑ์สามัญ ส.ค.', '2567-08-15', 'อนุมัติแล้ว', 'เวชภัณฑ์'),
	(19, 'แผนจัดซื้อวัสดุไฟฟ้าและวิทยุ ก.ย.', '2567-09-10', 'อนุมัติแล้ว', 'วัสดุ'),
	(20, 'แผนจัดซื้อวัสดุก่อสร้าง ต.ค.', '2567-10-05', 'อนุมัติแล้ว', 'วัสดุ'),
	(21, 'แผนจัดซื้อเครื่องเขียน พ.ย.', '2567-11-20', 'อนุมัติแล้ว', 'วัสดุ'),
	(22, 'แผนจัดซื้อของขวัญปีใหม่ ธ.ค.', '2567-12-15', 'อนุมัติแล้ว', 'วัสดุ'),
	(23, 'แผนจัดซื้อวัสดุสำนักงาน ม.ค.', '2568-01-10', 'รออนุมัติ', 'วัสดุ'),
	(24, 'แผนจัดซื้อครุภัณฑ์ห้องประชุม ก.พ.', '2568-02-14', 'รออนุมัติ', 'ครุภัณฑ์'),
	(25, 'แผนจัดซื้อวัสดุคอมพิวเตอร์ มี.ค.', '2568-03-01', 'รออนุมัติ', 'วัสดุ'),
	(26, 'แผนจัดซื้อวัสดุงานบ้านงานครัว เม.ย.', '2568-04-10', 'รออนุมัติ', 'วัสดุ'),
	(27, 'แผนจ้างเหมาบริการบำรุงรักษา พ.ค.', '2568-05-05', 'รออนุมัติ', 'บริการ'),
	(28, 'แผนจัดซื้อวัสดุเชื้อเพลิง มิ.ย.', '2568-06-01', 'รออนุมัติ', 'วัสดุ'),
	(29, 'แผนจัดซื้อวัสดุการเกษตร ก.ค.', '2568-07-15', 'รออนุมัติ', 'วัสดุ'),
	(30, 'แผนจัดซื้อวัสดุวิทยาศาสตร์ ส.ค.', '2568-08-20', 'รออนุมัติ', 'วัสดุ'),
	(31, '123412', '2026-02-21', 'รออนุมัติ', 'ครุภัณฑ์');

-- Dumping structure for table procurement_management_system.po_detail
CREATE TABLE IF NOT EXISTS `po_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_Id` int(11) NOT NULL,
  `item_Id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `agreed_price` decimal(10,2) DEFAULT NULL,
  `ref_plan_detail_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_po_detail_header` (`po_Id`),
  KEY `fk_po_detail_inventory` (`item_Id`),
  CONSTRAINT `fk_po_detail_header` FOREIGN KEY (`po_Id`) REFERENCES `po_header` (`po_Id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_detail_inventory` FOREIGN KEY (`item_Id`) REFERENCES `inventory` (`item_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.po_detail: ~0 rows (approximately)

-- Dumping structure for table procurement_management_system.po_header
CREATE TABLE IF NOT EXISTS `po_header` (
  `po_Id` int(11) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `po_date` date NOT NULL,
  `supplier_name` varchar(50) DEFAULT NULL,
  `po_status` varchar(50) DEFAULT 'รอส่งใบสั่งซื้อ',
  PRIMARY KEY (`po_Id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.po_header: ~0 rows (approximately)
INSERT INTO `po_header` (`po_Id`, `po_number`, `po_date`, `supplier_name`, `po_status`) VALUES
	(20, 'PO-0001', '2026-02-12', 'Office Mate', 'รอส่งใบสั่งซื้อ');

-- Dumping structure for table procurement_management_system.user
CREATE TABLE IF NOT EXISTS `user` (
  `userId` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(100) NOT NULL,
  `userPass` varchar(255) NOT NULL,
  `Fname` varchar(100) DEFAULT NULL,
  `Lname` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  PRIMARY KEY (`userId`),
  UNIQUE KEY `idx_unique_username` (`userName`),
  UNIQUE KEY `idx_unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table procurement_management_system.user: ~5 rows (approximately)
INSERT INTO `user` (`userId`, `userName`, `userPass`, `Fname`, `Lname`, `email`, `phone`, `role`) VALUES
	(17, 'jon', '$2b$12$lCzgBtMcGKPZpnwvpYQequmZTLhUNEbSOP3Qltq.nr8KCnmoIXfAu', 'ศุภากิต', 'จอมพลัง', 'wachirapatboonmee@gmail.com', '12355', 'member'),
	(18, 'p', '$2b$12$H/wDqC2CyjeUefxkCiu.vOKwZlrzXYmLur0r7orfA8LBoHLCFqCyy', 'Suwannapum Intayos', '12312', 'seahiter.esports@gmail.com', '0830128650', 'member'),
	(21, 'joe2', '$2b$12$pStKHtuwumt2cfs1dJa7y.gruooxmXT71eGUkqHVJF.59me0YIP4m', 'asdf', 'asdf', 'asdfasdsadf@gmail.com', '0830128650', 'admin'),
	(23, 'p1', '$2b$12$KRhoRpr6jveS3AH.LiNFwOIbjVjo5YayijBCuXn8NJ/NfM9gPFhta', 'asdf', 'asdf', 'asdfasdsaasdfsddf@gmail.com', '0830128650', 'member'),
	(27, 'joe', '$2b$12$8YLcCHyhheGa4ZF7oNQLO.Mg2ydrcDMMKKevY2j2jEiRnRqPEoS5K', 'asd', 'asdf', 'sdfs@gmail.com', '3534534', 'member');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
