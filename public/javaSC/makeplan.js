// ----------------------------------------------------
// ส่วนที่ 1: ประกาศตัวแปรข้อมูลไว้ด้านบนสุด (Global Scope)
// ----------------------------------------------------
let mainTableItems = [{
    day : "15",
    month: "มิถุนายน",
    year: "2567",
    material: "วัสดุสำนักงาน",
    items: [
        { name: "กระดาษ A4 80 แกรม", qty: 50, unit: "รีม", price: 120, total: 6000 },
        { name: "ปากกาลูกลื่นสีน้ำเงิน", qty: 12, unit: "โหล", price: 60, total: 720 },
        { name: "แฟ้มสันกว้าง", qty: 20, unit: "เล่ม", price: 55, total: 1100 }
    ]
}
,{
    day : "20",
    month: "มิถุนายน",
    year: "2567",
    material: "วัสดุสำนักงาน",
    items: [
        { name: "กระดาษ A4 80 แกรม", qty: 50, unit: "รีม", price: 120, total: 6000 },
        { name: "ปากกาลูกลื่นสีน้ำเงิน", qty: 12, unit: "โหล", price: 60, total: 720 },
        { name: "แฟ้มสันกว้าง", qty: 20, unit: "เล่ม", price: 55, total: 1100 }
    ]
}
,{
    day : "25",
    month: "มิถุนายน",        
    year: "2567",
    material: "วัสดุสำนักงาน",
    items: [
        { name: "กระดาษ A4 80 แกรม", qty: 50, unit: "รีม", price: 120, total: 6000 },
        { name: "ปากกาลูกลื่นสีน้ำเงิน", qty: 12, unit: "โหล", price: 60, total: 720 },
        { name: "แฟ้มสันกว้าง", qty: 20, unit: "เล่ม", price: 55, total: 1100 }
    ]
}]; 

// ตัวแปรพักข้อมูลชั่วคราว
let tempOrderHeader = {}; 
let tempOrderItems = [];
// ----------------------------------------------------
// ส่วนที่ 2: ฟังก์ชันสร้าง Modal (ปรับปรุงการ return ค่า)
// ----------------------------------------------------
function createDetailsModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'detailsModal';
    modalDiv.className = 'modal fade';
    // ... (HTML ด้านในเหมือนเดิม) ...
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">รายละเอียดใบสั่งซื้อ</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p><strong>วันที่:</strong> <span id="detailsDay"></span></p>
                    <p><strong>เดือน:</strong> <span id="detailsMonth"></span></p>
                    <p><strong>ปี พ.ศ.:</strong> <span id="detailsYear"></span></p>
                    <p><strong>ประวัสดุ/ครุภัทณ์:</strong> <span id="detailsMaterial"></span></p>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ลำดับ</th><th>รายการ</th><th>จำนวน</th><th>หน่วย</th><th>ราคาต่อหน่วย</th><th>จำนวนเงิน</th>
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
    
    // แก้ไข: return ตัวแปร modalDiv ออกไปตรงๆ เลย เพื่อความชัวร์ว่าได้ Element แน่ๆ
    return modalDiv; 
}

