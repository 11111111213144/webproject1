# 📦 ระบบการจัดซื้อ
## Procurement Management System

ระบบการจัดซื้อ พัฒนาด้วย Node.js, Express และ MySQL

---

## 👥 สมาชิกกลุ่ม

| ลำดับ | ชื่อ-นามสกุล | รหัสนิสิต | หน้าที่รับผิดชอบ |
|:---:|------------|:--------:|----------|
| 1 | นายธนภัทร บุญน้อม | 67021769 |Front-end|
| 2 | นายปฏิพัทธ์ เรือนทราย | 67021882 |Front-end|
| 3 | นายสหรัฐ กันยะมี | 67022287 |Back-end|
| 4 | นายสุวรรณภูมิ อินต๊ะยศ | 67022401 |Front-end|
| 5 | นายวชิรภัทร บุญมี | 67024931 |Back-end|


---

## 🛠️ เทคโนโลยีที่ใช้

| Technology | Version | Description |
|------------|---------|-------------|
| Node.js | - | JavaScript Runtime |
| Express | 5.2.1 | Web Framework |
| EJS | 4.0.1 | Template Engine |
| MySQL2 | 3.16.3 | Database Driver |
| bcrypt | 6.0.0 | Password Hashing |
| JWT | 9.0.3 | Authentication |

---


---

## ⚙️ การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd webproject
```

### 2. ติดตั้ง Library
```bash
npm install
```

### 3. สร้าง Database
- เปิด MySQL/MariaDB
- Import ไฟล์ `src/config/database.sql`

### 4. ตั้งค่า Environment Variables
สร้างไฟล์ `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=procurement_management_system
secret=your_jwt_secret
```

### 5. รันโปรเจค
```bash
npm run dev
```

เปิด Browser ไปที่ `http://localhost:3000`

---

## 🔐 ระบบ Login

| Role | เมื่อ Login สำเร็จ |
|------|-------------------|
| **Admin** | ไปหน้า `/admin_main` |
| **Member** | ไปหน้า `/homepage` |

---

## 📋 ฟีเจอร์หลัก

### 🏠 หน้าหลัก (Homepage)
- แสดงสรุปข้อมูลคลังสินค้า
- แสดงจำนวนแผนจัดซื้อ และใบสั่งซื้อ

### 📦 จัดการคลังสินค้า (Inventory)
- ดูรายการสินค้าทั้งหมด
- เพิ่ม/ลบ/แก้ไขสินค้า
- กรองสินค้าตามประเภท

### 📝 แผนจัดซื้อ (Plan)
- สร้างแผนจัดซื้อใหม่
- เพิ่มรายการสินค้าในแผน
- ดูรายละเอียดแผน

### 🧾 ใบสั่งซื้อ (Purchase Order)
- สร้างใบสั่งซื้อ
- เพิ่มรายการสินค้าในใบสั่งซื้อ
- ดูรายละเอียด PO

### 👨‍💼 Admin
- อนุมัติ/ปฏิเสธแผนจัดซื้อ
- อนุมัติ/ปฏิเสธใบสั่งซื้อ
- จัดการผู้ใช้งาน

---

## 📊 Database Tables

| Table | Description |
|-------|-------------|
| `user` | ข้อมูลผู้ใช้งาน |
| `inventory` | คลังสินค้า |
| `plan_header` | หัวแผนจัดซื้อ |
| `plan_detail` | รายละเอียดแผนจัดซื้อ |
| `po_header` | หัวใบสั่งซื้อ |
| `po_detail` | รายละเอียดใบสั่งซื้อ |

<img width="1307" height="857" alt="Untitled (2)" src="https://github.com/user-attachments/assets/b38a88db-5f10-40e4-b9bc-e654812f7dc7" />


---

## 🚀 Scripts

```bash
# Development (with nodemon)
npm run dev

# Browser Sync
npm run sync
```

---
