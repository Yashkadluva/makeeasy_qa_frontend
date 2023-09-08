import { useState, useEffect } from "react";
import deleteIcon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import { Button, Row, Col } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { RootState } from '../../../../config/Store';
import { InvoiceState, InviceSDMasterState } from '../../../../reducer/CommonReducer';
import WebService from "../../../../utility/WebService";
import WorkDescriptionBlade from "../InvoiceEntryBlade/WorkDescriptionBlade/WorkDescriptionBlade";
import HelperService from "../../../../utility/HelperService";
import { toast } from "react-toastify";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import loader from "../../../../assets/images/loader.gif";


const WorkDescription = () => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [editData, setEditData] = useState<any>({})
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const [isShowEditModel, setShowEditModel] = useState(false)
  const [isLoading, setLoading] = useState(false);
  const [WorkDescriptionData, setWorkDescriptionData] = useState([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ShowLoader, setShowLoader] = useState(false);

  useEffect(() => {
    getWorkDescription()
  }, [])

  const closeModal = (value: any, e: any) => {
    e == "reset" && getWorkDescription()
    setEditData({})
    setShowEditModel(value)
  }

  const getWorkDescription = () => {
    setShowLoader(true)
    WebService.getAPI({
      action: `SDWorkDescription/GetAllWorkDescriptionsForInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.CallNum}`,
      body: null
    })
      .then((res: any) => {
        setShowLoader(false)
        setWorkDescriptionData(res)
        setLoading(false);
      })
      .catch((e) => {
        setShowLoader(false)
      });
  }

  const onEdit = (e: any) => {
    setEditData(e);
    setShowEditModel(true)
  }

  const onDelete = (e: any) => {
    setShowDeleteModal(true);
    var obj = {
      id: e.Id,
      InvoiceNum: e.InvoiceNum
    };
    setDeletedData(obj);
  }

  const onDeleteWorkDescription = () => {
    setShowDeleteModal(false);
    WebService.deleteAPI({
      action: `SDWorkDescription/Delete/${user_info["AccountId"]}/${user_info["CompanyId"]}/${deletedData?.InvoiceNum}/${deletedData?.id}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        toast.success("Work Description deleted successfully.");
        getWorkDescription()
      })
      .catch((e) => {
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };


  return <>
    {/* <NotesBlade */}
    <WorkDescriptionBlade
      isShow={isShowEditModel}
      isClose={closeModal}
      title={invoiceData?.invoiceData?.InvoiceNum}
      data={editData}
    />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeleteWorkDescription}
      data={deletedData}
    />
    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />

    <div className="tab-style-2 call-info-tabs mb-0">
      <div className="border-bottom border-light pt-0 pb-2 ">
        <Row className="align-items-center">
          <Col className="text-end">
            <Button type="button" variant="light" className="btn-brand-light" onClick={() => setShowEditModel(true)} >+ Add Work Description</Button>
          </Col>
        </Row>
      </div>
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
          <div>
            {
              WorkDescriptionData.length > 0 &&
              WorkDescriptionData.map((item: any, index: number) => {
                return (
                  <div className="border-bottom border-light pt-3">
                    <Row className="align-items-end mb-3">
                      <Col lg={12} className="d-flex text-dark">
                        <div className="pe-2">
                        <div className="tech-name-avtar">
                          {
                            item.TechProfilePictureUrl ?
                              <img
                                src={item.TechProfilePictureUrl}
                                alt="Photo"
                                width={45}
                                height={45}
                                className="user-photo"
                              />
                              :
                              HelperService.getCompanyIcon(item.CreatedBy)
                          }
                        </div>
                        </div>  
                        <div className=" ">
                          <p className='mb-1 text-brand font-14 font-w-medium'>{item.CreatedBy} <span className='mb-0 text-secondary font-12 ms-2'>{item.ServiceDate && HelperService.getFormatedDateAndTime(item.CreatedOn)}</span></p>
                          <p className='mb-0 text-dark font-14' dangerouslySetInnerHTML={{ __html: item && item.WorkDescription ? item.WorkDescription : "" }}></p>
                        </div>
                      </Col>
                      <Col lg={12} className="text-end">
                        {/* <a onClick={() => onEdit(item)} href="javascript:void(0)" className="me-2"> <img src={editicon} width={16} alt="edit" className="theme-icon-color" /> </a> */}
                        <Button variant="light" className="btn-brand-light btn-small me-2" onClick={() => onEdit(item)}>Edit</Button>
                        <a onClick={() => onDelete(item)} href="javascript:void(0)"> <img src={deleteIcon} width={16} alt="Delete" className="theme-icon-color" /> </a>
                      </Col>
                    </Row>
                  </div>
                )
              })
            }
          </div>
      }
    </div>
  </>;
};

export default WorkDescription;

