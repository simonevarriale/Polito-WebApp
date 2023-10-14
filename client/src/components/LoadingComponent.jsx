/* This layout shuld be rendered while we are waiting a response from the server.
*/
import { Spinner } from "react-bootstrap";
function LoadingLayout() {
 return (
  <div style={{ display: 'flex', justifyContent: 'center' }} >
   <Spinner animation="border" className="spinner"/>
   </div>
 )
}

export default LoadingLayout;