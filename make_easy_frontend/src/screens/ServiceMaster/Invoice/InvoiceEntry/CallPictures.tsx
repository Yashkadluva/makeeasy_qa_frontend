import React from "react";
import { useState, useEffect } from "react";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import jpgDoc from "../../../../assets/images/jpg-doc.svg";
import loader from "../../../../assets/images/loader.gif";
import imgPlaceholder from "../../../../assets/images/placeholder-image.jpg";
import document from "../../../../assets/images/document-no-found.svg";
import DocPlaceholder from '../../../../assets/images/document-placeholder.jpg';
import { InviceSDMasterState } from '../../../../reducer/CommonReducer';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../config/Store';
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Offcanvas, Card, Row, Col, Form } from 'react-bootstrap';
import { Eye, EyeFill } from 'react-bootstrap-icons';
import "./InvoiceEntry.scss"
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader/Loader";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import CallPictureBlade from "../InvoiceEntryBlade/CallPictureBlade/CallPictureBlade";

const CallPictures = () => {
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [showModal1, setShowModal1] = useState(false);
  const CloseModal1 = () => setShowModal1(false);
  const ShowModal1 = () => setShowModal1(true);
  const [dragActive, setDragActive] = React.useState(false);

  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [ShowLoader, setShowLoader] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [isShowAddDocument, setIsShowAddDocument] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [documentData, setDocumentData] = useState([])
  const [editDocumentData, setEditDocumentData] = useState<any>([])
  const [isShoWDocumentPreview, setIsShoWDocumentPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    getDocuments();
  }, []);



  const getDocuments = () => {
    setShowLoader(true);
    WebService.getAPI({
      action:
        "EntityDocument/GetInvoiceDocuments/" +
        user_info["AccountId"] +
        "/" +
        user_info["CompanyId"] + "/" + invoceSDMaster?.invoceSDMaster.Id,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false)
        setDocumentData(res.Data)
      })
      .catch(() => {
        setShowLoader(false);
      });
  };

  const editDocument = (e: any) => {
    let temp = [e];
    setEditDocumentData(temp)
    setIsShowAddDocument(true)
  }

  const onDelete = (data: any) => {
    console.log(data)
    setShowDeleteModal(true);
    var obj = {
      id: data.DocumentId,
      entityId: data.EntityId,
      entityType: data.EntityType,
    };
    setDeletedData(obj);
  };

  const onDeleteDocument = () => {
    setShowDeleteModal(false);
    setLoading(true)
    WebService.deleteAPI({
      action:
        `EntityDocument/${user_info["AccountId"]}/${user_info["CompanyId"]}/${deletedData.entityId}/${deletedData.entityType}/` +
        deletedData.id,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Call Picture deleted successfully.");
        setShowDeleteModal(false);
        setLoading(false)
        getDocuments();
      })
      .catch((e) => {
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };



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
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // handleFiles(e.target.files);
    }
  };

  const viewPreview = (data: any) => {
    setPreviewData(data)
    setIsShoWDocumentPreview(true)
  }

  const closeAddDocument = (e: any) => {
    setIsShowAddDocument(false);
    setEditDocumentData([])
    getDocuments()
  }



  return <>
    <Loader show={isLoading} />

    <CallPictureBlade
      isShow={isShowAddDocument}
      title="Add Document"
      isClose={closeAddDocument}
      popupData={documentData}
      isEquipId={editDocumentData}
    />

    <DraggableModal isOpen={isShoWDocumentPreview}
      onClose={() => setIsShoWDocumentPreview(false)}
      title="Document preview"
      type="DOCUMENT_PREVIEW"
      width={600}
      data={previewData} />

    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeleteDocument}
      data={deletedData}
    />

    <div className=''>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Call Pictures'} />
          <Card className="card-style form-style invoice-call-picture-card">
            <div className="px-3 pb-2 pt-3">
              <Row className="align-items-center">
                <Col md={5} className=" ">
                </Col>
                <Col className="text-end"><Button variant="light" className="btn-brand-light" onClick={() => setIsShowAddDocument(true)} >+ Add Pictures</Button></Col>
              </Row>
            </div>
            <Card.Body className=" ">
              <div className="mt-1 add-document">
                {
                  ShowLoader == true ?
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
                    :
                    <Row className='justify-content-center'>
                      {
                        documentData.length == 0 ?
                          <Col md={6}>
                            <div className='text-center'>
                              <img src={document} alt="" width={70} className="mb-3 " />
                              <p className='font-w-medium text-dark'>Documents aren’t uploaded.</p>
                            </div>
                            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className='col-12 d-flex mb-3'>
                              <input type="file" id="input-file-upload1" multiple={true} onChange={handleChange} />
                              <label onClick={() => setIsShowAddDocument(true)} id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                                <div className='d-flex'><img src={require('../../../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' /> Upload Document</div>
                              </label>
                              {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}

                            </form>
                          </Col>
                          :
                          <div className="">
                            <div className="">
                              <Row>
                                {
                                  documentData.length > 0 && documentData.map((item: any, index: number) => {
                                    return (
                                      <Col xl={2} lg={2} sm={3} md={4}>
                                        <div className="img-box-view">
                                          <div className="document-image-div">
                                            <div className="img-wrap">
                                              <img onClick={() => editDocument(item)} src={item.ThumbnailUrl ? item.ThumbnailUrl : DocPlaceholder} alt="imag" className="image cursor-pointer" />
                                              <div className="action-btns action-ele document-action-btns">
                                                {/* <a className="text-dark ms-2 font-18 cursor-pointer" onClick={() => viewPreview(item)}><EyeFill size={18} className="text-white" /></a>
                                                <a className="text-dark ms-2 font-18 cursor-pointer" onClick={() => editDocument(item)}><img src={editicon} alt="" height={20} /></a> */}
                                                <a className="text-dark ms-2 font-18 cursor-pointer" onClick={() => onDelete(item)}><img src={deleteicon} alt="" height={25} /></a>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="img-descrp text-truncate ">{(item.Description)}</div>
                                          <div className=" ">
                                            <div className="username text-truncate">{item.CreatedBy}</div>
                                            <div className="date text-truncate">{HelperService.getFormatedDateAndTime(item.RecordCreatedOn)}</div>
                                          </div>
                                        </div>
                                      </Col>
                                    )
                                  })
                                }
                              </Row>
                            </div>
                          </div>
                      }
                    </Row>
                }
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>

    {/* Add Call Blade  */}
    <Offcanvas show={showModal1} onHide={CloseModal1} placement={'end'} className="offcanvas-large">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Call Picture</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="px-0 pb-0">
        <Form className="form-style">
          <div className="px-4  modal-inner-min-h">
            <Row>
              <Col md={6}>
                <Row className="mb-3">
                  <Col md={12} className="add-document">
                    <div className=' '>
                      <label>Upload Picture</label>
                    </div>
                    <div id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className='col-12 d-flex mb-3'>
                      <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                        <div className='d-flex'><img src={require('../../../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' /> Upload Document</div>
                      </label>
                      {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}

                    </div>
                  </Col>
                  <Col md="12" className="mb-3">
                    <Form.Label className="mb-2"> Description</Form.Label>
                    <textarea className="form-control h-auto" rows={3}></textarea>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="ShowToCustomer">
                      <Form.Check type="checkbox" label="Show To Customert" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="ShowToTechnician">
                      <Form.Check type="checkbox" label="Show To Technician" />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Button variant="primary" className="btn-brand-solid w-100">Add Document</Button>
                  </Col>
                </Row>
                <Card className="mb-2 bg-transparent ">
                  <Card.Body className="py-2 border-bottom border-light">
                    <Row className="align-items-center">
                      <Col md={9}>
                        <p className="mb-0 text-brand">IMGw8u.jpg</p>
                        <p className="mb-0 text-dark">KFG</p>
                      </Col>
                      <Col md={3} className="text-end">
                        <a href="javascript:void(0)" className="me-2"> <Eye size={18} /> </a>
                        <a href="javascript:void(0)"> <img src={deleteicon} width={18} className="theme-icon-color" /> </a>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Body className="py-2 border-bottom border-light ">
                    <Row className="align-items-center">
                      <Col md={9}>
                        <p className="mb-0 text-brand">IMGw8u.jpg</p>
                        <p className="mb-0 text-dark">KFG</p>
                      </Col>
                      <Col md={3} className="text-end">
                        <a href="javascript:void(0)" className="me-2"> <Eye size={18} /> </a>
                        <a href="javascript:void(0)"> <img src={deleteicon} width={18} className="theme-icon-color" /> </a>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Body className="py-2 border-bottom border-light ">
                    <Row className="align-items-center">
                      <Col md={9}>
                        <p className="mb-0 text-brand">IMGw8u.jpg</p>
                        <p className="mb-0 text-dark">KFG</p>
                      </Col>
                      <Col md={3} className="text-end">
                        <a href="javascript:void(0)" className="me-2"> <Eye size={18} /> </a>
                        <a href="javascript:void(0)"> <img src={deleteicon} width={18} className="theme-icon-color" /> </a>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Body className="py-2 border-bottom border-light ">
                    <Row className="align-items-center">
                      <Col md={9}>
                        <p className="mb-0 text-brand">IMGw8u.jpg</p>
                        <p className="mb-0 text-dark">KFG</p>
                      </Col>
                      <Col md={3} className="text-end">
                        <a href="javascript:void(0)" className="me-2"> <Eye size={18} /> </a>
                        <a href="javascript:void(0)"> <img src={deleteicon} width={18} className="theme-icon-color" /> </a>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <label>Preview</label>
                <Card className="bg-transparent p-2 text-center">
                  <img src={imgPlaceholder} width="200" className="mx-auto" alt="" />
                </Card>
              </Col>
            </Row>

          </div>


          <div className="offcanvas-footer">
            <Button variant="primary" className="btn-brand-solid me-3" type="submit">Submit</Button>
            <Button variant="primary" className="btn-brand-outline" type="button" onClick={CloseModal1}>Cancel</Button>
          </div>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>

  </>;
};

export default CallPictures;


