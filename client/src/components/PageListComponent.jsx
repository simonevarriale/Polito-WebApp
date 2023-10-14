import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function PageList(props) {
  let filteredPages = props.pages;

  return (
    <>

      <Table striped style={{ marginTop: 10 }}>

        <thead>
          <tr><th>Title</th><th>Author</th><th>Creation Date</th><th>Publication Date</th><th></th></tr>
        </thead>
        <tbody>
          {
            filteredPages.map((p, index) => <PageRow page={p} key={p.id} index={index + 1} />)
          }
        </tbody>
      </Table>

    </>
  );
}

function PageRow(props) {

  return (
    <>
      <tr>
        <td>{props.page.title}</td>
        <td>{props.page.author}</td>
        <td>{props.page.creationDate}</td>
        <td>{props.page.publicationDate}</td>
        <td><Link className='btn btn-success' role='button' to={`/pages/${props.page.id}`}>Visit</Link></td>
      </tr>
    </>
  );
}