/* Data Access Object (DAO)*/

const { Page, Content } = require('../Model');
const dayjs = require("dayjs");
const { db } = require('../db');

/** Pages **/
// get all the pages
exports.listPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page ORDER BY publicationDate';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows.length == 0) {
        resolve({ error: 'There are no pages' });
      }
      else {
        const pages = rows.map((p) => new Page(p.id, p.title, p.author, p.creationDate, p.publicationDate));
        resolve(pages)

      }

    });
  });
}

/** Pages **/
// get all the pages for non loggedIn users
exports.listFilteredPages = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page ORDER BY publicationDate';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      }
      if (rows.length == 0) {
        resolve({ error: 'There are no pages' });
      }
      else {
        const pages = rows.map((p) => new Page(p.id, p.title, p.author, p.creationDate, p.publicationDate));
        let filteredPages = pages;
         
        filteredPages = pages.filter((p) => {
          if (p.publicationDate !== '') {
            if (dayjs(p.publicationDate).isBefore(dayjs())) {
              return p;
            }
          }
        })

        resolve(filteredPages)

      }

    });
  });
}

// get a page information given its id
exports.getInfoPage = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM page WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      if (row == undefined)
        resolve({ error: 'Page not found.' });
      else {
        const page = new Page(row.id, row.title, row.author, row.creationDate, row.publicationDate);
        resolve(page);
      }
    });
  });
};

// get a page content given its id
exports.getContent = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content WHERE pageId = ? ORDER BY position';
    db.all(sql, [id], (err, rows) => {
      if (err)
        reject(err);
      if (rows == undefined)
        resolve({ error: 'Page not found.' });
      else {

        const pageContent = rows.map((r) => new Content(r.id, r.type, r.value, r.position))
        resolve(pageContent);
      }
    });
  });
};

// add a new page
exports.addPage = (page) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO page(title,author,creationDate,publicationDate) VALUES (?, ?, ?, ?)';
    db.run(sql, [page.title, page.author, page.creationDate, page.publicationDate], function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

// add content of a page
exports.addContentToPage = (pageId, content) => {
  return new Promise((resolve, reject) => {

    content.map((c) => {

      const sql = 'INSERT INTO content(pageID,type,value,position) VALUES (?, ?, ?, ?)';
      db.run(sql, [pageId, c.type, c.value, c.position], function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });

    })

  });
};

//delete content of a page
exports.deletePage = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM page WHERE id=?';
    db.run(sql, [pageId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1)
        resolve({ error: 'No page deleted.' });
      else
        resolve(null);
    });
  });
}

//delete content of a page
exports.deleteContentOfPage = (pageId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM content WHERE pageId=?';
    db.run(sql, [pageId], function (err) {
      if (err) {
        reject(err);
      }
      if (this.changes !== 1)
        resolve({ error: 'No page deleted.' });
      else
        resolve(null);
    });
  });
}

//update descriptor of a page
exports.updatePage = (page) => {

  if (page.publicationDate == "")
    page.publicationDate = null;

  return new Promise((resolve, reject) => {
    const sql = 'UPDATE page SET title=?, author=?, publicationDate=? WHERE id=?';
    db.run(sql, [page.title, page.author, page.publicationDate, page.id], function (err) {
      if (err) {
        reject(err);
      }
      else {

        resolve(this.lastID);
      }
    });
  });
};

