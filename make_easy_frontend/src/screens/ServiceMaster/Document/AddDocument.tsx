import React, { useState } from 'react';
import { Button } from '../../../components/Button/Button';
import './AddDocument.scss';
import deleteicon from "../../../assets/images/delete-icon.svg";
import viewIcon from '../../../assets/images/Preview.svg';
import BackComponent from "../../../components/BackComponent/BackComponent";
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

const AddDocument = () => {
    const [dragActive, setDragActive] = React.useState(false);
    const [documentURL, setDocumentURL] = useState("https://www.orimi.com/pdf-test.pdf")
    const handleDrag = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers when file is dropped
    const handleDrop = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // handleFiles(e.dataTransfer.files);
        }
    };

    // triggers when file is selected with click
    const handleChange = function (e: any) {
        setDocumentURL(URL.createObjectURL(e.target.files[0]))
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            // handleFiles(e.target.files);
        }
    };

    return (
        <>
            <div className='page-content-wraper'>
                <div className="back-arrow">
                    <BackComponent title={'Add Document'} />
                </div>
                <Card className='content-card card-shadow add-document'>
                    <div className=' main-view row form-style'>

                        {/* Left Side View */}
                        <div className='col-6'>
                            <div className='upload-document '>Upload Document</div>
                            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className='col-12 d-flex mb-3'>
                                <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                                <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                                    <div className='d-flex'><img src={require('../../../assets/images/upload-icon.svg').default} className='me-1' alt='loading...' /> Upload Document</div>
                                </label>
                                {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                            </form>
                            <div className='upload-document'>Description</div>
                            <textarea className='form-control' />
                            <div className='customer-technician-view d-flex row '>
                                <div className='col-6 customer'>
                                    {/* <input type="checkbox" className="checkbox me-2" /> Show to customer */}
                                    <Form.Group className="mb-3" controlId="ShwToCustomer">
                                        <Form.Check type="checkbox" label="Show to customer" />
                                    </Form.Group>
                                </div>
                                <div className='col-6  d-flex justify-content-end'>
                                    {/* <input type="checkbox" className="checkbox me-2" /> Show to technician */}
                                    <Form.Group className="mb-3" controlId="ShwToTechnician">
                                        <Form.Check type="checkbox" label="Show to technician" />
                                    </Form.Group>
                                </div>
                            </div>
                            <div className='add-document-buuton'>
                                <Button label='Add Document' size='large' />
                            </div>
                            <div className='document-list'>Document List</div>
                            <div className='list-view'>
                                <div className=' row'>
                                    <div className='col-6'>
                                        <div className='document-heading'>sjaiaaa_june.xlsx</div>
                                        <div className='document-subheading'>KFG</div>
                                    </div>
                                    <div className='col-6 text-end mt-1'>
                                        <img
                                            src={viewIcon}
                                            id="img_downarrow"
                                            height={20}
                                            className="deleteicon me-2"
                                            alt="downarrow"
                                        />
                                        <img
                                            src={deleteicon}
                                            id="img_downarrow"
                                            height={20}
                                            className="deleteicon"
                                            alt="downarrow"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side View */}
                        <div className='col-6'>
                            <div className=' row align-items-center'>
                                <div className='col-3 pt-3 preview'>Preview</div>
                                <div className='col-6 text-center'>
                                    <Button label='Print' size='large' b_type='CANCEL' />
                                    <span>&nbsp;</span>
                                    <Button label='Download' size='large' />

                                </div>
                                <div className='col-3 text-end'><img
                                    src={
                                        require("../../../assets/images/Zoom.svg").default
                                    } alt='loading...'
                                    className='mt-2'
                                /></div>
                            </div>
                            <div className='frame-view'>
                                <iframe src={documentURL} height={550} width="100%"></iframe>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </>
    )
}

export default AddDocument;