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
    cantidad INTEGER
  )`);

  // Eliminar la línea que elimina la tabla de ventas
  // db.run(`DROP TABLE IF EXISTS ventas`);

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

function addProduct(product) {
  return new Promise((resolve, reject) => {
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad } = product;
    db.run(
      `INSERT INTO productos (nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad],
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
    const { nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad } = product;
    db.run(
      `UPDATE productos SET nombre = ?, almacenamiento = ?, estado = ?, condicion_bateria = ?, color = ?, precio = ?, cantidad = ? WHERE id = ?`,
      [nombre, almacenamiento, estado, condicion_bateria, color, precio, cantidad, id],
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
  getProductByNameAndAttributes
};
