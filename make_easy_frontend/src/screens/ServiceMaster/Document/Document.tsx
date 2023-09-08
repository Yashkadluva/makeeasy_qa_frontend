import { useEffect, useRef, useState } from "react";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
  FilterOption,
  Filter,
} from "../../../components/Grid/Grid";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import deleteicon from "../../../assets/images/delete-icon.svg";
import editicon from "../../../assets/images/edit.svg";
import loader from "../../../assets/images/loader.gif";
import DocPlaceholder from '../../../assets/images/document-placeholder.jpg';
import { RootState } from "../../../config/Store";
import { CustomerModalState, SDMaster } from "../../../reducer/CommonReducer";
import HelperService from "../../../utility/HelperService";
import { useNavigate } from "react-router-dom";
import "./Document.scss";
import BsButton from "react-bootstrap/Button";
import { Row, Col, Tab, Tabs } from "react-bootstrap";
import DescriptionModal from "../../../components/DescriptionModal/DescriptionModal";
import { Envelope, EyeFill } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import BackComponent from "../../../components/BackComponent/BackComponent";
import { getPreference } from "../../../utility/CommonApiCall";
import AddDocumentModal from "../../../components/AddDocumentModal/AddDocumentModal";
import viewIcon from "../../../assets/images/Preview.svg";
import Loader from "../../../components/Loader/Loader";

const componentKey = "EntityDocument";
const headers: GridHeader[] = [
  {
    title: "Document Name",
  },
  {
    title: "Description",
    class: "description-text",
  },
  {
    title: "Created On",
    class: "text-center",
  },
  {
    title: "Created By",
  },
  {
    title: "Show To Customer",
    class: "text-center",
  },
  {
    title: "Show To Technician",
    class: "text-center",
  },
  {
    title: "Actions",
    isFilter: false,
    isSorting: false,
    class: "text-center freeze-column",
    isFreeze: true,
  },
];

const dateFilter: FilterOption[] = [
  {
    title: "Created On",
    value: "CreatedOn",
  },
];

const filters: Filter[] = [
  {
    title: "Show To Customer",
    key: "ShowToVendor",
    child: [
      {
        title: "Yes",
        value: "true",
      },
      {
        title: "No",
        value: "false",
      },
    ],
  },
  {
    title: "Show To Technician",
    key: "ShowToRemoteTech",
    child: [
      {
        title: "Yes",
        value: "true",
      },
      {
        title: "No",
        value: "false",
      },
    ],
  },
];

