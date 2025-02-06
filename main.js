const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {
  addProduct,
  getProducts,
  deleteProduct,
  addSale,
  getSales,
  deleteSale,
  updateEarnings,
  getEarnings,
  getProductById,
  getSaleById,
  updateProduct,
  updateProductQuantity,
  getProductByNameAndAttributes,
  addReservation,
  getReservations,
  deleteReservation,
  
} = require('./database');

let mainWindow;


app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.webContents.openDevTools();
});

ipcMain.handle('add-product', async (event, product) => {
  try {
    if (product.id) {
      // Si el producto ya tiene un id, actualizamos el producto existente
      await updateProduct(product.id, product);
    } else {
      // Si no tiene id, se crea un nuevo producto
      await addProduct(product);
    }
    return getProducts();
  } catch (error) {
    console.error('Error adding/updating product:', error);
    throw error;
  }
});

ipcMain.handle('get-products', async () => {
  try {
    return getProducts();
  } catch (error) {
    console.error('Error getting products:', error);
    throw error;
  }
});

ipcMain.handle('delete-product', async (event, id) => {
  try {
    await deleteProduct(id);
    return getProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

ipcMain.handle('sell-product', async (event, sale) => {
  try {
    const product = await getProductById(sale.id);
    if (!product) {
      throw new Error(`Product with id ${sale.id} not found`);
    }
    const saleData = {
      nombre: product.nombre,
      almacenamiento: product.almacenamiento,
      estado: product.estado,
      condicion_bateria: product.condicion_bateria,
      color: product.color,
      precio: product.precio,
      cantidad: sale.cantidad,
      fecha: new Date().toISOString()
    };
    await addSale(saleData);
    await updateEarnings('daily', sale.precio * sale.cantidad);
    await updateProductQuantity(sale.id, -sale.cantidad);
    return getSales();
  } catch (error) {
    console.error('Error selling product:', error);
    throw error;
  }
});

ipcMain.handle('get-sales', async () => {
  try {
    return getSales();
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
});

ipcMain.handle('delete-sale', async (event, id) => {
  try {
    const sale = await getSaleById(id);
    if (!sale) {
      throw new Error(`Venta con id ${id} no encontrada`);
    }

    const product = await getProductById(sale.id);
    if (!product) {
      console.log(`Producto con id ${sale.id} ya no existe en la base de datos. No se puede restaurar la cantidad.`);
      await deleteSale(id);
      return getSales();
    }

    await updateProductQuantity(sale.id, sale.cantidad);
    await deleteSale(id);
    return getSales();
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
});

ipcMain.handle('get-earnings', async () => {
  try {
    return getEarnings();
  } catch (error) {
    console.error('Error getting earnings:', error);
    throw error;
  }
});

ipcMain.handle('get-product-by-id', async (event, id) => {
  try {
    return getProductById(id);
  } catch (error) {
    console.error('Error getting product by id:', error);
    throw error;
  }
});

ipcMain.handle('get-sale-by-id', async (event, id) => {
  try {
    return getSaleById(id);
  } catch (error) {
    console.error('Error getting sale by id:', error);
    throw error;
  }
});

ipcMain.handle('update-product', async (event, id, updatedProduct) => {
  try {
    const product = await getProductById(id);
    if (!product) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }
    // Solo actualizamos el producto existente
    await updateProduct(id, updatedProduct);
    return getProducts(); // Retornamos los productos después de la actualización
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
});

ipcMain.handle('add-reservation', async (event, reservation) => {
  try {
    await addReservation(reservation);
    return getReservations();
  } catch (error) {
    console.error('Error adding reservation:', error);
    throw error;
  }
});

ipcMain.handle('get-reservations', async () => {
  try {
    return getReservations();
  } catch (error) {
    console.error('Error getting reservations:', error);
    throw error;
  }
});

ipcMain.handle('delete-reservation', async (event, id) => {
  try {
    await deleteReservation(id);
    return getReservations();
  } catch (error) {
    console.error('Error deleting reservation:', error);
    throw error;
  }
});