import { React, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import API from '../API';
import SinglePage from '../components/SinglePageComponent';

function PageLayout(props) {

    //state for content of the single page
    const [content, setContent] = useState([]);

    // get the pageId from the URL to retrieve the right page and its content
    const params = useParams();
  
    const page = props.pages.find((p) => p.id == params.pageId);

    const setLoading = props.setLoading;

    const getPage = async () => {
      API.getPage(params.pageId)
      .then((blocks) => {setContent(blocks)})
      .catch((e) => props.setMessage({ msg: String(e), type: "danger" })); 
    }
  
    useEffect(() => {
      // get page content from API  
      setLoading(true); 
      getPage();
      setLoading(false); 
    }, []);

    return (
        <>
            {page ?
                <>
                <SinglePage page={page} content={content} loggedIn={props.loggedIn} user={props.user} setDirty={props.setDirty} setMessage={props.setMessage}/>
                </>    
                :
                <p className='lead'>The selected page does not exist!</p>
            }

        </>
    )
}

export { PageLayout };