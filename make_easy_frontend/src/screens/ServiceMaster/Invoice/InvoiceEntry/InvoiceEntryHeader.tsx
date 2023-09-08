import editicon from "../../../../assets/images/edit.svg";
import search from "../../../../assets/images/Search.svg";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Card, Offcanvas, Row, Col, Dropdown, Button } from 'react-bootstrap';
import "./InvoiceEntry.scss";
import { useEffect, useState } from "react";
import moment from "moment";
import HelperService from "../../../../utility/HelperService";
import loader from "../../../../assets/images/loader.gif";
import { ArrowUpRight, X, Gear } from 'react-bootstrap-icons';
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import WebService from "../../../../utility/WebService";
import { toast } from "react-toastify";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
  SET_WORK_ORDER_ID, setDataInRedux
} from "../../../../action/CommonAction";
import { useNavigate } from "react-router-dom";
import AddCreditModal from "../InvoiceEntryBlade/AddCreditBlade/AddCreditModal";
import AddChangeInvoiceModal from "../InvoiceEntryBlade/AddChangeInvoiceBlade/AddChangeInvoiceModal";
import SettingBlade from "../InvoiceEntryBlade/SettingBlade/SettingBlade";
import AddAssignBatchBlade from "../InvoiceEntryBlade/AddAssignBatchBlade";

interface PropData {
  InvoiceData?: any;
  invoiceCount?: any;
  searchId?: any;
  showLoader?: boolean;
}

const status: Options[] = [
  { id: 1, value: "All" },
  { id: 2, value: "Open" },
  { id: 3, value: "Closed" },
];


