let tempItems = []; // เก็บรายการชั่วคราวเหมือนเดิม

// ข้อมูลจำลอง 3 รูปแบบ
let mainTableItems = [
    // 1. แบบรายปี (Yearly)
    {
        index: 0,
        type: "yearly",
        year: "2567",
        month: "",      // ไม่ใช้สำหรับรายปี
        date: "",       // ไม่ใช้สำหรับรายปี
        material: "วัสดุสำนักงาน",
        items: [
            { name: "กระดาษ A4 Double A", qty: 500, price: 115, total: 57500 },
            { name: "ปากกาลูกลื่น (น้ำเงิน)", qty: 200, price: 12, total: 2400 },
            { name: "แฟ้มสันกว้าง", qty: 100, price: 45, total: 4500 }
        ]
    },

    // 2. แบบรายเดือน (Monthly) - ระบุเดือน
    {
        index: 1,
        type: "monthly",
        year: "2567",
        month: "ต.ค.",  // เดือนตุลาคม
        date: "",
        material: "วัสดุงานบ้านงานเรือน",
        items: [
            { name: "น้ำยาถูพื้น (แกลลอน)", qty: 20, price: 250, total: 5000 },
            { name: "ถุงดำขยะ (แพ็ค)", qty: 50, price: 35, total: 1750 }
        ]
    },

    // 3. แบบนอกแผน (Outplan) - ระบุวันที่
    {
        index: 2,
        type: "outplan",
        year: "2567",
        month: "",
        date: "2024-03-15", // วันที่แบบ YYYY-MM-DD (สำหรับ input type="date")
        material: "วัสดุไฟฟ้าและวิทยุ",
        items: [
            { name: "หลอดไฟ LED 18W", qty: 10, price: 180, total: 1800 },
            { name: "สายไฟ VAF 2x1.5", qty: 2, price: 1200, total: 2400 }
        ]
    },
];

// ฟังก์ชันสำหรับวาดตารางหลักจากข้อมูลที่มีอยู่ (Mock Data)
function renderMainTable() {
    const tbody = document.getElementById('mainTableBody');
    if (!tbody) return; // ถ้าหาตารางไม่เจอให้หยุด

    let html = '';

    mainTableItems.forEach((data, index) => {
        // 1. จัดการเรื่องการแสดงผล วัน/เดือน/ปี และ Badge สี
        let displayTime = data.year; 
        let displayTypeBadge = '<span class="badge bg-primary">รายปี</span>';

        if (data.type === 'monthly') {
            displayTime = `${data.month} ${data.year}`;
            displayTypeBadge = '<span class="badge bg-success">รายเดือน</span>';
        } else if (data.type === 'outplan') {
            // แปลงวันที่เป็นรูปแบบไทย
            const dateParts = data.date.split('-'); // แยกปี-เดือน-วัน
            if (dateParts.length === 3) {
                 displayTime = `${dateParts[2]}/${dateParts[1]}/${parseInt(dateParts[0]) + 543}`; // แปลงเป็น พ.ศ.
            } else {
                 displayTime = data.date;
            }
            displayTypeBadge = '<span class="badge bg-danger">นอกแผน</span>';
        }

        // 2. เช็คสถานะการลบ (ถ้ามี logic นี้)
        const activeClass = (typeof isDeleteMode !== 'undefined' && isDeleteMode) ? 'active' : '';

        // 3. สร้าง HTML ของแถวนั้น
        html += `
            <tr>
                <td class="checkbox-col ${activeClass}">
                     <input type="checkbox" class="delete-checkbox form-check-input"> 
                </td>
                <th scope="row">${index + 1}</th>
                <td>${displayTime} <br> <small>${displayTypeBadge}</small></td>
                <td>${data.material}</td>
                <td>
                    <button type="button" class="btn btn-info btn-sm" onclick="showDetails(${index})">
                        รายละเอียด
                    </button>
                </td>
            </tr>
        `;
    });

    // 4. เอา HTML ที่สร้างเสร็จไปใส่ในตาราง
    tbody.innerHTML = html;
}

// *** สำคัญมาก: สั่งให้ทำงานทันทีเมื่อโหลดไฟล์ ***
renderMainTable();
const m1 = new bootstrap.Modal(document.getElementById('planModal'));
const m2 = new bootstrap.Modal(document.getElementById('itemModal'));
const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal') || createDetailsModal());
// เปิดหน้าแรก
function openPlanModal() { m1.show(); }