// ----------------------------------------------------
// ส่วนที่ 3: ฟังก์ชัน showDetails (ปรับปรุงการเรียก Modal)
// ----------------------------------------------------
function showDetails(dataIndex) {
    // เช็คว่ามีข้อมูลจริงไหม
    if (typeof mainTableItems === 'undefined' || !mainTableItems[dataIndex]) {
        console.error("Error: mainTableItems is missing or index is wrong.");
        return;
    }

    const data = mainTableItems[dataIndex];

    // เช็ค Element ว่ามีอยู่แล้วหรือยัง
    let modalEl = document.getElementById('detailsModal');
    
    // ถ้าไม่มี ให้สร้างใหม่
    if (!modalEl) {
        modalEl = createDetailsModal();
    }

    // ใส่ข้อมูล
    document.getElementById('detailsDay').textContent = data.day;
    document.getElementById('detailsMonth').textContent = data.month;
    document.getElementById('detailsYear').textContent = data.year;
    document.getElementById('detailsMaterial').textContent = data.material;

    const tbody = document.getElementById('detailsTableBody');
    tbody.innerHTML = '';
    
    let rowsHtml = '';
    data.items.forEach((item, index) => {
        rowsHtml += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.total.toLocaleString()}</td>
            </tr>
        `;
    });
    tbody.innerHTML = rowsHtml;

    // แก้ไขจุดสำคัญ: ใช้ getOrCreateInstance แทน new Modal 
    // เพื่อป้องกัน Error เรื่อง backdrop และ memory leak
    try {
        const myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
        myModal.show();
    } catch (e) {
        console.error("Bootstrap Error:", e);
        alert("เกิดข้อผิดพลาดในการเปิด Modal โปรดตรวจสอบการติดตั้ง Bootstrap JS");
    }
}

// ----------------------------------------------------
// 1. สร้าง Modal สำหรับฟอร์ม "เพิ่มรายการ"
// ----------------------------------------------------
function createAddModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'addModal';
    modalDiv.className = 'modal fade';
    modalDiv.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">เพิ่มใบสั่งซื้อใหม่</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addForm">
                        <div class="mb-3">
                            <label class="form-label">หมายเลขใบสั่งซื้อ</label>
                            <input type="text" class="form-control" id="addOrderNo" placeholder="เช่น 0004">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ประเภทวัสดุ</label>
                            <select class="form-select" id="addMaterialType">
                                <option value="วัสดุสำนักงาน">วัสดุสำนักงาน</option>
                                <option value="วัสดุคอมพิวเตอร์">วัสดุคอมพิวเตอร์</option>
                                <option value="วัสดุงานบ้านงานครัว">วัสดุงานบ้านงานครัว</option>
                                <option value="วัสดุไฟฟ้าและวิทยุ">วัสดุไฟฟ้าและวิทยุ</option>
                                <option value="วัสดุเชื้อเพลิง">วัสดุเชื้อเพลิง</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        <div class="row">
                            <div class="col-4 mb-3">
                                <label class="form-label">วันที่</label>
                                <input type="number" class="form-control" id="addDay" placeholder="1-31">
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">เดือน</label>
                                <select class="form-select" id="addMonth">
                                    <option value="มกราคม">มกราคม</option>
                                    <option value="กุมภาพันธ์">กุมภาพันธ์</option>
                                    <option value="มีนาคม">มีนาคม</option>
                                    <option value="เมษายน">เมษายน</option>
                                    <option value="พฤษภาคม">พฤษภาคม</option>
                                    <option value="มิถุนายน">มิถุนายน</option>
                                    <option value="กรกฎาคม">กรกฎาคม</option>
                                    <option value="สิงหาคม">สิงหาคม</option>
                                    <option value="กันยายน">กันยายน</option>
                                    <option value="ตุลาคม">ตุลาคม</option>
                                    <option value="พฤศจิกายน">พฤศจิกายน</option>
                                    <option value="ธันวาคม">ธันวาคม</option>
                                    </select>
                            </div>
                            <div class="col-4 mb-3">
                                <label class="form-label">ปี</label>
                                <input type="text" class="form-control" id="addYear" value="2567">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">สถานะ</label>
                            <select class="form-select" id="addStatus">
                                <option value="รอดำเนินการ">รอดำเนินการ</option>
                                <option value="ดำเนินการแล้ว">ดำเนินการแล้ว</option>
                                <option value="ล่าช้า">ล่าช้า</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                    <button type="button" class="btn btn-primary" onclick="goToStep2()">ถัดไป &gt;</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    return modalDiv;
}

function goToStep2() {
    // 1. เก็บข้อมูลรวมถึงประเภทวัสดุ
    tempOrderHeader = {
        orderNo: document.getElementById('addOrderNo').value,
        material: document.getElementById('addMaterialType').value, 
        day: document.getElementById('addDay').value,
        month: document.getElementById('addMonth').value,
        year: document.getElementById('addYear').value,
        status: document.getElementById('addStatus').value
    };

    if (!tempOrderHeader.orderNo || !tempOrderHeader.day) {
        alert("กรุณากรอกข้อมูลให้ครบ");
        return;
    }

    // 2. ปิด Modal 1
    const modal1 = bootstrap.Modal.getInstance(document.getElementById('addModal'));
    modal1.hide();

    // 3. เปิด Modal 2
    let modal2El = document.getElementById('addProductModal');
    if (!modal2El) modal2El = createProductModal();
    
    // (Optional) แสดงชื่อประเภทในหัวข้อ Modal 2 เพื่อความสวยงาม
    // document.querySelector('#addProductModal .modal-title').textContent = `เพิ่มรายการสินค้า (${tempOrderHeader.material})`;

    renderPreviewList(); 

    const modal2 = bootstrap.Modal.getOrCreateInstance(modal2El);
    modal2.show();
}

// ----------------------------------------------------
// 2. ฟังก์ชันเปิด Modal (เรียกใช้เมื่อกดปุ่มเพิ่ม)
// ----------------------------------------------------
function openAddModal() {
    let modalEl = document.getElementById('addModal');
    if (!modalEl) {
        modalEl = createAddModal();
    }
    
    // เคลียร์ค่าเก่าในฟอร์ม (ถ้ามี)
    document.getElementById('addForm').reset();

    const myModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    myModal.show();
}

// ----------------------------------------------------
// 3. ฟังก์ชันบันทึกข้อมูล (Save)
// ----------------------------------------------------
function saveNewItem() {
    // ดึงค่าจาก Input
    const orderNo = document.getElementById('addOrderNo').value;
    const day = document.getElementById('addDay').value;
    const month = document.getElementById('addMonth').value;
    const year = document.getElementById('addYear').value;
    const status = document.getElementById('addStatus').value;

    if (!orderNo || !day) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    // สร้าง Object ข้อมูลใหม่
    const newItem = {
        orderNo: orderNo,
        day: day,
        month: month,
        year: year,
        material: material, // ค่าเริ่มต้น หรือจะเพิ่มช่องกรอกก็ได้
        items: [] // เริ่มต้นเป็นอาเรย์ว่าง
    };

    // 1. เพิ่มข้อมูลเข้า mainTableItems (ตัวแปรเก็บข้อมูล)
    mainTableItems.push(newItem);

    // 2. อัปเดตตาราง HTML (ส่วน UI)
    // ตรงนี้คุณต้องเขียนโค้ดเพิ่มแถวลงในตารางหลัก (id ของ <tbody> ตารางหลัก)
    // ตัวอย่าง:
    const mainTableBody = document.querySelector('table tbody'); // อ้างอิง tbody ของตารางหลัก
    const newRow = `
        <tr>
            <td>${mainTableItems.length}</td> <td>${orderNo}</td>
            <td>${day}</td>
            <td>${month}</td>
            <td>${year}</td>
            <td>${status}</td>
            <td>
                <button class="btn-info" onclick="showDetails(${mainTableItems.length - 1})">รายละเอียด</button>
            </td>
        </tr>
    `;
    
    // แทรกแถวใหม่เข้าไปท้ายตาราง
    mainTableBody.insertAdjacentHTML('beforeend', newRow);

    // ปิด Modal
    const modalEl = document.getElementById('addModal');
    const myModal = bootstrap.Modal.getInstance(modalEl);
    myModal.hide();
    
    alert("บันทึกข้อมูลเรียบร้อย!");
}

function saveAllData() {
    if (tempOrderItems.length === 0) {
        if(!confirm("คุณยังไม่ได้เพิ่มสินค้าเลย ต้องการบันทึกบิลเปล่าหรือไม่?")) return;
    }

    // 1. สร้าง Object ใหญ่ (ใช้ค่า material จากตัวแปรพัก)
    const finalData = {
        day: tempOrderHeader.day,     
        month: tempOrderHeader.month,
        year: tempOrderHeader.year,
        material: tempOrderHeader.material, // <--- ใช้ค่าที่เลือกมา
        items: [...tempOrderItems]
    };

    // 2. เพิ่มเข้าตัวแปรหลัก
    mainTableItems.push(finalData);

    // 3. เพิ่มแถวลงในตารางหลักหน้าเว็บ
    const mainTableBody = document.querySelector('table tbody'); 
    const newIndex = mainTableItems.length - 1;
    
    const newRow = `
        <tr>
            <td>${mainTableItems.length}</td>
            <td>${tempOrderHeader.orderNo}</td>
            <td>${tempOrderHeader.day}</td>
            <td>${tempOrderHeader.month}</td>
            <td>${tempOrderHeader.year}</td>
            <td>${tempOrderHeader.status}</td>
            <td>
                <button class="btn btn-setting" onclick="showDetails(${newIndex})">รายละเอียด</button>
            </td>
        </tr>
    `;
    mainTableBody.insertAdjacentHTML('beforeend', newRow);

    // 4. ปิด Modal และเคลียร์ค่า
    const modal2 = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal2.hide();
    
    tempOrderHeader = {};
    tempOrderItems = [];
    
    alert("บันทึกข้อมูลเรียบร้อย!");
}

// ----------------------------------------------------
// 4. ฟังก์ชันสร้าง Modal หน้า 2 (เพิ่มรายการสินค้า)
// ----------------------------------------------------
function createProductModal() {
    const modalDiv = document.createElement('div');
    modalDiv.id = 'addProductModal';
    modalDiv.className = 'modal fade';
    modalDiv.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">ขั้นตอนที่ 2: เพิ่มรายการสินค้า</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-2 align-items-end mb-3 bg-light p-2 rounded">
                        <div class="col-md-4">
                            <label class="small">ชื่อรายการ</label>
                            <input type="text" class="form-control form-control-sm" id="prodName">
                        </div>
                        <div class="col-md-2">
                            <label class="small">จำนวน</label>
                            <input type="number" class="form-control form-control-sm" id="prodQty" min="1" oninput="this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null">
                        </div>
                        <div class="col-md-2">
                            <label class="small">หน่วย</label>
                            <input type="text" class="form-control form-control-sm" id="prodUnit">
                        </div>
                        <div class="col-md-2">
                            <label class="small">ราคา/หน่วย</label>
                            <input type="number" class="form-control form-control-sm" id="prodPrice" min="0" oninput="this.value = !!this.value && Math.abs(this.value) >= 0 ? Math.abs(this.value) : null">
                        </div>
                        <div class="col-md-2">
                            <button class="btn btn-success btn-sm w-100" onclick="addItemToList()">+ เพิ่ม</button>
                        </div>
                    </div>

                    <h6>รายการสั่งซื้อ</h6>
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>รายการ</th><th>จำนวน</th><th>หน่วย</th><th>ราคา</th><th>รวม</th><th>ลบ</th>
                            </tr>
                        </thead>
                        <tbody id="previewListBody">
                            </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="backToStep1()">&lt; ย้อนกลับ</button>
                    <button type="button" class="btn btn-primary" onclick="saveAllData()">บันทึกใบสั่งซื้อ</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalDiv);
    return modalDiv;
}

// ----------------------------------------------------
// 5. ฟังก์ชันจัดการรายการสินค้า (เพิ่ม/ลบ ใน Modal 2)
// ----------------------------------------------------
function renderPreviewList() {
    const tbody = document.getElementById('previewListBody');
    tbody.innerHTML = '';

    tempOrderItems.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>${item.unit}</td>
                <td>${item.price.toLocaleString()}</td>
                <td>${item.total.toLocaleString()}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeTempItem(${index})">x</button></td>
            </tr>
        `;
    });
}

