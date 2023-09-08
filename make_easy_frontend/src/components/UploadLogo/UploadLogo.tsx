import React, { useState } from "react";
import {CloudArrowUp } from 'react-bootstrap-icons';

interface PropData {
  data?: any;
  imageUrl:any
}


const UploadLogo = (props: PropData) => {
    const [toogleValue, setToggleValue] = useState(false);
    return (
        <div className="upload-img mb-2">
          <div className="image-wraper">
              
              <img src={props.imageUrl ? props.imageUrl : "images/placeholder-image.jpg"}className="logo-img" alt="Logo" />
          </div>
          <div className="file btn upload-btn">
            <CloudArrowUp color="royalblue" size={15} /> Upload Logo
            <input type="file" name="file"/>
          </div>
        </div>
    );
};

export default UploadLogo;