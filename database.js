const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    almacenamiento TEXT,
    estado TEXT,
    condicion_bateria TEXT,
    color TEXT,
    precio REAL,
    cantidad INTEGER,
    proveedor TEXT,            -- Nueva columna
    nro_serie TEXT,            -- Nueva columna
    fecha_ingreso TEXT         -- Nueva columna
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ventas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    almacenamiento TEXT,
    estado TEXT,
    condicion_bateria TEXT,
    color TEXT,
    precio REAL,
    cantidad INTEGER,
    fecha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS ganancias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    cantidad REAL,
    fecha TEXT
  )`);
});
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT,
    almacenamiento TEXT,
    estado TEXT,
    condicion_bateria TEXT,
    color TEXT,
    precio REAL,
    cantidad INTEGER,
    fecha TEXT
  )`);
});

function addProduct(product) {
  return new Promise((resolve, reject) => {
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, proveedor, nro_serie, fecha_ingreso } = product;
    db.run(
      `INSERT INTO productos (nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, proveedor, nro_serie, fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, proveedor, nro_serie, fecha_ingreso],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function getProducts() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM productos`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function deleteProduct(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM productos WHERE id = ?`, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function addSale(sale) {
  return new Promise((resolve, reject) => {
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha } = sale;
    db.run(
      `INSERT INTO ventas (nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function getSales() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ventas`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function deleteSale(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM ventas WHERE id = ?`, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function updateEarnings(tipo, cantidad) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString();
    db.run(
      `INSERT INTO ganancias (tipo, cantidad, fecha) VALUES (?, ?, ?)`,
      [tipo, cantidad, fecha],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function getEarnings() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ganancias`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getProductById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM productos WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function getSaleById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM ventas WHERE id = ?`, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

function updateProduct(id, product) {
  return new Promise((resolve, reject) => {
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, proveedor, nro_serie, fecha_ingreso } = product;
    db.run(
      `UPDATE productos SET nombre = ?, almacenamiento = ?, estado = ?, condicion_bateria = ?, color = ?, precio = ?, cantidad = ?, proveedor = ?, nro_serie = ?, fecha_ingreso = ? WHERE id = ?`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, proveedor, nro_serie, fecha_ingreso, id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function updateProductQuantity(id, quantityChange) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE productos SET cantidad = cantidad + ? WHERE id = ?`,
      [quantityChange, id],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

function getProductByNameAndAttributes(nombre, almacenamiento, estado, condicion_bateria, color) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM productos WHERE nombre = ? AND almacenamiento = ? AND estado = ? AND condicion_bateria = ? AND color = ?`,
      [nombre, almacenamiento, estado, condicion_bateria, color],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
}
function addReservation(reservation) {
  return new Promise((resolve, reject) => {
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha } = reservation;
    db.run(
      `INSERT INTO reservas (nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, fecha],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

function getReservations() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM reservas`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function deleteReservation(id) {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM reservas WHERE id = ?`, [id], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}


module.exports = {
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
  deleteReservation
};
