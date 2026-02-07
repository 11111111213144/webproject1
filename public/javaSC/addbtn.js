 function saveNewItem() {
            const name = document.getElementById('itemName').value;
            const stock = document.getElementById('itemStock').value;
            const price = document.getElementById('itemPrice').value;
            const unit = document.getElementById('itemUnit').value;
            const code = document.getElementById('itemCode').value;
            const type = document.getElementById('itemType').value;

            if (name && code && stock && price && unit && type) {
                const tbody = document.getElementById('materialTableBody');
                const nextNo = tbody.rows.length + 1;
                const total = parseFloat(stock) * parseFloat(price);
                //const code = `M${String(nextNo).padStart(3, '0')}`;
                const newRow = `
                    <tr>
                        <td class="checkbox-col ${isDeleteMode ? 'active' : ''}">
                            <input type="checkbox" class="delete-checkbox form-check-input" onchange="updateCount()">
                        </td>
                        <th scope="row">${nextNo}</th>
                        <th scope="row">${code}</th>
                        <td>${type}</td>
                        <td>${name}</td>
                        <td>${stock}</td>
                        <td>${price}</td>
                        <td>${unit}</td>
                        <td>${total.toLocaleString()}</td>
                    </tr>
                `;
                
                tbody.insertAdjacentHTML('beforeend', newRow);

                document.getElementById('materialForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
                modal.hide();
            } else {
                alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            }
        }