const Document = () => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const customerModal: any = useSelector<RootState, CustomerModalState>(
    (state) => state.customerModal
  );
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [ShowLoader, setShowLoader] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [isShowAddDocument, setIsShowAddDocument] = useState(false);
  const [descriptionData, setDescriptionData] = useState("");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [documentData, setDocumentData] = useState<any>([]);
  const [editDocumentData, setEditDocumentData] = useState<any>([]);
  const [isShoWDocumentPreview, setIsShoWDocumentPreview] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [isLoading, setLoading] = useState(false);
  const pageCount = useRef(0)
  const callPageCount = useRef(0)
  const [totalCount, setTotalCount] = useState(0);
  const [documentTotalCount, setDocumentTotalCount] = useState(0);
  const [callPictureTotalCount, setCallPictureTotalCount] = useState(0);
  const [callPictureData, setCallPictureData] = useState<any>([]);
  const [currentTab, setCurrentTab] = useState("serviceMaster");

  useEffect(() => {
    getDocuments();
    getCallPicture();
    getUserPreference();
  }, []);

  useEffect(() => {
    if (currentTab == "serviceMaster") {
      setTotalCount(documentTotalCount)
    } else if (currentTab == "defaults") {
      setTotalCount(callPictureTotalCount)
    }
  }, [currentTab])

  const getUserPreference = () => {
    getPreference({ key: componentKey, user_info })
      .then((res: any) => {
        if (res.value && res.value.length > 10) {
          let temp: GridHeader[] = JSON.parse(res.value);
          if (temp.length > 1) {
            setHeader(temp);
          }
        }
      })
      .catch((e: any) => { });
  };

  const getDocuments = () => {
    let requestBody = {
      "Offset": pageCount.current,
      "Limit": 12
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `EntityDocument/V2/GetDocuments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}/1`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        if (pageCount.current == 0) {
          setDocumentData([...res.Data]);
        } else {
          setDocumentData([...documentData, ...res.Data]);
        }
        setTotalCount(res.totalRecords);
        setDocumentTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const editDocument = (e: any) => {
    let temp = [e];
    setEditDocumentData(temp);
    setIsShowAddDocument(true);
  };

  const actionList = (value: any) => {
    return (
      <div className="action-btns text-nowrap">
        <a
          onClick={() => editDocument(value)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={editicon} height={25} />
        </a>
        <a
          onClick={() => alert(value)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <Envelope size={16} className="text-brand" />
        </a>
        <a
          onClick={() => onDelete(value)}
          className="text-dark ms-2 font-18 cursor-pointer"
        >
          <img src={deleteicon} height={18} />
        </a>
      </div>
    );
  };

  const showDescription = (e: any) => {
    return (
      <a className="grid-hypper-link" onClick={() => viewFullDescription(e)}>
        {e.Description}
      </a>
    );
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data.Description);
    setIsShowDescription(true);
  };

  const closeDocument = (value: any) => {
    setIsShowDescription(value);
  };

  const onDelete = (data: any) => {
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
    setLoading(true);
    WebService.deleteAPI({
      action:
        `EntityDocument/${user_info["AccountId"]}/${user_info["CompanyId"]}/${deletedData.entityId}/${deletedData.entityType}/` +
        deletedData.id,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        pageCount.current  =0;
        toast.success("Document deleted successfully.");
        setLoading(false);
        setShowDeleteModal(false);
        getDocuments();
      })
      .catch((e) => {
        setLoading(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  const closeAddDocument = (e: any) => {
    pageCount.current  =0;
    setIsShowAddDocument(false);
    setEditDocumentData([]);
    getDocuments();
  };

  const viewPreview = (data: any) => {
    setPreviewData(data);
    setIsShoWDocumentPreview(true);
  };

  const getCallPicture = () => {
    let requestBody = {
      "Offset": callPageCount.current,
      "Limit": 12
    }
    setShowLoader(true);
    WebService.postAPI({
      action: `EntityDocument/V2/GetCallDocuments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data?.sd_master?.Id}`,
      body: requestBody,
    })
      .then((res: any) => {
        setShowLoader(false);
        setCallPictureData([...callPictureData, ...res.Data]);
        setCallPictureTotalCount(res.totalRecords);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const getCurrentKey = (value: any) => {
    setCurrentTab(value);
  };

  return (
    <>
      <Loader show={isLoading} />

      <AddDocumentModal
        isShow={isShowAddDocument}
        title="Add Document"
        isClose={closeAddDocument}
        popupData={documentData}
        isEquipId={editDocumentData}
        Ids={{ Id: data.sd_master.Id, EntityType: 1 }}
      />
      <DraggableModal
        isOpen={isShoWDocumentPreview}
        onClose={() => setIsShoWDocumentPreview(false)}
        title="Document preview"
        type="DOCUMENT_PREVIEW"
        width={600}
        data={previewData}
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
      <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeDocument}
        data={descriptionData}
      />

      <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />

      <div
        className=""
        style={{ width: customerModal?.isShow === true ? "" : "" }}
      >
        <div className="d-flex justify-content-between align-items-center px-3">
          <div className="d-flex flex-row equipment-heading-view align-items-center card-title">
            <BackComponent title={"Documents"} count={totalCount} />
          </div>
          <div>
            <BsButton
              variant="light"
              className="btn-brand-light  mb-2"
              type="button"
              onClick={() => setIsShowAddDocument(true)}
            >
              + Add Document
            </BsButton>
          </div>
        </div>
        <div className="other-component-view card-shadow equipment pt-0">
          <div className="tab-style-2  mb-0 documents-tab">
            <Tabs defaultActiveKey="serviceMaster" onSelect={getCurrentKey}>
              <Tab
                eventKey="serviceMaster"
                title={
                  <div className="d-flex flex-column justify-content-center align-items-center">
                    <img
                      src={
                        require("../../../assets/images/icon-sm.svg").default
                      }
                      className="theme-icon-color"
                      height={21}
                      width={21}
                    />
                    <label className="nav-text">Service Master</label>
                  </div>
                }
              >
                {/* Details  */}
                <>
                  {ShowLoader == true ? (
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
                  ) : (
                    <Row>
                      {documentData.length > 0 &&
                        documentData.map((item: any, index: number) => {
                          return (
                            <Col xl={2} lg={3} sm={4} md={4}>
                              <div className="img-box-view">
                                <div className="document-image-div">
                                  <div className="img-wrap">
                                    <img
                                      onClick={() => editDocument(item)}
                                      src={item.ThumbnailUrl ? item.ThumbnailUrl : DocPlaceholder}
                                      alt="imag"
                                      className="image cursor-pointer"
                                    />
                                    <div className="action-btns action-ele document-action-btns">
                                      {/* <a className="text-dark ms-2 font-18 cursor-pointer" onClick={() => viewPreview(item)}><EyeFill size={18} className="text-white" /></a>
                                  <a className="text-dark ms-2 font-18 cursor-pointer" onClick={() => editDocument(item)}><img src={editicon} alt="" height={20} /></a> */}
                                      <a
                                        className="text-dark ms-2 font-18 cursor-pointer"
                                        onClick={() => onDelete(item)}
                                      >
                                        <img
                                          src={deleteicon}
                                          alt=""
                                          height={18}
                                        />
                                      </a>
                                    </div>
                                  </div>
                                </div>

                                <div className="img-descrp text-truncate ">
                                  {showDescription(item)}
                                </div>
                                <div className="d-fle justify-content-between align-items-center">
                                  <div className="username mb-0">
                                    {item.CreatedBy}
                                  </div>
                                  <div className="date">
                                    {HelperService.getFormatedDateAndTime(
                                      item.RecordCreatedOn
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      <div className="text-end">
                        {documentData.length < totalCount &&
                          <BsButton
                            variant="light"
                            className="btn-brand-light  mb-2"
                            type="button"
                            onClick={() => { pageCount.current = ++pageCount.current; getDocuments() }}
                          >
                            Load more...
                          </BsButton>
                        }

                      </div>
                    </Row>
                  )}
                </>
              </Tab>
              <Tab
                eventKey="defaults"
                title={
                  <div className="d-flex flex-column justify-content-center align-items-center">
                    <img
                      src={
                        require("../../../assets/images/icon-call-pic.svg")
                          .default
                      }
                      className="theme-icon-color"
                      height={21}
                      width={21}
                    />
                    <label className="nav-text">Call Pictures</label>
                  </div>
                }
              >
                <>
                  {ShowLoader == true ? (
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
                  ) : (
                    <Row>
                      {callPictureData.length > 0 &&
                        callPictureData.map((item: any, index: number) => {
                          return (
                            <Col xl={2} lg={3} sm={4} md={4}>
                              <div className="img-box-view">
                                <div className="document-image-div">
                                  <div className="img-wrap">
                                    <img
                                      src={item.ThumbnailUrl ? item.ThumbnailUrl : DocPlaceholder}
                                      alt="imag"
                                      className="image cursor-pointer"
                                    />
                                    <div className="action-btns action-ele document-action-btns">
                                    </div>
                                  </div>
                                </div>

                                <div className="img-descrp text-truncate ">
                                  {showDescription(item)}
                                </div>
                                <div className="d-fle justify-content-between align-items-center">
                                  <div className="username mb-0">
                                    {item.CreatedBy}
                                  </div>
                                  <div className="date">
                                    {HelperService.getFormatedDateAndTime(
                                      item.RecordCreatedOn
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Col>
                          );
                        })}
                      <div className="text-end">
                        {
                          callPictureData.length < callPictureTotalCount &&
                          <BsButton
                            variant="light"
                            className="btn-brand-light  mb-2"
                            type="button"
                            onClick={() => { callPageCount.current = ++callPageCount.current; getCallPicture() }}
                          >
                            Load more...
                          </BsButton>
                        }
                      </div>
                    </Row>
                  )}
                </>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default Document;
