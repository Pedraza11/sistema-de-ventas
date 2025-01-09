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
const filterStateSelect = document.getElementById('filter-state');

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const almacenamiento = document.getElementById('almacenamiento').value;
  const estado = document.getElementById('estado').value;
  const condicion_bateria = document.getElementById('condicion_bateria').value;
  const color = document.getElementById('color').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  const products = [];
  for (let i = 0; i < cantidad; i++) {
    products.push({
      nombre,
      almacenamiento,
      estado,
      condicion_bateria,
      color,
      precio,
      cantidad: 1 // Cada objeto representa una unidad
    });
  }

  for (const product of products) {
    await window.electron.addProduct(product);
  }
  const allProducts = await window.electron.getProducts(); // Recargar productos después de agregar
  renderProducts(allProducts);
  clearFormFields(); // Limpiar los campos del formulario
});

window.electron.onProductsReply((products) => {
  renderProducts(products);
});

function renderProducts(products) {
  productTable.innerHTML = products.map(product => {
    if (product.cantidad > 0) {
      return `
        <tr>
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
      `;
    }
    return ''; // No mostrar productos con cantidad 0
  }).join('');
}

function deleteProduct(id) {
  window.electron.deleteProduct(id).then(() => window.electron.getProducts().then(renderProducts));
}

// Función para vender un producto
function sellProduct(id, precio) {
  const sale = {
    id: id,
    precio: precio,
    cantidad: 1 // Cada objeto representa una unidad
  };
  window.electron.sellProduct(sale).then(() => {
    window.electron.getSales().then(renderSales);
    window.electron.getProducts().then(renderProducts); // Recargar productos después de vender
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
  // Aquí puedes agregar lógica adicional para manejar la edición del producto
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
    if (saleDate >= startOfDay) {
      earningsTodayTotal += sale.precio * sale.cantidad;
    }
    if (saleDate >= startOfWeek) {
      earningsWeekTotal += sale.precio * sale.cantidad;
    }
    if (saleDate >= startOfMonth) {
      earningsMonthTotal += sale.precio * sale.cantidad;
    }
    if (saleDate >= startOfYear) {
      earningsYearTotal += sale.precio * sale.cantidad;
    }
  });

  earningsToday.textContent = earningsTodayTotal.toFixed(2);
  earningsWeek.textContent = earningsWeekTotal.toFixed(2);
  earningsMonth.textContent = earningsMonthTotal.toFixed(2);
  earningsYear.textContent = earningsYearTotal.toFixed(2);
}

// Función para filtrar las ganancias por día
filterButton.addEventListener('click', () => {
  let filterDate = new Date(filterDateInput.value);
  if (isNaN(filterDate)) {
    alert('Por favor, selecciona una fecha válida.');
    return;
  }

  // Restar un día a la fecha del filtro
  filterDate.setDate(filterDate.getDate() + 1);

  window.electron.getSales().then(sales => {
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.fecha);
      // Ajustar la fecha de la venta a medianoche local
      const saleDateLocal = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
      return (
        saleDateLocal.getFullYear() === filterDate.getFullYear() &&
        saleDateLocal.getMonth() === filterDate.getMonth() &&
        saleDateLocal.getDate() === filterDate.getDate()
      );
    });

    renderSales(filteredSales);
  });
});

// Función para filtrar productos por nombre
filterNameInput.addEventListener('input', () => {
  const filterName = filterNameInput.value.trim().toLowerCase();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product => {
      return product.nombre.toLowerCase().includes(filterName);
    });
    renderProducts(filteredProducts);
  });
});

// Función para filtrar productos por almacenamiento
filterStorageSelect.addEventListener('change', () => {
  const filterStorage = filterStorageSelect.value.trim();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product => {
      return filterStorage === '' || product.almacenamiento === filterStorage;
    });
    renderProducts(filteredProducts);
  });
});

// Función para filtrar productos por estado del dispositivo
filterStateSelect.addEventListener('change', () => {
  const filterState = filterStateSelect.value.trim();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product => {
      return filterState === '' || product.estado === filterState;
    });
    renderProducts(filteredProducts);
  });
});

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


window.electron.getProducts().then(renderProducts);
window.electron.getSales().then(renderSales);
