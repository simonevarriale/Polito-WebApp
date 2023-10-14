import { React } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import PageList from '../components/PageListComponent';

function PersonalLayout(props) {

    const dirty = props.dirty;
    const username = props.user.username;

    let yourPages = props.pages.filter( (p) => p.author === username );

    return (
        <>
            {dirty ?
                <Button variant="primary" disabled>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    Loading...
                </Button>
                :
                <>
                    <Row>
                        <Col>
                            <p className='lead'> Welcome back to your personal area <strong>{props.user.username}</strong> </p>
                            <p className='lead'> You have created {yourPages.length} pages  </p>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Link to='/pages/addPage' className='btn btn-primary' role='button' state={{ page: '', content: '' }}>New Page</Link>
                        </Col>
                    </Row>
                  
                    <PageList pages={yourPages} />
                </>
            }

        </>
    )
}

export { PersonalLayout };