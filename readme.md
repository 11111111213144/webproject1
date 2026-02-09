# 📦 ระบบการจัดซื้อ
## Procurement Management System

ระบบการจัดซื้อ พัฒนาด้วย Node.js, Express และ MySQL

---

## 👥 สมาชิกกลุ่ม

| ลำดับ | ชื่อ-นามสกุล | รหัสนิสิต |
|:---:|------------|:--------:|
| 1 | นายธนภัทร บุญน้อม | 67021769 |
| 2 | นายสหรัฐ กันยะมี | 67022287 |
| 3 | นายสุวรรณภูมิ อินต๊ะยศ | 67022401 |
| 4 | นายวชิรภัทร บุญมี | 67024931 |

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

## 📁 โครงสร้างโปรเจค

```
webproject/
├── database/           # Database files
│   └── database.sql    # SQL Schema
├── public/             # Views (EJS templates)
│   ├── css/            # Stylesheets
│   ├── test/           # Test pages
│   └── *.ejs           # EJS templates
├── route/              # Express routes
│   ├── auth.js         # Authentication middleware
│   ├── member.js       # User routes
│   ├── bth_inventory.js # Inventory routes
│   ├── bth_po.js       # Purchase Order routes
│   └── bth_create_plan.js # Plan routes
├── index.js            # Main entry point
├── package.json        # Dependencies
└── .env                # Environment variables
```

---

## ⚙️ การติดตั้ง

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd webproject
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. สร้าง Database
- เปิด MySQL/MariaDB
- Import ไฟล์ `database/database.sql`

### 4. รันโปรเจค
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
- เมื่ออัปเดตสถานะ PO เป็น "รับของแล้ว" ระบบจะอัปเดตคงคลังอัตโนมัติ

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

---

## 🚀 Scripts

```bash
# Development (with nodemon)
npm run dev

# Browser Sync
npm run sync
```

---
