import { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const credentials = { username, password };
    props.login(credentials);
  };

  return (
    <Row className="vh-100 justify-content-md-center">
      <Col md={4} >
        <h1 className="pb-3">Login</h1>

        <Form onSubmit={handleSubmit} >
          <Form.Group controlId='username'>
            <Form.Label>Username</Form.Label>
            <Form.Control type='username' value={username} onChange={ev => setUsername(ev.target.value)} required={true} />
          </Form.Group>

          <Form.Group controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' value={password} onChange={ev => setPassword(ev.target.value)} required={true} minLength={6} />
          </Form.Group>

          <Button type="submit" style={{ marginTop: 5 }}>Login</Button>
        </Form>

      </Col>
    </Row>
  )
};

function LogoutButton(props) {
  return (
    <Link to='/'><Button className='link' variant='outline-light' onClick={props.logout}>Logout</Button></Link>
  )
}

export { LoginForm, LogoutButton };