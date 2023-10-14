/* Data Access Object (DAO)*/

const { db } = require('../db');
const crypto = require('crypto');

exports.getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (row === undefined) {
        resolve(false);
      }
      else {
        const user = { id: row.id, username: row.username, role: row.role };
        crypto.scrypt(password, row.pwSalt, 32, function (err, hashedPassword) {
          if (err) reject(err);
          if (!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
            resolve(false);
          else
            resolve(user);
        });
      }
    });
  });
};

exports.getAllUsers = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT username FROM user';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      else if (rows === undefined) {
        resolve(false);
      }
      else {
        const users = rows.map(r => r.username)
        resolve(users);
      }
    });
  });
};

exports.getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      }
      else if (row === undefined) {
        resolve({ error: 'User not found!' });
      }
      else {
        const user = { id: row.id, username: row.username, role: row.role };
        resolve(user);
      }
    });
  });
};