import { Link } from 'react-router-dom';
import { Form, Navbar, Button, Container } from 'react-bootstrap';
import API from '../API';
import { useState } from 'react';
import { LogoutButton } from './AuthComponent';


function NavHeader(props) {

    const [change, setChange] = useState(false)


    const handleSubmit = (event) => {
        event.preventDefault();

        
        API.updateNameSite(props.nameSite)
            .then(() => { props.setDirty(true); setChange(false); })
            .catch((e) => { props.setMessage({msg:String(e.error), type:"danger"}) });

    }


    return (
        <Navbar bg="primary" variant="dark">
            <Container fluid>

                <Link to='/' className='btn btn-outline-light'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-house-fill" viewBox="0 0 16 16">
                        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z" />
                        <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z" />
                    </svg>
                </Link>

                <Form onSubmit={handleSubmit} style={{ display: "flex" }}>
                    <Form.Control className="text-center" type="text" required minLength={2} maxLength={10} disabled={props.loggedIn && props.user.role === 'Admin' ? false : true} value={props.nameSite} onChange={(event) => { props.setNameSite(event.target.value); setChange(true); }} />
                    &nbsp;
                    {change && <Button type="submit" variant='info'> Apply Name</Button>}
                </Form>

                {props.loggedIn ?
                    <div>
                        <Link to='/yourPages' className='btn btn-outline-light' state={true}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            </svg>
                            &nbsp;
                            {props.user.username}
                        </Link>
                        &nbsp;
                        <LogoutButton logout={props.handleLogout} /> </div> :
                    <Link to='/login' className='btn btn-outline-light'>Login</Link>
                }

            </Container>

        </Navbar>
    );
}

export default NavHeader;