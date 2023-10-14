import { useState, useEffect } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Alert } from 'react-bootstrap';
import NavHeader from './components/NavbarComponents'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import NotFound from './components/NotFoundComponent';
import PageForm from './components/PageFormComponent';
import { LoginForm } from './components/AuthComponent';
import API from './API';
import { MainLayout } from './layouts/MainLayout';
import { PageLayout } from './layouts/PageLayout';
import { PersonalLayout } from './layouts/PersonalLayout';
import LoadingLayout from './components/LoadingComponent';


function App() {

  //state for list of pages
  const [pages, setPages] = useState([]);

  const [loggedIn, setLoggedIn] = useState(false);

  // This state contains the user's info.
  const [user, setUser] = useState({});

  const [message, setMessage] = useState('');

  //state for the name of the website
  const [nameSite, setNameSite] = useState([]);

  //state to keep track of changes of pages and name
  const [dirty, setDirty] = useState(true);

  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // get all the pages from API
    const getPages = async (flag) => {
      API.getPages(flag)
        .then(pages => { setPages(pages) })
        .catch((e) => setMessage({ msg: String(e), type: "danger" }))
    }

    // get name of the application from API
    const getNameSite = async () => {
      API.getNameSite()
        .then((name) => { setNameSite(name) })
        .catch((e) => { setMessage({ msg: e, type: "danger" })});
    }

      setLoading(true);
      getNameSite();
      getPages(loggedIn)
      setDirty(false);
      setLoading(false);
    
  }, [dirty, loggedIn]);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const user = await API.getUserInfo();  // here you have the user info, if already logged in
        setUser(user);
        setLoggedIn(true); setLoading(false);
      } catch (err) {
        // mostly unauthenticated user, thus set not logged in
        setUser(null);
        setLoggedIn(false); setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUser(user);
      setLoggedIn(true); 
      setMessage({ msg: `Welcome, ${user.username}!`, type: 'success' });
    } catch (err) {
      setMessage({ msg: String(err.error), type: 'danger' });
    }
  };

  const handleLogout = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setDirty(true);

  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 
          - / (index) -> all the pages
          - /pages/:pageId -> the page with the :pageId and its content
          - /pages/addPage -> the form to add a new page
          - /pages/:pageId/edit -> the form to update the :pageId page
          - /yourPages -> shows the pages created by the user
          - /login -> the page to perform login
          - * -> not found
            
          */}
        <Route element={
          <>
            <NavHeader nameSite={nameSite} setNameSite={setNameSite} setDirty={setDirty} loggedIn={loggedIn} user={user} handleLogout={handleLogout} setMessage={setMessage} />
            <Container fluid className="mt-3">
              {message && <Row>
                <Alert variant={message.type} onClose={() => setMessage('')} dismissible style={{ marginLeft: '5px', marginRight: '5px', display: 'flex', alignItems: 'center', margin: 'auto', }}>{message.msg}</Alert>
              </Row>}
              <Outlet />
            </Container>
          </>} >

          <Route index element={loading ? <LoadingLayout /> : <MainLayout pages={pages} dirty={dirty} loggedIn={loggedIn} />} />
          <Route path='/pages/:pageId' element={loading ? <LoadingLayout /> : <PageLayout pages={pages} loggedIn={loggedIn} user={user} setDirty={setDirty} setLoading={setLoading} setMessage={setMessage} />} />
          <Route path='/pages/addPage' element={loggedIn ? <PageForm setDirty={setDirty} loggedIn={loggedIn} user={user} setMessage={setMessage} /> : <Navigate replace to='/' />} />
          <Route path='/pages/:pageId/edit' element={loggedIn ? <PageForm setDirty={setDirty} loggedIn={loggedIn} user={user} setMessage={setMessage} /> : <Navigate replace to='/' />} />
          <Route path='/yourPages' element={loggedIn ? <PersonalLayout pages={pages} user={user} /> : <Navigate replace to='/' />} />
          <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm login={handleLogin} />} />

          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