// ย้อนกลับ
function backToPlan() { m2.hide(); m1.show(); }

// ไปหน้าสอง
function goToItems() {
    const type = document.getElementById('planType').value;
    const year = document.getElementById('inYear').value;
    
    // 1. เช็คปี (ต้องมีทุกกรณี)
    if (!year) return alert('กรุณาระบุปีงบประมาณ');

    // 2. เช็คเดือน (กรณีรายเดือน)
    if (type === 'monthly') {
        if (!document.getElementById('inMonth').value) return alert('กรุณาระบุเดือน');
    }

    // 3. เช็ควันที่ (กรณีนอกแผน)
    if (type === 'outplan') {
        if (!document.getElementById('inDate').value) return alert('กรุณาระบุวันที่');
    }

    m1.hide(); 
    m2.show();
}

// คำนวณราคารวมอัตโนมัติขณะพิมพ์
function autoSum() {
    const q = document.getElementById('addItemQty').value || 0;
    const p = document.getElementById('addItemPrice').value || 0;
    document.getElementById('addItemTotal').value = (q * p).toLocaleString();
}

// เพิ่มรายการลงตารางตรวจสอบ (ตารางชั่วคราว)
function addItemToTemp() {
    const name = document.getElementById('addItemName').value;
    const qty = document.getElementById('addItemQty').value;
    const price = document.getElementById('addItemPrice').value;

    if (!name || !price) return alert('กรุณากรอกข้อมูลให้ครบ');

    tempItems.push({ name, qty, price, total: qty * price });
    renderTemp();

    // ล้างช่องกรอก
    document.getElementById('addItemName').value = '';
    document.getElementById('addItemPrice').value = '';
    document.getElementById('addItemTotal').value = '';
}

// วาดตารางชั่วคราว
function renderTemp() {
    const tbody = document.querySelector('#tempTable tbody');
    tbody.innerHTML = tempItems.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="text-start">${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${Number(item.price).toLocaleString()}</td>
                    <td>${item.total.toLocaleString()}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="removeTemp(${index})">ลบ</button></td>
                </tr>
            `).join('');
}

// ลบรายการออกจากตารางชั่วคราว
function removeTemp(idx) {
    if (confirm('ยืนยันการลบรายการนี้?')) {
        tempItems.splice(idx, 1);
        renderTemp();
    }
}

// แสดงรายละเอียดข้อมูล
function showDetails(dataIndex) {
    const data = mainTableItems[dataIndex];
    if (!data) return alert('ไม่พบข้อมูล');

    // ... (ส่วน render ตารางสินค้า เหมือนเดิม) ...
    const detailsBody = document.querySelector('#detailsTableBody');
    detailsBody.innerHTML = data.items.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td class="text-start">${item.name}</td>
            <td>${item.qty}</td>
            <td>${Number(item.price).toLocaleString()}</td>
            <td>${item.total.toLocaleString()}</td>
        </tr>
    `).join('');

    // ** ส่วนที่ปรับปรุง: การแสดงหัวข้อ **
    let timeInfo = `ปี ${data.year}`;
    if (data.type === 'monthly') {
        timeInfo = `เดือน ${data.month} ปี ${data.year}`;
    } else if (data.type === 'outplan') {
        timeInfo = `วันที่ ${data.date} (ปีงบ ${data.year})`;
    }

    // อัปเดตข้อความใน Modal
    document.getElementById('detailsYear').textContent = timeInfo;
    document.getElementById('detailsMaterial').textContent = data.material;
    
    detailsModal.show();
}

// สร้าง Modal แสดงรายละเอียดถ้ายังไม่มี
function createDetailsModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'detailsModal';
    modalDiv.className = 'modal fade';
    modalDiv.innerHTML = `
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">รายละเอียดแผนจัดซื้อ</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>ปี พ.ศ.:</strong> <span id="detailsYear"></span></p>
                            <p><strong>วัสดุอุปกรณ์:</strong> <span id="detailsMaterial"></span></p>
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ลำดับ</th>
                                        <th>ชื่อวัสดุ/อุปกรณ์</th>
                                        <th>จำนวน</th>
                                        <th>ราคา</th>
                                        <th>รวม</th>
                                    </tr>
                                </thead>
                                <tbody id="detailsTableBody"></tbody>
                            </table>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
                        </div>
                    </div>
                </div>
            `;
    document.body.appendChild(modalDiv);
    return document.getElementById('detailsModal');
}


