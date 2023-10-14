const SERVER_URL = 'http://localhost:3001';
import { Page } from "./Model";

const getPages = async (logged) => {
  
  const response =  logged ? await fetch(SERVER_URL + '/api/pages', {credentials: 'include'}) : await fetch(SERVER_URL + '/api/filteredPages');

  if (response.ok) {
    const pagesJson = await response.json();
    return pagesJson.map(p => new Page(p.id, p.title, p.author, p.creationDate, p.publicationDate));
  }
  else
    throw new Error('Error in retrieving the list of pages! ');
  
}

const getPage = async (pageID) => {

  const response = await fetch(SERVER_URL + '/api/pages/' + pageID);
  if (response.ok) {
    const pageJson = await response.json();
    return pageJson;
  }
  else
    throw new Error('Error in retrieving the content of the page!');

}

const addPage = async (page, content) => {

  const response = await fetch(`${SERVER_URL}/api/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: page, content: content }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const updatePage = async (page, content) => {
  const response = await fetch(`${SERVER_URL}/api/pages/${page.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: page, content: content }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + '/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  }
  else {
    const errDetails = await response.json();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    credentials: 'include',
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user;  // an object with the error coming from the server
  }
};

const logOut = async () => {
  const response = await fetch(SERVER_URL + '/api/sessions/current', {
    method: 'DELETE',
    credentials: 'include'
  });
  if (response.ok)
    return null;
}

const getImages = async () => {
  const response = await fetch(SERVER_URL + `/api/images`);
  if (response.ok) {
    const imagesJson = await response.json();
    return imagesJson;
  }
  else
    throw new Error('Error in retrieving the list of images');
}

const deletePage = async (pageId) => {

  const response = await fetch(SERVER_URL + "/api/pages/" + pageId, {
    method: 'DELETE',
    credentials: 'include'
  });

  if (response.ok)
    return null;
  else
  throw new Error('Error in deleting the page!')

}

const getNameSite = async () => {
  const response = await fetch(SERVER_URL + `/api/nameSite`);
  if (response.ok) {
    const nameJson = await response.json();
    return nameJson;
  }
  else
    throw new Error('Error in retrieving the name');
}

const updateNameSite = async (name) => {
  const response = await fetch(`${SERVER_URL}/api/nameSite`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name }),
    credentials: 'include'
  });

  if (!response.ok) {
    const errMessage = await response.json();
    throw errMessage;
  }
  else return null;
}

const getAllUsers = async () => {
  const response = await fetch(SERVER_URL + `/api/users`, {credentials: 'include'});
  if (response.ok) {
    const usersJson = await response.json();
    return usersJson;
  }
  else
    throw new Error('Error in retrieving the list of users');
}

const API = { getPages, getPage, addPage, updatePage, logIn, logOut, getUserInfo, getImages, deletePage, getNameSite, updateNameSite, getAllUsers };
export default API;