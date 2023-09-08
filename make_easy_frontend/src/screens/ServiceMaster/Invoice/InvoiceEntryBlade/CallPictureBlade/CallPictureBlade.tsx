import { useEffect, useState } from 'react';
import deleteicon from "../../../../../assets/images/delete-icon.svg";
import viewIcon from '../../../../../assets/images/Preview.svg';
import jpgDoc from '../../../../../assets/images/jpg-doc.svg';
import DocPlaceholder from '../../../../../assets/images/document-placeholder.jpg';
import Form from 'react-bootstrap/Form';
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import "./CallPictureBlade.scss"
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { SDMaster, InviceSDMasterState } from '../../../../../reducer/CommonReducer';
import { useForm, Controller } from "react-hook-form";
import { toast } from 'react-toastify';
import { X } from "react-bootstrap-icons";
import Loader from '../../../../../components/Loader/Loader';
import DraggableModal from '../../../../../components/DraggableModal/DraggableModal';
import WebService from '../../../../../utility/WebService';
import { Card, Col } from 'react-bootstrap';
import HelperService from '../../../../../utility/HelperService';
interface PropData {
    isShow: boolean;
    title: any;
    isClose: any;
    popupData: any;
    isEquipId?: any;
}

const CallPictureBlade = (props: PropData) => {

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
        control,
        setValue,
    } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [dragActive, setDragActive] = useState(false);
    const [documentURL, setDocumentURL] = useState<any>([]);
    const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<any>({});
    const [documentList, setDocumentList] = useState<any[]>([])
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
    const [isShoWDocumentPreview, setIsShoWDocumentPreview] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [fileName, setFileName] = useState("");
    const [bladeTitle, setBladeTitle] = useState("Add Call Picture")
    const [showAlertModel, setAlertModel] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [documentUrl, setDocumentUrl] = useState('')


    useEffect(() => {
        getUploadedDocuments();
        reset({});
    }, []);

    const resetBlade = () => {
        setFileName("");
        setDocumentURL([]);
        reset({});
        setValue("Description", '');
        setValue("ShowToRemoteTech", false);
        setValue("IsExternal", false);
    }

    useEffect(() => {
        setDocumentList(props.popupData);
        if (props.isEquipId.length > 0 && props.isEquipId[0].DocumentName) {
            setBladeTitle("Edit Call Picture")
            reset(props.isEquipId[0])
            setFileName(props.isEquipId[0].DocumentName);
            setDocumentUrl(props.isEquipId[0].ThumbnailUrl)
            setDocumentURL(props.isEquipId)
        }
        else {
            setBladeTitle("Add Call Picture")
            setDocumentUrl("")
            reset({});
        }
    }, [props.popupData, props.isShow]);

    const getUploadedDocuments = () => {
        WebService.getAPI({
            action:
                "EntityDocument/GetDocuments/" +
                user_info["AccountId"] +
                "/" +
                user_info["CompanyId"] + "/" + data.sd_master.Id +
                "/4",
            body: null,
        })
            .then((res: any) => {

            })
            .catch((e) => { });
    }

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
        setFileName(e.target.files[0].name)
        setDocumentURL(e.target.files)
        setDocumentUrl(URL.createObjectURL(e.target.files[0]))
    };

    const onSubmit = (requestBody: any) => {
        if (fileName == "") {
            setAlertModel(true)
        }
        else if (documentURL[0]?.name) {
            let fromData = new FormData();
            fromData.append("files", documentURL[0]);
            fromData.append("AccountId", user_info["AccountId"]);
            fromData.append("CompanyId", user_info["CompanyId"]);
            fromData.append("Description", requestBody["Description"]);
            fromData.append("IsExternal", requestBody["IsExternal"]);
            fromData.append("ShowToRemoteTech", requestBody["ShowToRemoteTech"]);
            fromData.append("EntityId", `${invoceSDMaster?.invoceSDMaster.Id}`);
            //   ${invoceSDMaster?.invoceSDMaster?.CustomFields?.EntityType}
            fromData.append("EntityType", `11`);
            if (props.isEquipId.length > 0 && bladeTitle == "Edit Document") {
                fromData.append("DocumentId", props.isEquipId[0].DocumentId);
                fromData.append("ParentId", props.isEquipId[0].ParentId);
                fromData.append("DocumentType", "0");
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
                    bladeTitle == "Add Call Picture" ? toast.success("Document added successfully.") :
                        toast.success("Call Picture updated successfully.");
                        res.Data.ThumbnailUrl = res.Data.DocumentUrl
                    if (bladeTitle == "Add Call Picture") {
                        let temp = [];
                        temp = [...documentList, { ...res.Data }]
                        setDocumentList(temp)
                    } else if (bladeTitle == "Edit Call Picture") {
                        onCloseModal()
                    }

                })
                .catch((e) => { setLoading(false) });
        }
        else if (!documentURL[0]?.name && bladeTitle == "Edit Call Picture" && fileName !== "") {
            requestBody.AccountId = user_info["AccountId"];
            requestBody.CompanyId = user_info["CompanyId"];
            if (props.popupData.length > 0) {
                requestBody.EntityId = props.popupData[0].EntityId;
                requestBody.EntityType = props.popupData[0].EntityType;
            }
            if (props.isEquipId.length > 0 && bladeTitle == "Edit Call Picture") {
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
                    resetBlade()
                    toast.success("Document updated successfully.")
                    onCloseModal()
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
        setDocumentUrl(e.ThumbnailUrl)
        // setIsShoWDocumentPreview(true);
    }

    const removeFile = () => {
        setFileName("")
        setDocumentURL([])
        setDocumentUrl("")
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
                previousData='Please select a file'
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
                                    {/* Left Side View */}
                                    <Col md={6} className="form-style">
                                        <div className='add-document-div'>
                                            <div className='upload-document '>Upload Document</div>
                                            <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                                            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                                                <div className='d-flex'>
                                                    <img src={require('../../../../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' />
                                                    Upload Document
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
                                                        <span className='font-14 text-dark'>{fileName}</span>
                                                        <button className='remove-file-btn text-dark' onClick={() => removeFile()} type='button'>
                                                            <X size={18} /></button>
                                                    </div>
                                                }
                                            </div>

                                            <div className='upload-document mt-3 '>Description</div>
                                            <textarea className='form-control h-auto text-dark' rows={3} {...register("Description")} maxLength={255} />
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
                                            <div className="document-list mt-0 call-pic-list view-doc-blade-list">
                                                {
                                                    documentList.length > 0 &&
                                                    documentList.map((item: any, index: number) => {
                                                        return (
                                                            <Card.Body className='  border-light'>
                                                                <div className=' '>
                                                                    <div className='list-view py-1'>
                                                                        <div className=' row align-items-center'>
                                                                            <div className='col-9 d-flex align-items-center'>
                                                                                <div className="pe-2">
                                                                                    <img src={item.ThumbnailUrl ? item.ThumbnailUrl : jpgDoc} width="40" alt="img" />
                                                                                </div>
                                                                                <div>
                                                                                <p className='mb-1 text-brand font-14 font-w-medium'>{item.CreatedBy} <span className='mb-0 text-secondary font-12 ms-2'>{item.RecordCreatedOn && HelperService.getFormatedDateAndTime(item.RecordCreatedOn)}</span></p>
                                                                                    <div className='document-subheading text-dark'>{item.Description}</div>
                                                                                </div>

                                                                            </div>
                                                                            <div className='col-3 text-end mt-1'>
                                                                                <button onClick={() => onPreview(item)} className='list-btn' type='button'>
                                                                                    <img
                                                                                        src={viewIcon}
                                                                                        id="img_downarrow"
                                                                                        height={20}
                                                                                        className="deleteicon me-2"
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
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <label htmlFor="">Preview</label>
                                        <Card className="p-2 h-100">
                                            {
                                                documentUrl == "" ?
                                                    <img src={DocPlaceholder} className="img-fluid" alt="Doc" />
                                                    :
                                                    <img src={documentUrl} className="img-fluid" alt="Doc" />
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
                                    bladeTitle == "Add Call Picture" ? "Add Call Picture" : "Update Call Picture"
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

export default CallPictureBlade;