// ลบรายการใน Modal 2
function removeTempItem(index) {
    tempOrderItems.splice(index, 1);
    renderPreviewList();
}

// ฟังก์ชันย้อนกลับไปหน้า 1
function backToStep1() {
    const modal2 = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    modal2.hide();
    const modal1 = bootstrap.Modal.getOrCreateInstance(document.getElementById('addModal'));
    modal1.show();
}

// ฟังก์ชันกดปุ่ม "+ เพิ่ม"
function addItemToList() {
    const name = document.getElementById('prodName').value;
    const qty = parseFloat(document.getElementById('prodQty').value) || 0;
    const unit = document.getElementById('prodUnit').value;
    const price = parseFloat(document.getElementById('prodPrice').value) || 0;

    if (!name || qty <= 0) {
        alert("กรุณากรอกชื่อและจำนวนให้ถูกต้อง");
        return;
    }

    // เพิ่มลงตัวแปรพัก
    tempOrderItems.push({
        name: name,
        qty: qty,
        unit: unit,
        price: price,
        total: qty * price
    });

    // ล้างช่องกรอก
    document.getElementById('prodName').value = '';
    document.getElementById('prodQty').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodName').focus();

    // อัปเดตตารางตัวอย่าง
    renderPreviewList();
}

// แสดงรายการสินค้าใน Modal 2
// ในไฟล์ makeplan.js

function filterYear(selectedYear) {
    // 1. เปลี่ยนชื่อปุ่ม
    const btn = document.getElementById('dropdownYearBtn');
    if (!btn) return; // ป้องกัน error ถ้าหาปุ่มไม่เจอ

    if (selectedYear === 'all') {
        btn.innerText = 'ดูทั้งหมด';
    } else {
        btn.innerText = selectedYear;
    }

    // 2. ดึงตารางมาเช็ค
    const tableBody = document.getElementById('materialTableBody');
    if (!tableBody) return;

    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].children; 
        
        // *** จุดที่ต่างจากไฟล์แรก: ต้องเช็คช่องที่ 6 (Index 5) ***
        // [0]checkbox, [1]ลำดับ, [2]เลขที่, [3]วันที่, [4]เดือน, [5]ปี
        if (cells.length >= 6) {
            
            // เปลี่ยนจาก cells[2] เป็น cells[5]
            const yearText = cells[5].innerText.trim(); 

            if (selectedYear === 'all' || yearText === selectedYear) {
                rows[i].style.display = ''; 
            } else {
                rows[i].style.display = 'none'; 
            }
        }
    }
}

