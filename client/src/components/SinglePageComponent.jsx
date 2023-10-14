import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../API';
import dayjs from 'dayjs';

function SinglePage(props) {

  return (
    <>
      <Row>
        <PageHeader page={props.page} content={props.content} loggedIn={props.loggedIn} user={props.user} setDirty={props.setDirty} setMessage={props.setMessage} />
      </Row>

      <dl>
        {
          props.content.map((b) => <PageContent block={b} key={b.id} />)
        }
      </dl>

    </>
  );
}


function PageHeader(props) {


  const deletePage = (pageId) => {
    
    API.deletePage(pageId)
      .then(() => { props.setDirty(true);})
      .catch(e => { props.setMessage({msg: String(e), type: 'danger'}) });
  }

  return (
    <>
      <div style={{ display: "flex" }}>
        {
          ((props.loggedIn && props.user.username === props.page.author) || (props.loggedIn && props.user.role === 'Admin')) ?
            <Col>
              <Link to={`/pages/${props.page.id}/edit`} className='btn btn-primary' role='button' state={{ page: props.page, content: props.content }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
                </svg>
              </Link>
              &nbsp;
              <Link to={`/`} className='btn btn-danger' role='button' onClick={() => deletePage(props.page.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                </svg>

              </Link>
            </Col>
            :
            <></>
        }
        {
          props.page.publicationDate ? 
            ( dayjs(props.page.publicationDate).isBefore(dayjs()) ?
            <div className="text-end" style={{ textAlign: "end" }}>
              Published on {props.page.publicationDate} by <span className="badge rounded-pill text-bg-secondary text-end">{props.page.author} </span>
            </div> 
            : <div className="text-end" style={{ textAlign: "end" }}>
            Will be published on {props.page.publicationDate} by <span className="badge rounded-pill text-bg-secondary text-end">{props.page.author} </span>
            </div>
            )
            : <></>
        }


      </div>

      <Col  as="p">
        <strong style={{ fontSize: 26 }} >Title: {props.page.title}</strong>
      </Col>

    </>
  );
}


function PageContent(props) {

  const type = props.block.type;


  if (type === 'Header') {

    return (
      <h1 className='lead' style={{ fontSize: 24 }}> {props.block.value}</h1>
    );
  }
  else if (type === 'Paragraph') {

    return (<p className='lead' style={{ fontSize: 18 }} > {props.block.value}</p>);

  }
  else {


    return (<img src={props.block.value} width="1000" height="500" />);

  }


}

export default SinglePage;