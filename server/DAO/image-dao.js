/* Data Access Object (DAO) */
const { db } = require('../db');

/** Images **/
// get all the images
exports.getImages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM image';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows.length == 0) {
        resolve({ error: 'There are no pages' });
      }
      else {
        const images = rows.map((i) => {
          const image = Object.assign({}, i)
          return image;
        });
        resolve(images);
      }

    });
  });
}