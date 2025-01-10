let editingProductId = null;

// Selección de elementos del DOM
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

// Función que suma un día a la fecha proporcionada
function addOneDayToDate(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}

// Manejo del formulario de productos
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const almacenamiento = document.getElementById('almacenamiento').value;
  const estado = document.getElementById('estado').value;
  const condicion_bateria = document.getElementById('condicion_bateria').value;
  const color = document.getElementById('color').value;
  const precio = parseFloat(document.getElementById('precio').value);
  const cantidad = parseInt(document.getElementById('cantidad').value);

  const products = Array.from({ length: cantidad }, () => ({
    nombre,
    almacenamiento,
    estado,
    condicion_bateria,
    color,
    precio,
    cantidad: 1
  }));

  if (editingProductId) {
    // Si estamos editando, actualizar el producto en lugar de crear uno nuevo
    await window.electron.updateProduct(editingProductId, products[0]);
    editingProductId = null; // Resetear la variable para evitar futuros conflictos
  } else {
    // Si no estamos editando, crear nuevos productos
    for (const product of products) {
      await window.electron.addProduct(product);
    }
  }

  const allProducts = await window.electron.getProducts();
  renderProducts(allProducts);
  clearFormFields();
});

// Renderizado de productos
function renderProducts(products) {
  productTable.innerHTML = products
    .map(product => {
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
      return '';
    })
    .join('');
}

// Eliminar producto
function deleteProduct(id) {
  window.electron.deleteProduct(id)
    .then(() => window.electron.getProducts().then(renderProducts));
}

// Vender producto
function sellProduct(id, precio) {
  const sale = { id, precio, cantidad: 1 };
  window.electron.sellProduct(sale)
    .then(() => {
      window.electron.getSales().then(renderSales);
      window.electron.getProducts().then(renderProducts);
    });
}

// Editar producto
async function editProduct(id) {
  const product = await window.electron.getProductById(id);
  document.getElementById('nombre').value = product.nombre;
  document.getElementById('almacenamiento').value = product.almacenamiento;
  document.getElementById('estado').value = product.estado;
  document.getElementById('condicion_bateria').value = product.condicion_bateria;
  document.getElementById('color').value = product.color;
  document.getElementById('precio').value = product.precio;
  document.getElementById('cantidad').value = product.cantidad;

  editingProductId = product.id; // Asignar el id del producto que se está editando
}

// Eliminar venta
async function deleteSale(id) {
  const sale = await window.electron.getSaleById(id);

  // Crear el producto con cantidad fija en 1 para regresar al stock
  const product = {
    nombre: sale.nombre,
    almacenamiento: sale.almacenamiento,
    estado: sale.estado,
    condicion_bateria: sale.condicion_bateria,
    color: sale.color,
    precio: sale.precio,
    cantidad: 1, // Siempre regresar 1 unidad al stock
  };

  await window.electron.addProduct(product); // Agregar el producto al inventario
  await window.electron.deleteSale(id); // Eliminar la venta
  window.electron.getSales().then(renderSales); // Recargar la tabla de ventas
  window.electron.getProducts().then(renderProducts); // Recargar la tabla de productos
}

// Renderizado de ventas
function renderSales(sales) {
  salesTable.innerHTML = sales
    .map(sale => {
      const saleDate = new Date(sale.fecha);
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
          <td><button onclick="deleteSale(${sale.id})">Eliminar</button></td>
        </tr>
      `;
    })
    .join('');

  calculateEarnings(sales);
}

// Calcular ganancias
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

// Filtrar ventas por fecha
filterButton.addEventListener('click', () => {
  const filterDate = new Date(filterDateInput.value);
  if (isNaN(filterDate)) {
    alert('Por favor, selecciona una fecha válida.');
    return;
  }

  const filterDatePlusOne = addOneDayToDate(filterDate); // Sumar un día a la fecha

  window.electron.getSales().then(sales => {
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.fecha);
      return (
        saleDate.getFullYear() === filterDatePlusOne.getFullYear() &&
        saleDate.getMonth() === filterDatePlusOne.getMonth() &&
        saleDate.getDate() === filterDatePlusOne.getDate()
      );
    });

    renderSales(filteredSales);
  });
});

// Filtrar productos por nombre
filterNameInput.addEventListener('input', () => {
  const filterName = filterNameInput.value.trim().toLowerCase();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product =>
      product.nombre.toLowerCase().includes(filterName)
    );
    renderProducts(filteredProducts);
  });
});

// Filtrar productos por almacenamiento
filterStorageSelect.addEventListener('change', () => {
  const filterStorage = filterStorageSelect.value.trim();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product =>
      filterStorage === '' || product.almacenamiento === filterStorage
    );
    renderProducts(filteredProducts);
  });
});

// Filtrar productos por estado
filterStateSelect.addEventListener('change', () => {
  const filterState = filterStateSelect.value.trim();
  window.electron.getProducts().then(products => {
    const filteredProducts = products.filter(product =>
      filterState === '' || product.estado === filterState
    );
    renderProducts(filteredProducts);
  });
});

// Limpiar formulario
function clearFormFields() {
  productForm.reset();
}

// Inicialización de datos
window.electron.getProducts().then(renderProducts);
window.electron.getSales().then(renderSales);
