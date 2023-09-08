import { useEffect, useState } from 'react';
import './AddDocumentModal.scss';
import deleteicon from "../../assets/images/delete-icon.svg";
import viewIcon from '../../assets/images/Preview.svg';
import jpgDoc from '../../assets/images/jpg-doc.svg';
import editicon from "../../assets/images/edit.svg";
import DocPlaceholder from '../../assets/images/document-placeholder.jpg';
import { Offcanvas, Col, Card, Button, Form } from "react-bootstrap";
import WebService from "../../utility/WebService";
import { useForm } from "react-hook-form";
import { toast } from 'react-toastify';
import DraggableModal from '../DraggableModal/DraggableModal';
import { X } from "react-bootstrap-icons";
import Loader from '../Loader/Loader';
import HelperService from '../../utility/HelperService';
import { Link } from 'react-router-dom';
interface PropData {
  isShow: boolean;
  title: any;
  isClose: any;
  popupData: any;
  isEquipId?: any;
  Ids?: any;
}

const AddDocumentModal = (props: PropData) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [dragActive, setDragActive] = useState(false);
  const [documentURL, setDocumentURL] = useState<any>([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [documentList, setDocumentList] = useState<any[]>([])
  const [isShoWDocumentPreview, setIsShoWDocumentPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [fileName, setFileName] = useState("");
  const [bladeTitle, setBladeTitle] = useState("Add Document")
  const [showAlertModel, setAlertModel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [showPreviewData, setShowPreviewData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadData, setDownloadData] = useState<any>({ name: "", url: "" });

  useEffect(() => {
    reset({});
  }, []);

  const resetBlade = () => {
    setFileName("");
    setDocumentURL([]);
    reset({});
    setValue("Description", '');
    setValue("ShowToRemoteTech", false);
    setValue("IsExternal", false);
    setShowPreviewData({ type: "img", url: DocPlaceholder })
  }

  useEffect(() => {
    setDocumentList(props.popupData);
    if (props.isEquipId.length > 0 && props.isEquipId[0].DocumentName) {
      props.isEquipId[0].ThumbnailUrl ? getPreview(props.isEquipId[0].ThumbnailUrl) : getPreview(props.isEquipId[0].DocumentUrl)
      setBladeTitle("Edit Document")
      reset(props.isEquipId[0])
      setFileName(props.isEquipId[0].DocumentName)
      setDocumentUrl(props.isEquipId[0].ThumbnailUrl)
      setDocumentURL(props.isEquipId)
    }
    else {
      setBladeTitle("Add Document")
      getPreview("")
      setDocumentUrl("")
      reset({});
    }
  }, [props.popupData, props.isShow]);

  const handleDrag = function (e: any) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onCloseModal = () => {
    resetBlade()
    props.isClose(!props.isShow);
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
    var size = e.target.files[0].size / 1024 / 1024
    if (size < 2) {
      setFileName(e.target.files[0].name)
      setDocumentURL(e.target.files);
      setDocumentUrl(URL.createObjectURL(e.target.files[0]))
      getOnchangePreview(e.target.files[0].name, URL.createObjectURL(e.target.files[0]))
    } else {
      toast.error("File should less then 2mb")
    }

  };

  const onSubmit = (requestBody: any) => {
    if (fileName == "") {
      setAlertModel(true)
      setErrorMessage("Please select a file")
    }
    else if (documentURL[0]?.name) {
      let fromData = new FormData();
      fromData.append("files", documentURL[0]);
      fromData.append("AccountId", user_info["AccountId"]);
      fromData.append("CompanyId", user_info["CompanyId"]);
      fromData.append("Description", requestBody["Description"]);
      fromData.append("IsExternal", requestBody["IsExternal"]);
      fromData.append("ShowToRemoteTech", requestBody["ShowToRemoteTech"]);
      fromData.append("EntityType", `${props?.Ids?.EntityType}`);
      fromData.append("EntityId", `${props?.Ids?.Id}`);
      fromData.append("DocumentType", "0");
      if (props.isEquipId.length > 0 && bladeTitle == "Edit Document") {
        fromData.append("DocumentId", props.isEquipId[0].DocumentId);
        fromData.append("ParentId", props.isEquipId[0].ParentId);
      }
      setLoading(true)
      WebService.postAPI({
        action:
          "EntityDocument",
        body: fromData,
      })
        .then((res: any) => {
          setLoading(false)
          resetBlade()
          bladeTitle == "Add Document" ? toast.success("Document added successfully.") :
            toast.success("Document updated successfully.")
          res.Data.ThumbnailUrl = res.Data.DocumentUrl
          var temp = [...documentList];
          if (bladeTitle == "Add Document") {
            temp.unshift(res.Data)
            setDocumentList(temp)
          } else if (bladeTitle == "Edit Document") {
            setDocumentList(temp.map((item: any) => {
              if (item.DocumentId == res.Data.DocumentId) {
                return res.Data
              } else {
                return item
              }
            })
            )
          }
          resetBlade()
        })
        .catch((e) => {
          setLoading(false)
          if (e.response.data.ErrorDetails.message) {
            setAlertModel(!showAlertModel)
            setErrorMessage(e?.response?.data?.ErrorDetails?.message)
          }
        });
    }
    else if (!documentURL[0]?.name && bladeTitle == "Edit Document" && fileName !== "") {
      requestBody.AccountId = user_info["AccountId"];
      requestBody.CompanyId = user_info["CompanyId"];
      if (props.popupData.length > 0) {
        requestBody.EntityId = props.popupData[0].EntityId;
        requestBody.EntityType = props.popupData[0].EntityType;
      }
      if (props.isEquipId.length > 0 && bladeTitle == "Edit Document") {
        requestBody.DocumentId = props.isEquipId[0].DocumentId;
        requestBody.ParentId = props.isEquipId[0].ParentId;
      }
      setLoading(true)
      WebService.putAPI({
        action:
          "EntityDocument",
        body: requestBody,
      })
        .then((res: any) => {
          setLoading(false)
          res.Data.ThumbnailUrl = res.Data.DocumentUrl
          var temp = [...documentList];
          setDocumentList(temp.map((item: any) => {
            if (item.DocumentId == res.Data.DocumentId) {
              return res.Data
            } else {
              return item
            }
          })
          )

          resetBlade()
          toast.success("Document updated successfully.")
        })
        .catch((e) => { setLoading(false) });
    }
  }

  const onDelete = (data: any) => {
    setShowDeleteModal(true)
    var obj = {
      EntityId: data.EntityId,
      EntityType: data.EntityType,
      DocumentId: data.DocumentId
    }
    setDeletedData(obj)
  }

  const onDeleteEquipment = () => {
    setShowDeleteModal(false)
    WebService.deleteAPI({
      action: `EntityDocument/${user_info['AccountId']}/${user_info['CompanyId']}/${deletedData.EntityId}/${deletedData.EntityType}/${deletedData.DocumentId}`,
      body: null,
      isShowError: false
    })
      .then((res) => {
        toast.success('Document deleted successfully.')
        setDocumentList(
          documentList.filter((item: any) => {
            return item.DocumentId != deletedData.DocumentId
          })
        )
      })
      .catch((e) => { })
  }

  const onPreview = (e: any) => {
    setPreviewData(e)
    setFileName(e.DocumentName)
    setBladeTitle("Edit Document")
    setDocumentUrl(e.ThumbnailUrl)
    getPreview(e.ThumbnailUrl ? e.ThumbnailUrl : e.DocumentUrl)
    reset(e);
    setDocumentURL([e])
  }

  const removeFile = () => {
    getPreview("")
    setFileName("")
    setDocumentUrl("")
    setDocumentURL([])
  }

  const getPreview = (e: any) => {
    var ext = e.split(".").pop();
    var data = {
      url: "",
      type: "img"
    }
    if (ext == "pdf") {
      data.url = e;
      data.type = "iframe";
    } else if (ext == "ppt") {
      data.url = DocPlaceholder;
    } else if (ext == "xls") {
      data.url = DocPlaceholder;
    } else if (ext == "doc") {
      data.url = DocPlaceholder;
    } else if (ext == "jpg") {
      data.url = e;
    } else if (ext == "zip") {
      data.url = DocPlaceholder;
    } else if (ext == "docx") {
      data.url = DocPlaceholder;
    } else if (ext == "txt") {
      data.url = DocPlaceholder;
    } else if (ext == "jpeg") {
      data.url = e;
    } else if (ext == "csv") {
      data.url = DocPlaceholder;
    } else if (ext == "mp4") {
      data.url = e;
      data.type = "video";
    } else if (ext == "gif") {
      data.url = e;
    } else if (ext == "png") {
      data.url = e;
    } else if (ext == "video") {
      data.url = e;
      data.type = "video";
    }
    else {
      data.url = DocPlaceholder;
    }
    setShowPreviewData(data)
  }

  const getOnchangePreview = (e: any, value: any) => {
    var ext = e.split(".").pop();
    var data = {
      url: "",
      type: "img"
    }
    if (ext == "pdf") {
      data.url = value;
      data.type = "iframe";
    } else if (ext == "ppt") {
      data.url = DocPlaceholder;
    } else if (ext == "xls") {
      data.url = DocPlaceholder;
    } else if (ext == "doc") {
      data.url = DocPlaceholder;
    } else if (ext == "jpg") {
      data.url = value;
    } else if (ext == "zip") {
      data.url = DocPlaceholder;
    } else if (ext == "docx") {
      data.url = DocPlaceholder;
    } else if (ext == "txt") {
      data.url = DocPlaceholder;
    } else if (ext == "jpeg") {
      data.url = value;
    } else if (ext == "csv") {
      data.url = DocPlaceholder;
    } else if (ext == "mp4") {
      data.type = "video";
    } else if (ext == "gif") {
      data.url = value;
    } else if (ext == "png") {
      data.url = value;
    } else if (ext == "video") {
      data.url = value;
      data.type = "video";
    }
    else {
      data.url = DocPlaceholder;
    }
    setShowPreviewData(data)
  }

  return (
    <>
      <Loader show={isLoading} />
      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_MODAL"
        width={600}
        delete={onDeleteEquipment}
        data={deletedData}
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

      <Offcanvas
        show={props.isShow}
        onHide={onCloseModal}
        placement={"end"}
        className="offcanvas-ex-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="border-bottom px-0">
          <form className="form-style" id="form-file-upload" onDragEnter={handleDrag} onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-3">
              <div className='add-document'>
                <div className=' main-view row form-style'>
                  <Col md={6}>
                    {/* Left Side View */}
                    <div className='add-document-div'>
                      <div className='upload-document '>Upload Document</div>
                      <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                        <div className='d-flex'>
                          <img src={require('../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' />
                          {
                            bladeTitle == "Edit Document" ? "Replace Document" : "Upload Document"
                          }
                        </div>
                      </label>
                      {dragActive &&
                        <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                        </div>
                      }
                      <div>
                        {
                          fileName &&
                          <div className="file-name-tag text-center">
                            <span className='font-14 text-dark'>{fileName}</span><button className='remove-file-btn text-dark' onClick={() => removeFile()} type='button'><X size={18} /></button>
                          </div>
                        }
                      </div>


                      <div className='upload-document mt-2'>Description</div>
                      <textarea className='form-control text-dark' {...register("Description")} maxLength={255} />
                      <div className='customer-technician-view d-flex row '>
                        <div className='col-6 customer'>
                          {/* <input type="checkbox" className="checkbox me-2" /> Show to customer */}
                          <Form.Group className="mb-3" controlId="ShwToCustomer">
                            <Form.Check  {...register("ShowToRemoteTech")} type="checkbox" label="Show to customer" />
                          </Form.Group>
                        </div>
                        <div className='col-6  d-flex justify-content-end'>
                          {/* <input type="checkbox" className="checkbox me-2" /> Show to technician */}
                          <Form.Group className="mb-3" controlId="ShwToTechnician">
                            <Form.Check {...register("IsExternal")} type="checkbox" label="Show to technician" />
                          </Form.Group>
                        </div>
                      </div>

                      <div className='document-list-heading font-w-medium mb-1 mt-0'>Document List</div>
                      <div className="document-list mt-0 mb-0">
                        <Card className='bg-transparent border-light view-doc-blade-list'>
                          {
                            documentList.length > 0 &&
                            documentList.map((item: any, index: number) => {
                              return (
                                <Card.Body className='border-bottom border-light '>
                                  <div className=' row align-items-center'>
                                    <div className='col-9 d-flex align-items-center'>
                                      <div className="pe-2">
                                        <img onClick={() => onPreview(item)} className="cursor-pointer" src={item.ThumbnailUrl ? item.ThumbnailUrl : jpgDoc} width="60" alt="img" />
                                      </div>
                                      <div>


                                        <p className='mb-1 text-brand font-14 font-w-medium'>{item.CreatedBy} <span className='mb-0 text-secondary font-12 ms-2'>{item.RecordCreatedOn && HelperService.getFormatedDateAndTime(item.RecordCreatedOn)}</span></p>

                                        <div className='document-subheading'>{item.Description}</div>
                                      </div>

                                    </div>
                                    <div className='col-3 text-end mt-1'>
                                      <button onClick={() => onPreview(item)} className='list-btn' type='button'>
                                        <img
                                          src={editicon}
                                          id="img_downarrow"
                                          height={20}
                                          className="deleteicon me-2 theme-icon-color"
                                          alt="downarrow"
                                        /></button>
                                      <button onClick={() => onDelete(item)} className='list-btn' type='button'>
                                        <img
                                          src={deleteicon}
                                          id="img_downarrow"
                                          height={18}
                                          className="deleteicon"
                                          alt="downarrow"
                                        /></button>
                                    </div>
                                  </div>

                                </Card.Body>
                              )
                            })
                          }
                        </Card>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-end">
                      {showPreviewData?.url !== DocPlaceholder &&
                        <a href={showPreviewData.url} target="_blank" download={"Document"}> <Button
                          variant="primary"
                          className="btn-brand-solid"
                          type="button"
                        >
                          Download
                        </Button></a>
                      }
                    </div>
                    <label htmlFor="">Preview</label>
                    <Card className="p-2 h-auto bg-transparent border-light" id='preview_card'>

                      {
                        showPreviewData?.type == "img" && <img src={showPreviewData?.url} alt="" />
                      }
                      {
                        showPreviewData?.type == "iframe" && <iframe src={showPreviewData?.url} height={550} width="100%" />
                      }
                      {
                        showPreviewData?.type == "video" && <video src={showPreviewData?.url} height={550} controls width="100%" />
                      }
                    </Card>
                  </Col>



                </div>
              </div>
            </div>
            <div className="offcanvas-footer  position-absolute">
              <Button
                variant="primary"
                className="btn-brand-solid"
                type="submit"
              >
                {
                  bladeTitle == "Add Document" ? "Add Document" : "Update Document"
                }
              </Button>
              <Button
                variant="primary"
                className="btn-brand-outline ms-3"
                type="button"
                onClick={onCloseModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AddDocumentModal;