const InvoiceEntryHeader = (props: PropData) => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [invoiceNum, setInvoiceNum] = useState<string>('')
  const [outcomeValue, setOutcomeValue] = useState('')
  const [isEditOutcome, setEditOutcome] = useState(false)
  const [outcome, setOutcome] = useState<any[]>([]);
  const [selectedOutcome, setSelectedOutcome] = useState<any>({})
  const [errorMessage, setErrorMessage] = useState("");
  const [approveErrorMessage, setApproveErrorMessage] = useState("");
  const [postErrorMessage, setPostErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false)
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [showAlertApproveModel, setAlertApproveModel] = useState(false);
  const [showApproveModal, setApproveModal] = useState(false);
  const [isShowApproveModal, setShowApproveModal] = useState(false);
  const [showPostModal, setPostModal] = useState(false);
  const [isShowPostModal, setShowPostModal] = useState(false);
  const [showAddCreditModal, setshowAddCreditModal] = useState(false)
  const [showAddAssignBatchBlade, setshowAddAssignBatchBlade] = useState(false)
  const [showAddChangeInvoiceModal, setshowAddChangeInvoiceModal] = useState(false)
  const [showSettingModal, setShowSettingModal] = useState(false)
  const [disablePost, setDisablePost] = useState(false)
  const [disableApprove, setDisableApprove] = useState(false)


  useEffect(() => {
    getOutcome()
  }, [])

  useEffect(() => {
    props.InvoiceData && setInvoiceNum(props?.InvoiceData?.InvoiceNum)
    props.InvoiceData && setDisablePost(props?.InvoiceData?.IsPosted)
    props.InvoiceData && setDisableApprove(props?.InvoiceData?.IsApproved)
  }, [props.InvoiceData])

  const getOutcome = () => {
    WebService.getAPI({
      action: `SetupSDOutcomeCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].OutcomeCode, value: res[i].Description, code: res[i].OutcomeCode, object: res[i] });
        }
        setOutcome(array)
      })
      .catch((e) => {

      })
  }

  const onSaveOutcome = () => {
    setLoading(true)
    var requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      SDCallMasterId: invoiceNum ? invoiceNum : props?.InvoiceData?.InvoiceNum,
      OutcomeCode: selectedOutcome.OutcomeCode,
      OutcomeCodeType: selectedOutcome.Type
    }
    WebService.postAPI({
      action: `SDCallMaster/ChangeoutComeCode`,
      body: requestedBody
    })
      .then((res) => {
        toast.success('Outcome updated successfully.')
        setOutcomeValue(selectedOutcome.OutcomeCode)
        setEditOutcome(false)
        setLoading(false)
      })
      .catch((e) => {
        if (
          e &&
          e.response &&
          e.response.data &&
          e.response.data.ErrorDetails
        ) {
          setErrorMessage(e.response.data.ErrorDetails.message);
        }
        setLoading(false)
      })
  }

  const closeModal = (value: any) => {
    setshowAddCreditModal(value);
    setshowAddChangeInvoiceModal(value);
    setshowAddAssignBatchBlade(value);
  };

  const getRedirect = () => {
    if (props?.InvoiceData?.InvoiceNum) {
      dispatch(
        setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: props?.InvoiceData?.CallNum, page: window.location.pathname, SMId: props?.InvoiceData?.SMNum } })
      );
      navigate(`/call-information`)
    }
  }

  const onApprovedata = () => {
    setShowDeleteModal(false);
    setLoading(true)
    WebService.getAPI({
      action: `SDInvoice/ValidateInvoiceForApproval/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}`,
      body: null
    })
      .then((res: any) => {
        setPageLoader(false);
        setLoading(false)
        if (res[0] == "ConfirmationForPurchaseOrderNotExist") {
          setApproveErrorMessage("Do you want to approve this Invoice?")
          setApproveModal(!showApproveModal)
        }else if (res[0] == "ConfirmationForPurchaseOrderExist"){
          setApproveErrorMessage("There are pending POs. Would you like to continue to approve?")
          setApproveModal(!showApproveModal)
        }
      })
      .catch((e) => {
        setPageLoader(false);
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertApproveModel(!showAlertApproveModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const onConfirmSave = () => {
    setApproveModal(false);
    setLoading(true)
    WebService.getAPI({
      action: `SDInvoice/ValidateInvoiceForApproval/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}`,
      body: null
    })
      .then((res: any) => {
        if (res[0] == "ConfirmationForPurchaseOrderNotExist") {
          WebService.postAPI({
            action: `SDInvoice/ApproveInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}/${user_info["firstName"]} ${user_info["lastName"]}`
          })
            .then((res: any) => {
              setLoading(false)
              setPageLoader(false);
              setDisableApprove(true)
              toast.success("Invoice Approved Successfully.")
              props.searchId(invoiceNum)
            })
            .catch((e) => {
              setLoading(false)
              if (e.response.data.ErrorDetails.message) {
                setAlertModel(!showAlertModel)
                setErrorMessage(e?.response?.data?.ErrorDetails?.message)
              }
            });
          setPageLoader(false);
        }
      })
      .catch((e) => {
        setPageLoader(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const onpostdata = () => {
    setShowDeleteModal(false)
    setLoading(true)
    WebService.postAPI({
      action: `SDInvoice/PostInvoiceToAccntPkg/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}`,
      body: props.InvoiceData
    })
      .then((res: any) => {
        setPageLoader(false);
        setLoading(false);
        props.searchId(invoiceNum)
        // if (res[0] == "ConfirmationForPurchaseOrderNotExist") {
        //   setPostErrorMessage("Do you want to close this Batch?")
        //   setPostModal(!showPostModal)
        // }
      })
      .catch((e) => {
        setPageLoader(false);
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        }
      })
  }

  const onConfirmPostSave = () => {
    setPostModal(false);
    setLoading(true)
    WebService.getAPI({
      action: `SDInvoice/ValidateInvoiceForApproval/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}`,
      body: null
    })
      .then((res: any) => {
        
        if (res[0] == "ConfirmationForPurchaseOrderNotExist") {
          WebService.getAPI({
            action: `SDInvoiceBatch/CloseBatch/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.InvoiceData?.InvoiceNum}/${user_info["firstName"]} ${user_info["lastName"]}`
          })
            .then((res: any) => {
              setLoading(false)
              setDisablePost(true)
              setPageLoader(false);
              props.searchId(invoiceNum)
            })
            .catch((e) => {
              setLoading(false)
              if (e.response.data.ErrorDetails.message) {
                setAlertModel(!showAlertModel)
                setErrorMessage(e?.response?.data?.ErrorDetails?.message)
              }
            });
          setPageLoader(false);
        }
      })
      .catch((e) => {
        setPageLoader(false);
        // if (e.response.data.ErrorDetails.message) {
        //   setAlertModel(!showAlertModel)
        //   setErrorMessage(e?.response?.data?.ErrorDetails?.message)
        // }
      })
  }

  const onCloseSettingModal = () => {
    setShowSettingModal(false)
  }


  return <>

  

    {/* <DraggableModal
      isOpen={showAlertApproveModel}
      onClose={() => setAlertApproveModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    /> */}
    {/* 
    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    /> */}

    <Row className="mb-2 align-items-center">
      <Col md={6}>
        <BackComponent title={'Invoice Entry / Approval'} />
      </Col>
      <Col md={6} className="text-end d-flex justify-content-end">
        <Dropdown className="action-dd me-3">
          <Dropdown.Toggle onClick={() => setShowSettingModal(!showSettingModal)}>
            <Gear size={20} className="text-brand" />
          </Dropdown.Toggle>
        </Dropdown>
        <Dropdown className="action-dd">
          <Dropdown.Toggle id="dropdown-basic">
            <img
              src={require("../../../../assets/images/blue-hamburg-icon.svg").default}
              className="hamburg-icon show theme-icon-color"
              alt="hamburg"
            />
            <img src={require("../../../../assets/images/cross-icon-new.svg").default}
              className="hamburg-icon close theme-icon-color"
              alt="hamburg"
            />
          </Dropdown.Toggle>
          <Dropdown.Menu className="invoice-entry-dropmenu">
            <Dropdown.Item className={disableApprove == true ? "disable-option" : ""} onClick={() => onApprovedata()}>Approve</Dropdown.Item>
            <Dropdown.Item className={disablePost == true ? "disable-option" : ""} onClick={() => onpostdata()}>Post</Dropdown.Item>
            <Dropdown.Item className={(props?.InvoiceData?.IsCreditMemo && props?.InvoiceData?.IsPosted == true) ? "disable-option" : ""} onClick={() => setshowAddCreditModal(!showAddCreditModal)}>Credit</Dropdown.Item>
            <Dropdown.Item className={(props?.InvoiceData?.IsCreditMemo || props?.InvoiceData?.IsPosted == true) ? "disable-option" : ""} onClick={() => setshowAddChangeInvoiceModal(true)}>Change Invoice #</Dropdown.Item>
            <Dropdown.Item className={(props?.InvoiceData?.IsCreditMemo && props?.InvoiceData?.IsPosted == true) ? "disable-option" : ""} onClick={() => setshowAddAssignBatchBlade(!showAddAssignBatchBlade)}>Assign Batch #</Dropdown.Item>
            {/* <Dropdown.Item href="#/action-3" className="dd-sub-menu">Manage Cards <ChevronRight size={15} className="ms-3" />
              <ul className="dropdown-menu dropdown-submenu" onClick={e => e.stopPropagation()}>
                <li >
                  <Form.Group className="ps-2" controlId="GeneralInfo">
                    <Form.Check type="checkbox" label="General Info" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="BillingDetails">
                    <Form.Check type="checkbox" label="Billing Details" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="DescriptionNotes">
                    <Form.Check type="checkbox" label="Description & Notes" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="TaskList">
                    <Form.Check type="checkbox" label="Task List" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="ProfitLoss">
                    <Form.Check type="checkbox" label="Profit/Loss" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="Preview">
                    <Form.Check type="checkbox" label="Preview" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="CallReceipt">
                    <Form.Check type="checkbox" label="Call Receipt" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="Recommendations">
                    <Form.Check type="checkbox" label="Recommendations" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="Survey">
                    <Form.Check type="checkbox" label="Survey" />
                  </Form.Group>
                </li>
                <li>
                  <Form.Group className="ps-2" controlId="ActivityLog">
                    <Form.Check type="checkbox" label="Activity Log" />
                  </Form.Group>
                </li>
              </ul>
            </Dropdown.Item> */}


          </Dropdown.Menu>

        </Dropdown>
      </Col>
    </Row>

    <Row className="mb-3">
      <Col lg={4} className=" mb-lg-0 mb-md-3">
        <Card className="card-style form-style">
          <Card.Header className="bg-transparent border-light">
            <Row className="align-items-center">
              <Col md={4}>
                <span className="text-dark font-w-medium">Invoice</span>
              </Col>
              <Col md={8} className="d-flex justify-content-end">
                <input type="search" placeholder="Search.." className="form-control mt-0 me-2" style={{ width: "100%" }} value={invoiceNum} onChange={e => setInvoiceNum(e.target.value)} />
                <a
                  className="search-btn"
                  style={{ borderRadius: "4px" }}
                  onClick={() => props.searchId(invoiceNum)}
                >
                  <img
                    src={search}
                    className="icon theme-icon-color"
                    alt="Dark mode"
                  />
                </a>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body className="pb-2">
            <div className="">
              <Row className="align-items-center">
                {/* <Col md={isEditOutcome === false ? 9 : 5}> */}
                <Col md={4}>
                  <div className="text-dark">
                    <h5 className="font-16 font-w-medium mb-2">Outcome</h5>
                  </div>
                </Col>
                {
                  isEditOutcome === false ?
                    <Col md={8} className="text-end">
                      <span>{outcomeValue ? outcomeValue : props?.InvoiceData?.OutcomeCode}</span><a href="javascript:void(0)" className="edit-action mb-2"> <img src={editicon} height={14} className="theme-icon-color ms-1" onClick={() => props?.InvoiceData?.IsPosted === true || props?.InvoiceData?.IsApproved === true ? null : setEditOutcome(!isEditOutcome)} /></a>
                    </Col> :
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <Col md={9} className="pe-2">
                          <SawinSelect
                            options={outcome}
                            type={"ARROW"}
                            onChange={(data: any) => setSelectedOutcome(data.object)}
                          />
                        </Col>
                        <Col className="text-end ps-0">
                          <div className="text-nowrap">
                            <a
                              onClick={() => onSaveOutcome()}
                              className="text-dark font-18 cursor-pointer"
                            >
                              <img src={saveIcon} width="14" />
                            </a>
                            <a
                              onClick={() => setEditOutcome(!isEditOutcome)}
                              className="text-dark ms-3 font-18 cursor-pointer"
                            >
                              <img src={cancelIcon} className="theme-icon-color" width={14} />
                            </a>
                          </div>
                        </Col>
                      </div>
                    </Col>
                }
                <Col md={12} className="mt-2">
                  <p className="font-12 mb-0 "><code className="text-dark">[ U {props?.invoiceCount?.Unassign} | A {props?.invoiceCount?.Assign} | D {props?.invoiceCount?.Dispatch} | P {props?.invoiceCount?.Arrive} | C {props?.invoiceCount?.Complete} ]</code></p>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>

      </Col>
      <Col lg={8}>
        <Card className="content-card card-shadow p-0 ">
          <Card.Body className="py-2 text-dark">
            {props.showLoader === true ?
              <div style={{ textAlign: "center" }}>
                <img
                  style={{ position: "relative", height: 79 }}
                  src={loader}
                  alt="No loader found"
                />
                <div style={{ position: "relative", color: "white" }}>
                  Loading...
                </div>
              </div> :
              <>
                <Row className="mb-3 pt-1">
                  <Col >
                    <p className="mb-0 font-w-medium font-14">Invoice #</p>
                    <p className="font-14 mb-0">{props?.InvoiceData?.InvoiceNum}</p>
                  </Col>
                  <Col >
                    <p className="mb-0 font-w-medium font-14">Invoice Date</p>
                    <p className="font-14 mb-0">{moment(props?.InvoiceData?.InvoiceDate).format('MM/DD/YY')}</p>
                  </Col>
                  <Col >
                    <p className="mb-0 font-w-medium font-14">WO #</p>
                    <a onClick={() => getRedirect()} href="javascript:void(0)" className="font-14 mb-0">{props?.InvoiceData?.CallNum} <ArrowUpRight size={12} /></a>
                  </Col>
                  <Col >
                    <p className="mb-0 font-w-medium font-14">{props?.InvoiceData?.Break1LabelName}</p>
                    <p className="font-14 mb-0">{props?.InvoiceData?.Break1Name}</p>
                  </Col>
                  <Col>
                    <p className="mb-0 font-w-medium font-14">{props?.InvoiceData?.Break2LabelName}</p>
                    <p className="font-14 mb-0">{props?.InvoiceData?.Break2Name}</p>
                  </Col>

                </Row>
                <Row className="mb-2">
                  <Col>
                    <p className="mb-0 font-w-medium font-14">Gross Margin</p>
                    <p className="font-14 mb-0">${props?.InvoiceData?.FormatedGrossMargin} ({props?.InvoiceData?.GrossMarginPercentage}%)</p>
                  </Col>
                  <Col>
                    <p className="mb-0 font-w-medium font-14">Invoice Total</p>
                    <p className="font-14 mb-0">${props?.InvoiceData?.FormatedInvoiceTotal}</p>
                  </Col>
                  <Col>
                    <p className="mb-0 font-w-medium font-14">Payments</p>
                    <p className="font-14 mb-0">${HelperService.getCurrencyFormatter(props?.InvoiceData?.InvoiceTotal - props?.InvoiceData?.AmountDue)}</p>
                  </Col>
                  <Col>
                    <p className="mb-0 font-w-medium font-14">Invoice Balance</p>
                    <p className="font-14 mb-0">${props?.InvoiceData?.FormatedAmountDue}</p>
                  </Col>
                  <Col>
                    <p className="mb-0 font-w-medium font-14">Tax Code</p>
                    <p className="font-14 mb-0">{props?.InvoiceData?.TaxCode}</p>
                  </Col>
                </Row>
              </>
            }
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <DraggableModal
      isOpen={errorMessage != ""}
      onClose={() => setErrorMessage("")}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />


    <SettingBlade
      isShow={showSettingModal}
      isClose={onCloseSettingModal}
    />


    <Loader show={isLoading} />


    <AddChangeInvoiceModal
      isShow={showAddChangeInvoiceModal}
      title={'Change Invoice Number'}
      isClose={closeModal}
      data={props?.InvoiceData ? props?.InvoiceData : []}
    />
    <AddCreditModal
      isShow={showAddCreditModal}
      title={'Invoice Credit Memo '}
      isClose={closeModal}
      data={props?.InvoiceData ? props?.InvoiceData : []}
    />

    <AddAssignBatchBlade
      isShow={showAddAssignBatchBlade}
      title={'Invoice Assign Batch '}
      isClose={closeModal}
      data={props?.InvoiceData ? props?.InvoiceData : []}
    />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onpostdata}
    />
    <DraggableModal
      isOpen={showPostModal}
      onClose={() => setPostModal(false)}
      title="Alert"
      type="CONFIRM_MODAL"
      width={600}
      previousData={postErrorMessage}
      onConfirm={onConfirmPostSave}
    />

    <DraggableModal
      isOpen={showApproveModal}
      onClose={() => setApproveModal(false)}
      title="Alert"
      type="CONFIRM_MODAL"
      width={600}
      previousData={approveErrorMessage}
      onConfirm={onConfirmSave}
    />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onApprovedata}
    />
  </>;
};

export default InvoiceEntryHeader;


