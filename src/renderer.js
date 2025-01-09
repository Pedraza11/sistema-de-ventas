const productForm = document.getElementById('product-form');
const productTable = document.querySelector('#product-table tbody');
const salesTable = document.querySelector('#sales-table tbody');
const earningsToday = document.getElementById('earnings-today');
const earningsWeek = document.getElementById('earnings-week');
const earningsMonth = document.getElementById('earnings-month');
const earningsYear = document.getElementById('earnings-year');
const filterDateInput = document.getElementById('filter-date');
const filterButton = document.getElementById('filter-button');
const filterNameInput = document.getElementById('filter-name');
const filterStorageSelect = document.getElementById('filter-storage');

let editingProductId = null; // Variable para almacenar el ID del producto que se está editando

// Manejo del formulario de producto
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const almacenamiento = document.getElementById('almacenamiento').value;
  const estado = document.getElementById('estado').value;
  const condicion_bateria = document.getElementById('condicion_bateria').value;
  const color = document.getElementById('color').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  if (editingProductId === null) {
    // Si no estamos editando un producto, agregar uno nuevo
    const product = {
      nombre,
      almacenamiento,
      estado,
      condicion_bateria,
      color,
      precio,
      cantidad
    };
    await window.electron.addProduct(product); // Llamar al backend para agregar un producto nuevo
  } else {
    // Si estamos editando un producto, agregamos uno nuevo y eliminamos el antiguo
    const updatedProduct = {
      nombre,
      almacenamiento,
      estado,
      condicion_bateria,
      color,
      precio,
      cantidad
    };

    // Crear el nuevo producto con los datos editados
    await window.electron.addProduct(updatedProduct); // Agregar el producto editado como nuevo

    // Eliminar el producto antiguo
    await window.electron.deleteProduct(editingProductId); // Eliminar el producto original

    editingProductId = null; // Restablecer el estado de edición
  }

  const allProducts = await window.electron.getProducts(); // Recargar productos después de agregar o actualizar
  renderProducts(allProducts); // Renderizar los productos

  clearFormFields(); // Limpiar los campos del formulario
});

window.electron.onProductsReply((products) => {
  renderProducts(products); // Mostrar productos en la tabla
});

