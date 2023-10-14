import { useState, useEffect } from 'react'
import API from '../API';

function Images(props) {

  const [images, setImages] = useState([]);

  useEffect(() => {
    // get all the pages from API
    const getImages = async () => {
      API.getImages()
      .then((images) => { setImages(images)})
      .catch((e) => props.setMessage({ msg: String(e), type: "danger" }));
    }
    getImages(images);
  }, []);

  return (
    <>
      <div >
        {
          images.map((i) => <Image i={i} key={i.id} />)
        }
      </div>
    </>
  );
}

function Image(props) {


  return (
    <div>
      <div>{props.i.name} </div>
      <img src={props.i.path} width="125" height="125" />
    </div>
  );


}

export default Images;