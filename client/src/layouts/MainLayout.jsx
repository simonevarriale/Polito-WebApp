import { React } from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import PageList from '../components/PageListComponent';

function MainLayout(props) {

    const dirty = props.dirty;

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
                            <p className='lead'> There are {props.pages.length} pages available. </p>
                        </Col>
                    </Row>

                    {props.loggedIn ?
                        <Row>
                            <Col>
                                <Link to='/pages/addPage' className='btn btn-primary' role='button' state={{ page: '', content: '' }}>New Page</Link>
                            </Col>
                        </Row>
                        :
                        <></>
                    }

                    <PageList pages={props.pages} />
                </>
            }

        </>
    )
}

export { MainLayout };