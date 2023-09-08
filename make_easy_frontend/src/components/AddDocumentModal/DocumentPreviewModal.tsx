import { useEffect, useState } from 'react';
import { Button } from '../../components/Button/Button';
import loader from "../../assets/images/loader.gif";
import { Link } from 'react-router-dom';

interface PropData {
    close: any,
    data?: any
}

const DocumentPreviewModal = (props: PropData) => {
    const [showLoader,setShowLoader] = useState(true)

    const onCancel = () => {
        
        props.close()
    }
    
    const getPreview = () => {
        var ext = props.data.DocumentUrl.split(".").pop();
        if (ext == "pdf") {
            return (<iframe src={props.data ? props.data.DocumentUrl : ""} height={550} width="100%"></iframe>)
        } else if (ext == "ppt") {
            return <span>Not supported</span>
        } else if (ext == "xls") {
            return <span>Not supported</span>
        } else if (ext == "doc") {
            return <span>Not supported</span>
        } else if (ext == "jpg") {
            return (<img src={props.data ? props.data.DocumentUrl : ""} width="100%" alt="" />)
        } else if (ext == "zip") {
            return <span>Not supported</span>
        } else if (ext == "docx") {
            return <span>Not supported</span>
        } else if (ext == "txt") {
            return "/static/img/txticon.png";
        } else if (ext == "jpeg") {
            return (<img src={props.data ? props.data.DocumentUrl : ""} alt="" width="100%" />)
        } else if (ext == "csv") {
            return <span>Not supported</span>
        } else if (ext == "mp4") {
            return (<iframe src={props.data ? props.data.DocumentUrl : ""} height={550} width="100%"></iframe>)
        } else if (ext == "gif") {
            return <span>Not supported</span>
        }else if (ext == "png") {
            return (<img src={props.data ? props.data.DocumentUrl : ""} alt="" width="100%" />)
        } else if (ext == "video") {
            return (<iframe src={props.data ? props.data.DocumentUrl : ""} height={550} width="100%"></iframe>)
        }
        else {
            return <span>Not supported</span>
        }
    }

    const  printDiv = () => {
        window.print();
        // var  printContents:any = getPreview() ;
        // var originalContents:any = document.body.innerHTML;
        // document.body.innerHTML = printContents;
        // window.print();
        // document.body.innerHTML = originalContents;
    }


    return (
        <>
            <div className='delete-modal'>
                <div className=''>
                    <div className=' row align-items-center'>
                        <div className='col-12 text-end my-3'>
                            <Button onClick={()=>printDiv()} label='Print' size='large' b_type='CANCEL' />
                            <span>&nbsp;</span>
                            <Link to={props?.data?.DocumentUrl ? props?.data?.DocumentUrl : ""} target="_blank" download={props?.data?.DocumentName ? props?.data?.DocumentName : ""}><Button label='Download' size='large' /></Link>
                            

                        </div>
                    </div>
                    <div className='frame-view'>
                        {/* { showLoader == true && 
                              <div style={{ textAlign: "center" }}>
                              <img
                                style={{ position: "relative" }}
                                src={loader}
                                alt="No loader found"
                              />
                              <div style={{ position: "relative", color: "white" }}>
                                Loading...
                              </div>
                            </div>
                        } */}
                        {
                            getPreview()
                        }
                        
                    </div>
                    <div className='d-flex justify-content-center mt-4 mb-4'>
                        <span className='px-2'></span>
                        <Button size='large' label='Close' b_type='CANCEL' onClick={() => onCancel()} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default DocumentPreviewModal;