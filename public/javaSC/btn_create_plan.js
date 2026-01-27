
let tempItems = []; // เก็บรายการชั่วคราว
        let mainTableItems = [{
                year: "2567",
                material: "วัสดุก่อสร้าง (Construction)",
                items: [
                    { name: "ปูนซีเมนต์", qty: 50, price: 145.50, total: 7275 },
                    { name: "เหล็กเส้น 3 หุน", qty: 100, price: 220, total: 22000 },
                    { name: "อิฐมอญ", qty: 1000, price: 2.5, total: 2500 }
                ]
            }]; // เก็บรายการในตารางหลัก
        const m1 = new bootstrap.Modal(document.getElementById('planModal'));
        const m2 = new bootstrap.Modal(document.getElementById('itemModal'));
        const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal') || createDetailsModal());
        // เปิดหน้าแรก
        function openPlanModal() { m1.show(); }

        // ย้อนกลับ
        function backToPlan() { m2.hide(); m1.show(); }

        // ไปหน้าสอง
        function goToItems() {
            if(!document.getElementById('inYear').value) return alert('กรุณาระบุปี พ.ศ.');
            m1.hide(); m2.show();
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

            if(!name || !price) return alert('กรุณากรอกข้อมูลให้ครบ');

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
            if(confirm('ยืนยันการลบรายการนี้?')) {
                tempItems.splice(idx, 1);
                renderTemp();
            }
        }

        // แสดงรายละเอียดข้อมูล
        function showDetails(dataIndex) {
            const data = mainTableItems[dataIndex];

            if(!data) return alert('ไม่พบข้อมูล');

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

            document.getElementById('detailsYear').textContent = data.year;
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
            if(tempItems.length === 0) return alert('ยังไม่มีรายการสินค้า');
            
            const mainTbody = document.querySelector('#mainTable tbody');
            const rowCount = mainTbody.rows.length + 1;
            const year = document.getElementById('inYear').value;
            const mat = document.getElementById('selMat').value;

            const newRow = `
                <tr>
                    <th scope="row">${rowCount}</th>
                    <td>${year}</td>
                    <td>${mat}</td>
                    <td><button type="button" class="btn btn-info btn-sm" onclick="showDetails(${mainTableItems.length})">รายละเอียด</button></td>
                </tr>
            `;

            // เก็บข้อมูลรายการ
            mainTableItems.push({
                index: mainTableItems.length,
                year: year,
                material: mat,
                items: JSON.parse(JSON.stringify(tempItems))
            });

            mainTbody.insertAdjacentHTML('beforeend', newRow);
            
            // ปิด Modal และรีเซ็ตค่า
            m2.hide();
            tempItems = [];
            renderTemp();
            alert('บันทึกแผนเรียบร้อยแล้ว');
        }
        function filterYear(year) {
            // 1. เปลี่ยนข้อความบนปุ่ม
            const btn = document.getElementById('yearBtn');
            if(btn) {
                if (year === 'all') {
                    btn.innerText = 'เลือกปี (ทั้งหมด)';
                } else {
                    btn.innerText = year;
                }
            }

            // 2. กรองข้อมูลในตาราง
            const table = document.getElementById('mainTable');
            if (!table) return; // ถ้าหาตารางไม่เจอให้จบการทำงาน

            const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

            for (let i = 0; i < rows.length; i++) {
                // ดึงข้อมูลช่อง "ปี" (ซึ่งเป็น td ตัวแรก เพราะช่องแรกสุดคือ th)
                const yearCell = rows[i].getElementsByTagName('td')[0]; 
                
                if (yearCell) {
                    const txtValue = yearCell.textContent || yearCell.innerText;
                    // ถ้าเลือก 'all' หรือ ปีตรงกัน ให้แสดง
                    if (year === 'all' || txtValue.trim() === year) {
                        rows[i].style.display = "";
                    } else {
                        // ถ้าไม่ตรง ให้ซ่อน
                        rows[i].style.display = "none";
                    }
                }
            }
        }