// Función para renderizar los productos
function renderProducts(products) {
  productTable.innerHTML = products.map(product => `
    <tr data-id="${product.id}">
      <td>${product.nombre}</td>
      <td>${product.almacenamiento}</td>
      <td>${product.estado}</td>
      <td>${product.condicion_bateria}</td>
      <td>${product.color}</td>
      <td>${product.precio}</td>
      <td>${product.cantidad}</td>
      <td>
        <button onclick="sellProduct(${product.id}, ${product.precio})">Vender</button>
        <button onclick="editProduct(${product.id})">Editar</button>
        <button onclick="deleteProduct(${product.id})">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

// Función para eliminar un producto
function deleteProduct(id) {
  window.electron.deleteProduct(id).then(() => window.electron.getProducts().then(renderProducts));
}

// Función para vender un producto
function sellProduct(id, precio) {
  const sale = {
    id: id,
    precio: precio,
    cantidad: 1
  };

  // Primero, vendemos el producto
  window.electron.sellProduct(sale).then(() => {
    // Luego, eliminamos el producto de la tabla (del inventario)
    window.electron.deleteProduct(id);

    // Recargamos los productos y las ventas para mostrar los cambios
    window.electron.getProducts().then(renderProducts);
    window.electron.getSales().then(renderSales);
  });
}

// Función para editar un producto
async function editProduct(id) {
  const product = await window.electron.getProductById(id);
  document.getElementById('nombre').value = product.nombre;
  document.getElementById('almacenamiento').value = product.almacenamiento;
  document.getElementById('estado').value = product.estado;
  document.getElementById('condicion_bateria').value = product.condicion_bateria;
  document.getElementById('color').value = product.color;
  document.getElementById('precio').value = product.precio;
  document.getElementById('cantidad').value = product.cantidad;

  editingProductId = id; // Almacenamos el ID del producto que estamos editando

  // Cambiar el texto del botón de 'Guardar producto' a 'Guardar cambios'
  const saveButton = document.getElementById('save-button');
  saveButton.textContent = 'Guardar cambios';
  saveButton.onclick = () => saveProductChanges(); // Cambiar la acción del botón
}

// Función para guardar los cambios de un producto
async function saveProductChanges() {
  const nombre = document.getElementById('nombre').value;
  const almacenamiento = document.getElementById('almacenamiento').value;
  const estado = document.getElementById('estado').value;
  const condicion_bateria = document.getElementById('condicion_bateria').value;
  const color = document.getElementById('color').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  const updatedProduct = {
    nombre,
    almacenamiento,
    estado,
    condicion_bateria,
    color,
    precio,
    cantidad
  };

  // Crear el nuevo producto con los datos editados
  await window.electron.addProduct(updatedProduct); // Agregar el producto editado como nuevo

  // Eliminar el producto antiguo
  await window.electron.deleteProduct(editingProductId); // Eliminar el producto original

  const allProducts = await window.electron.getProducts(); // Recargar productos después de actualizar
  renderProducts(allProducts); // Renderizar los productos

  clearFormFields(); // Limpiar los campos del formulario
  editingProductId = null; // Restablecer el estado de edición

  // Restablecer el texto y acción del botón
  const saveButton = document.getElementById('save-button');
  saveButton.textContent = 'Guardar producto';
  saveButton.onclick = () => saveProduct(); // Vuelve a la acción original
}

// Función para guardar un producto nuevo (si no se está editando)
async function saveProduct() {
  const nombre = document.getElementById('nombre').value;
  const almacenamiento = document.getElementById('almacenamiento').value;
  const estado = document.getElementById('estado').value;
  const condicion_bateria = document.getElementById('condicion_bateria').value;
  const color = document.getElementById('color').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  const product = {
    nombre,
    almacenamiento,
    estado,
    condicion_bateria,
    color,
    precio,
    cantidad
  };

  await window.electron.addProduct(product); // Llamar al backend para agregar un nuevo producto
  const allProducts = await window.electron.getProducts(); // Recargar productos después de agregar
  renderProducts(allProducts); // Renderizar los productos
  clearFormFields(); // Limpiar los campos del formulario
}

// Función para eliminar una venta y devolver el producto al stock
async function deleteSale(id) {
  const sale = await window.electron.getSaleById(id);
  const product = {
    nombre: sale.nombre,
    almacenamiento: sale.almacenamiento,
    estado: sale.estado,
    condicion_bateria: sale.condicion_bateria,
    color: sale.color,
    precio: sale.precio,
    cantidad: sale.cantidad
  };
  await window.electron.addProduct(product);
  await window.electron.deleteSale(id);
  window.electron.getSales().then(renderSales); // Recargar las ventas después de eliminar una
  window.electron.getProducts().then(renderProducts); // Recargar los productos después de agregar uno nuevo
}

// Evento para manejar la respuesta de ventas
window.electron.onSalesReply((sales) => {
  renderSales(sales);
});

// Función para renderizar las ventas
function renderSales(sales) {
  salesTable.innerHTML = sales.map(sale => {
    const saleDate = new Date(sale.fecha);
    // Formatear la fecha para mostrarla correctamente
    const formattedDate = saleDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return `
      <tr>
        <td>${sale.nombre}</td>
        <td>${sale.precio}</td>
        <td>${sale.cantidad}</td>
        <td>${formattedDate}</td>
        <td>
          <button onclick="deleteSale(${sale.id})">Eliminar</button>
        </td>
      </tr>
    `;
  }).join('');

  calculateEarnings(sales);
}

// Función para calcular las ganancias
function calculateEarnings(sales) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let earningsTodayTotal = 0;
  let earningsWeekTotal = 0;
  let earningsMonthTotal = 0;
  let earningsYearTotal = 0;

  sales.forEach(sale => {
    const saleDate = new Date(sale.fecha);

    if (saleDate >= startOfDay) earningsTodayTotal += sale.precio * sale.cantidad;
    if (saleDate >= startOfWeek) earningsWeekTotal += sale.precio * sale.cantidad;
    if (saleDate >= startOfMonth) earningsMonthTotal += sale.precio * sale.cantidad;
    if (saleDate >= startOfYear) earningsYearTotal += sale.precio * sale.cantidad;
  });

  earningsToday.textContent = `$${earningsTodayTotal}`;
  earningsWeek.textContent = `$${earningsWeekTotal}`;
  earningsMonth.textContent = `$${earningsMonthTotal}`;
  earningsYear.textContent = `$${earningsYearTotal}`;
}

// Función para limpiar los campos del formulario
function clearFormFields() {
  document.getElementById('nombre').value = '';
  document.getElementById('almacenamiento').value = '';
  document.getElementById('estado').value = '';
  document.getElementById('condicion_bateria').value = '';
  document.getElementById('color').value = '';
  document.getElementById('precio').value = '';
  document.getElementById('cantidad').value = '';
}


// Obtener productos y ventas al cargar la página
window.electron.getProducts().then(renderProducts);
window.electron.getSales().then(renderSales);
