const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  getProducts: () => ipcRenderer.invoke('get-products'),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  sellProduct: (sale) => ipcRenderer.invoke('sell-product', sale),
  getSales: () => ipcRenderer.invoke('get-sales'),
  deleteSale: (id) => ipcRenderer.invoke('delete-sale', id),
  getEarnings: () => ipcRenderer.invoke('get-earnings'),
  getProductById: (id) => ipcRenderer.invoke('get-product-by-id', id),
  getSaleById: (id) => ipcRenderer.invoke('get-sale-by-id', id), // Exponer la función
  updateProduct: (id, product) => ipcRenderer.invoke('update-product', id, product),
  onProductsReply: (callback) => ipcRenderer.on('get-products-reply', (_, products) => callback(products)),
  onSalesReply: (callback) => ipcRenderer.on('get-sales-reply', (_, sales) => callback(sales)),
  addReservation: (reservation) => ipcRenderer.invoke('add-reservation', reservation),
  getReservations: () => ipcRenderer.invoke('get-reservations'),
  deleteReservation: (id) => ipcRenderer.invoke('delete-reservation', id),
  getReservationById: (id) => ipcRenderer.invoke('get-reservation-by-id', id)
});