

// เรียงลำดับแถว
function toggleAll(source) {
            const checkboxes = document.querySelectorAll('.delete-checkbox');
            checkboxes.forEach(cb => cb.checked = source.checked);
            updateCount();
        }

        function updateCount() {
            const count = document.querySelectorAll('.delete-checkbox:checked').length;
            document.getElementById('selected-count').innerText = `เลือก ${count} รายการ`;
        }
        
        document.addEventListener('change', function(e) {
            if(e.target.classList.contains('delete-checkbox')) {
                updateCount();
            }
        });

        function reIndexRows() {
            const rows = document.querySelectorAll('#materialTableBody tr');
            rows.forEach((row, index) => {
                row.cells[1].innerText = index + 1;
            });
        }


// ปุมลบ
let isDeleteMode = false;

        function toggleDeleteMode(active) {
            isDeleteMode = active;
            
            const defaultBtns = document.getElementById('default-buttons');
            const deleteBtns = document.getElementById('delete-buttons');
            const checkboxCols = document.querySelectorAll('.checkbox-col');
            const checkboxes = document.querySelectorAll('.delete-checkbox');

            if (active) {
                defaultBtns.classList.remove('d-flex');
                defaultBtns.classList.add('d-none');
                
                deleteBtns.classList.remove('d-none');
                deleteBtns.classList.add('d-flex');
                
                checkboxCols.forEach(col => col.classList.add('active'));
            } else {
                defaultBtns.classList.remove('d-none');
                defaultBtns.classList.add('d-flex');
                
                deleteBtns.classList.remove('d-flex');
                deleteBtns.classList.add('d-none');
                
                checkboxCols.forEach(col => col.classList.remove('active'));
                checkboxes.forEach(cb => cb.checked = false);
                
                const headerCheckbox = document.querySelector('thead input[type="checkbox"]');
                if(headerCheckbox) headerCheckbox.checked = false;
                
                updateCount();
            }
        }

        function confirmDelete() {
            const checkedBoxes = document.querySelectorAll('.delete-checkbox:checked');
            
            if (checkedBoxes.length === 0) {
                alert('กรุณาเลือกรายการที่ต้องการลบ');
                return;
            }

            if (confirm(`คุณต้องการลบ ${checkedBoxes.length} รายการที่เลือกใช่หรือไม่?`)) {
                checkedBoxes.forEach(cb => {
                    cb.closest('tr').remove();
                });
                toggleDeleteMode(false);
                reIndexRows();
            }
        }