// ตกลงยืนยัน -> ข้อมูลเด้งไปตารางหลัก
function confirmToMain() {
    if (tempItems.length === 0) return alert('ยังไม่มีรายการสินค้า');

    const mainTbody = document.querySelector('#mainTable tbody');
    const rowCount = mainTbody.rows.length + 1;
    
    // ดึงค่าจาก Form
    const type = document.getElementById('planType').value;
    const year = document.getElementById('inYear').value;
    const mat = document.getElementById('selMat').value;
    const month = document.getElementById('inMonth').value; // ค่าเดือน (ถ้ามี)
    const fullDate = document.getElementById('inDate').value; // ค่าวันที่ (ถ้ามี)

    // สร้างข้อความที่จะโชว์ในตาราง (Display Text)
    let displayTime = year; // ค่าเริ่มต้นคือแสดงแค่ปี
    let displayTypeBadge = '<span class="badge bg-primary">รายปี</span>';

    if (type === 'monthly') {
        displayTime = `${month} ${year}`;
        displayTypeBadge = '<span class="badge bg-success">รายเดือน</span>';
    } else if (type === 'outplan') {
        // แปลงวันที่เป็น format ไทย (เช่น 15/02/2567)
        const dateObj = new Date(fullDate);
        const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${parseInt(year)}`; 
        displayTime = dateStr;
        displayTypeBadge = '<span class="badge bg-danger">นอกแผน</span>';
    }

    const activeClass = (typeof isDeleteMode !== 'undefined' && isDeleteMode) ? 'active' : '';

    const newRow = `
        <tr>
            <td class="checkbox-col ${activeClass}">
                <input type="checkbox" class="delete-checkbox form-check-input">
            </td>
            <th scope="row">${rowCount}</th>
            <td>${displayTime} <br> <small>${displayTypeBadge}</small></td> 
            <td>${mat}</td>
            <td><button type="button" class="btn btn-info btn-sm" onclick="showDetails(${mainTableItems.length})">รายละเอียด</button></td>
        </tr>
    `;

    // บันทึกข้อมูลลง Array (เก็บ object ให้ละเอียดขึ้น)
    mainTableItems.push({
        index: mainTableItems.length,
        type: type,      // เก็บประเภท
        year: year,      // เก็บปี
        month: month,    // เก็บเดือน (ถ้ามี)
        date: fullDate,  // เก็บวันที่ (ถ้ามี)
        material: mat,
        items: JSON.parse(JSON.stringify(tempItems))
    });

    mainTbody.insertAdjacentHTML('beforeend', newRow);

    m2.hide();
    tempItems = [];
    renderTemp();
    alert('บันทึกแผนเรียบร้อยแล้ว');
}

function filterYear(selectedYear) {
        // ส่วนที่ 1: สั่งเปลี่ยนข้อความบนปุ่ม
        const btn = document.getElementById('dropdownYearBtn');
        if (selectedYear === 'all') {
            btn.innerText = 'ดูทั้งหมด';
        } else {
            btn.innerText = selectedYear;
        }

        // ส่วนที่ 2: วนลูปเช็คตารางเพื่อซ่อน/แสดง
        const tableBody = document.getElementById('materialTableBody');
        const rows = tableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].children; 
            
            // ตรวจสอบข้อมูลใน "คอลัมน์ที่ 3" (Index 2)
            if (cells.length >= 3) {
                const yearText = cells[2].innerText.trim(); // ดึงเลขปี

                // ถ้าเลือก all หรือ ปีตรงกัน -> แสดง
                if (selectedYear === 'all' || yearText === selectedYear) {
                    rows[i].style.display = ''; 
                } else {
                    // ถ้าไม่ตรง -> ซ่อน
                    rows[i].style.display = 'none'; 
                }
            }
        }
    }

    // ฟังก์ชันสลับ Input ตามประเภทแผน
function togglePlanInputs() {
    const type = document.getElementById('planType').value;
    const monthGroup = document.getElementById('monthInputGroup');
    const dateGroup = document.getElementById('dateInputGroup');

    // รีเซ็ตค่าการแสดงผล (ซ่อนทั้งหมดก่อน)
    monthGroup.classList.add('d-none');
    dateGroup.classList.add('d-none');

    if (type === 'monthly') {
        monthGroup.classList.remove('d-none');
    } else if (type === 'outplan') {
        dateGroup.classList.remove('d-none');
    }
}
