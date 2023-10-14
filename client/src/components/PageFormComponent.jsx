import { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../API';
import Images from './ImagesComponent';
import { Page, Content } from '../Model';


function PageForm(props) {

  let { pageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const editablePage = location.state.page;
  const editableContent = location.state.content;

  const [waiting, setWaiting] = useState(false);

  //state for page element
  const [id, setId] = useState(editablePage ? editablePage.id : -1);
  const [title, setTitle] = useState(editablePage ? editablePage.title : '');
  const [author, setAuthor] = useState(editablePage ? editablePage.author : props.user.username);
  const [publicationDate, setPublicationDate] = useState(editablePage.publicationDate ? dayjs(editablePage.publicationDate).format('YYYY-MM-DD') : '');

  //state to keep track of content
  const [blockList, setBlockList] = useState(editableContent ? editableContent : [{ type: "Header", value: "" }, { type: "Paragraph", value: "" }]);

  const [errorDate, setErrorDate] = useState('');
  const [errorBlock, setErrorBlock] = useState('');

  const [users, setUsers] = useState([]);

  //this state is updated only if the user that opened the form is an Admin
  if (props.user.role === 'Admin') {
    useEffect(() => {
      // get all the users from API

      const getUsers = async () => {
        API.getAllUsers()
        .then( users => { setUsers(users) })
        .catch( (e) => { props.setMessage( {msg: String(e), type: "danger"})})
        
      }

      getUsers();
    }, []);
  }

  const handleBlockAdd = (type) => {

    const list = [...blockList, { type: type, value: "" }];

    setBlockList(list);

    if (list.length > 1 && list.find(b => b.type == "Header")) {
      setErrorBlock("");
    }

  }

  const handleBlockRemove = (index) => {
    const list = [...blockList];

    list.splice(index, 1);

    if (list.length < 2 || !list.find(b => b.type == "Header")) {
      setErrorBlock("You need to have at least 2 block and 1 should be of header type!");
    }

    setBlockList(list);
  }

  const handleMovement = (where, index) => {
    const list = [...blockList];

    list[index - 1 * where] = list.splice(index, 1, list[index - 1 * where])[0];

    setBlockList(list);
  }

  const handleValues = (event, index) => {
    const { type, value } = event.target;
    const list = [...blockList];
    list[index].value = value;

    setBlockList(list);
  }

  const handleDateChange = (event) => {
    const selectedDate = event.target.value;
    const today = dayjs()


    if (dayjs(selectedDate).isBefore(today, 'day')) {
      setErrorDate('Time travel has not been created yet!');
      setPublicationDate('');
    } else {
      setPublicationDate(selectedDate);
      setErrorDate('');
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();

    //check if publicationDate is not defined
    if (!publicationDate) {
      setPublicationDate('')
    }
 
    const page = new Page(id, title, author, dayjs(), publicationDate);

    const idContent = -1;
    const content = blockList.map((b, index) => {
      return new Content(idContent, b.type, b.value, index);
    })

    setWaiting(true);
    props.setDirty(true);

    if (editablePage) {
      API.updatePage(page, content)
        .then(() => { setWaiting(false); navigate(`/pages/${pageId}`) })
        .catch((e) => { props.setMessage({msg:String(e.error), type:"danger" }); navigate(`/`) });
    }
    else {

      API.addPage(page, content)
        .then(() => { setWaiting(false); navigate(`/`) })
        .catch((e) => { props.setMessage({msg:String(e.error), type:"danger" }); navigate(`/`) });
    }

  }

  return (
    <>

      <Form onSubmit={handleSubmit} >

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gridGap: 20 }}>

          <div>
            {waiting && <Alert variant="secondary">Please, wait for the server's answer...</Alert>}

            <Form.Group className='mb-3'>
              <Form.Label>Author</Form.Label>
              {
                props.user.role === 'Admin' ?
                  <Form.Select type="input" required={true} value={author} onChange={(event) => setAuthor(event.target.value)}>

                    {
                      users.map((u, index) => <option value={u} key={index}>{u}</option>)
                    }

                  </Form.Select>

                  : <Form.Control type="text" value={author} disabled></Form.Control>
              }

            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" minLength={2} maxLength={100} required={true} value={title} onChange={(event) => setTitle(event.target.value)}></Form.Control>
            </Form.Group>
            <Form.Group className='mb-3'>
              <Form.Label>Publication Date</Form.Label>
              <Form.Control type="date" value={publicationDate} onChange={(event) => handleDateChange(event)}></Form.Control>
              {errorDate && <Alert variant='danger' severity="error" >{errorDate}</Alert>}
            </Form.Group>

            <div className="d-grid gap-3">

              <Row>
                <Col>
                  <Button variant="primary" type="button" style={{ marginBottom: 2 }} onClick={() => handleBlockAdd("Header")}>New Header</Button>
                  &nbsp;
                  <Button variant="primary" type="button" style={{ marginBottom: 2 }} onClick={() => handleBlockAdd("Paragraph")}>New Paragraph</Button>
                  &nbsp;
                  <Button variant="success" type="button" style={{ marginBottom: 2 }} onClick={() => handleBlockAdd("Image")}>New Image</Button>
                </Col>
              </Row>


              <Row>
                {editablePage ?
                  <><Col><Button variant="primary" type="submit" disabled={errorBlock ? true : false} style={{ marginBottom: 2 }}>Update Page</Button> <Link to='../..' relative='path' className='btn btn-danger'>Cancel</Link></Col>
                    {errorBlock && <Alert variant='danger' severity="error" >{errorBlock}</Alert>}
                  </> :
                  <><Col><Button variant="primary" type="submit" disabled={errorBlock ? true : false} style={{ marginBottom: 2 }} >Add Page</Button> <Link to='../..' relative='path' className='btn btn-danger'>Cancel</Link></Col>
                    {errorBlock && <Alert variant='danger' severity="error" >{errorBlock}</Alert>}
                  </>
                }
              </Row>


            </div>


          </div>
          <div>
            {blockList.map((singleBlock, index) => (

              <Form.Group key={index} className='mb-3'>

                <Form.Label >{singleBlock.type} </Form.Label>

                {singleBlock.type !== "Image" ?
                  <Form.Control type="text" minLength={2} maxLength={540} required={true} value={singleBlock.value} onChange={(event) => handleValues(event, index)}></Form.Control>
                  :
                  <Form.Select type="input" required={true} value={singleBlock.value == '' ? singleBlock.value = "/Images/Torino.jpg" : singleBlock.value} onChange={(event) => handleValues(event, index)}>

                    <option value="/Images/Torino.jpg">Torino</option>
                    <option value="/Images/Milano.jpg">Milano</option>
                    <option value="/Images/Napoli.png">Napoli</option>
                    <option value="/Images/Bologna.jpg">Bologna</option>
                    <option value="/Images/Catania.jpg">Catania</option>
                    <option value="/Images/Firenze.jpg">Firenze</option>
                    <option value="/Images/Genova.jpg">Genova</option>
                    <option value="/Images/Matera.jpg">Matera</option>
                    <option value="/Images/Roma.jpg">Roma</option>
                    <option value="/Images/Venezia.jpg">Venezia</option>

                  </Form.Select>

                }

                {
                  index == 0 ? <></> :
                    <>
                      <Button variant="primary" type="button" className="btn btn-danger" style={{ marginTop: 5 }} onClick={() => handleBlockRemove(index)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z" />
                      </svg>
                      </Button>
                      &nbsp;
                      <Button variant="primary" type="button" className="btn btn-info" style={{ marginTop: 5 }} onClick={() => handleMovement(1, index)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-up" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z" />
                        </svg>
                      </Button>
                      &nbsp;

                    </>
                }

                {
                  index !== blockList.length - 1 && index !== 0 ? <Button variant="primary" type="button" className="btn btn-info" style={{ marginTop: 5 }} onClick={() => handleMovement(-1, index)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-down" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z" />
                    </svg>
                  </Button>
                    : <></>
                }

              </Form.Group>

            ))}

          </div>
          <div >

            <header> You can choose an image from the following set:</header>
            <Images setMessage={props.setMessage} > </Images>

          </div>

        </div>

      </Form>

    </>
  );
}

export default PageForm;