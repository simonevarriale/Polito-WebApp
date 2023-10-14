'use strict';

const dayjs = require('dayjs');

function Page(id, title, author, creationDate, publicationDate) {
  this.id = id;
  this.title = title;
  this.author = author;
  this.creationDate = dayjs(creationDate).format('YYYY-MM-DD');
  this.publicationDate = publicationDate;
}

function Content(id, type, value, position) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.position = position;
  }


module.exports = { Page, Content };