/* Data Access Object (DAO) */
const { db } = require('../db');

exports.getName = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM nameSite';
    db.get(sql, [], (err, row) => {
      if (err) {
        reject(err);
      }
      else {
        const name = row.name
        resolve(name);
      }
    });
  });
};

exports.updateName = (newName) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE nameSite SET name=? WHERE id=1';
    db.run(sql, [newName], (err) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(this.name);
      }
    });
  });
};
