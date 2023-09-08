import { useState, useEffect } from "react";

import pendingStepIcon from "../../../../assets/images/pending-step-icon.svg";
import leftArrow from "../../../../assets/images/left-arrow.svg";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import { Envelope, Telephone, CheckCircleFill, CircleFill, ArrowUpRight } from 'react-bootstrap-icons';
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import loader from "../../../../assets/images/loader.gif";
import { Dispatch } from "redux";
import "./InvoiceEntry.scss"
import { FormGroup } from "react-bootstrap";
import WebService from "../../../../utility/WebService";
import { Dot } from "react-bootstrap-icons";
import moment from "moment";
import { Draggable } from "react-beautiful-dnd";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch} from "react-redux";
import { RootState } from "../../../../config/Store";
import { InviceSDMasterState } from "../../../../reducer/CommonReducer";
import HelperService from "../../../../utility/HelperService";
import { SEARCH_RESULT, setDataInRedux,} from "../../../../action/CommonAction";

interface PropData {
  InvoiceData?: any;
  showLoader?: boolean;
  searchId?:any;
}

const InvoiceEntryLeftCol = (props: PropData) => {
  const dispatch: Dispatch<any> = useDispatch();
  const [isLoading, setLoading] = useState(false)
  const [batchData, setBatchData] = useState<any[]>([]);
  const [batchStatus, setBatchStatus] = useState<any>('');
  const [approvedData, setApprovedData] = useState<any[]>([]);
  const [unApprovedData, setUnApprovedData] = useState<any[]>([]);
  const [printedData, setPrintedData] = useState<any[]>([]);
  const [postedData, setPostedData] = useState<any[]>([]);
  const [statusTab, setStatusTab] = useState('')
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const [confirmAlertModel, setConfirmAlertModel] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Are you sure, you want to change the batch number for this invoice?')
  const [batchNumber, setBatchNumber] = useState('')
  const [batch, setBatch] = useState('resetsawin')
  const [count, setCount] = useState(0)
  let history = useNavigate();

  const status: Options[] = [
    { id: 1, value: "All" },
    { id: 2, value: "Open" },
    { id: 3, value: "Closed" },
  ];

  const collaseCol = () => {
    var LeftCol = document.getElementById("collapsibleCol");
    var RightCol = document.getElementById("wideCol");
    if (LeftCol) {
      LeftCol.classList.toggle("hideCol");
    }
    if (RightCol) {
      RightCol.classList.toggle("wide-col");
    }
  }

  useEffect(() => {
    setBatch(props?.InvoiceData?.BatchNum)
    getBatchData(1)
    setBatchStatus(1)
    props?.InvoiceData?.BatchNum &&  onConfirmChangeBatch('IN_EFFECT', props?.InvoiceData?.BatchNum)
    if (props?.InvoiceData?.IsEmailed === true) {
      setStatusTab('EMAIL')
    } else if (props?.InvoiceData?.IsPrinted === true) {
      setStatusTab('PRINTED')
    } else if (props?.InvoiceData?.IsApproved === true) {
      setStatusTab('APPROVED')
    } else if (props?.InvoiceData?.IsPosted === true) {
      setStatusTab('POSTED')
    } else if (props?.InvoiceData?.IsSurveyEmailed === true) {
      setStatusTab('SURVEY')
    }
  }, [props.InvoiceData])

  const getBatchData = (value: number) => {
    setBatchStatus(value)
    WebService.getAPI({
      action: `SDInvoiceBatch/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        if (value == 1) {
          for (var i in res) {
            array.push({ id: res[i].BatchNum, value: res[i].BatchNum });
          }
        } else if (value == 2) {
          for (var i in res) {
            if (res[i].BatchClosedOn === null) {
              array.push({ id: res[i].BatchNum, value: res[i].BatchNum });
            }
          }
        } else if (value == 3) {
          for (var i in res) {
            if (res[i].BatchClosedOn != null) {
              array.push({ id: res[i].BatchNum, value: res[i].BatchNum });
            }
          }
        }
        setApprovedData([])
        setUnApprovedData([])
        setPrintedData([])
        setPostedData([])
        setBatchData(array)
      })
      .catch((e) => console.log("e", e))
  }

  const onSelectBatch = (id: string) => {
    if (props?.InvoiceData?.BatchNum != id || count > 0) {
      setBatchNumber(id)
      setConfirmAlertModel(true)
    } else {
      setCount(count + 1)
      setBatch(props?.InvoiceData?.BatchNum)
    }
  }

  const onConfirmChangeBatch = (type: any, value: any) => {
    setLoading(true)
    setConfirmAlertModel(false)
    const requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      BatchNum: type == 'IN_EFFECT' ? value : batchNumber
    }
    WebService.postAPI({
      action: `SDInvoice/GetForBatch`,
      body: requestedBody
    })
      .then((res: any) => {
        var unApprovedData = [];
        var printedData = [];
        var postedData = [];
        var approvedData = [];
        for (var i in res) {
          if (res[i].IsPosted === true) {
            postedData.push(res[i])
          } else if ((res[i].IsPrinted === true && res[i].IsApproved === true)) {
            printedData.push(res[i])
          } else if (res[i].IsApproved === true) {
            approvedData.push(res[i])
          } else {
            unApprovedData.push(res[i])
          }
        }
        setApprovedData(approvedData)
        setUnApprovedData(unApprovedData)
        setPrintedData(printedData)
        setPostedData(postedData)
        if (type != 'IN_EFFECT') {
          toast.success('Batch assigned successfully')
        }
        setLoading(false)
      })
      .catch((e) => {
        console.log("e", e)
        setLoading(false)
      })
  }

  const getChangedInvoiceNum = (e:any) => {
    e && props.searchId(e)
  }


  const onNavigateSM = () => {
    dispatch(
      setDataInRedux({
        type: SEARCH_RESULT,
        value: { Id: props?.InvoiceData?.SMNum },
      })
    );
    history("/service-master")
  }

  return <>
    <DraggableModal
      isOpen={confirmAlertModel}
      onClose={() => setConfirmAlertModel(false)}
      title="Alert"
      type="CONFIRM_MODAL"
      width={600}
      previousData={errorMessage}
      onConfirm={onConfirmChangeBatch}
    />
    <Loader show={isLoading} />
    <div className="position-relative">
      <div className="content-wrap">
        <Card className="card-shadow text-dark companyinfo-card mb-3">
          <div className="compnay-name-card">
            {props.showLoader === true ?
              <div style={{ textAlign: "center" }}>
                <img
                  style={{ position: "relative", height: 94 }}
                  src={loader}
                  alt="No loader found"
                />
                <div style={{ position: "relative", color: "white" }}>
                  Loading...
                </div>
              </div> :
              <div>
                <h4 className="font-16 font-w-bold mb-1">{props?.InvoiceData?.SMNum}  {props?.InvoiceData?.SMName} <a href="javascript:vodi(0)" onClick={() => onNavigateSM()} className="ms-1"><ArrowUpRight size={16} /></a> </h4>
                <p className="mb-1 font-14">{props?.InvoiceData?.ARName}</p>
                <p className="font-12 mb-2 ">{props?.InvoiceData?.ARAddress}</p>
                <Row className=" ">

                  <Col md={12} className="pe-0">
                    <div className="contact font-12 d-flex align-items-center">
                    {props?.InvoiceData?.ARPhoneNumber && <> <Telephone size={12} className="me-2" /> <span className="me-2">{HelperService.getFormattedContact(props?.InvoiceData?.ARPhoneNumber)}</span> </> }
                    </div>
                  </Col>
                  {
                    invoceSDMaster?.invoceSDMaster?.ARCustomerMaster?.Email &&
                    <Col md={12} className="mt-2">
                      <div className="contact font-12 d-flex align-items-start">
                        <span><Envelope size={12} className="me-2 align-baseline" /></span> <span style={{ wordBreak: "break-word" }}>{invoceSDMaster.invoceSDMaster.ARCustomerMaster.Email} </span>
                      </div>
                    </Col>
                  }
                </Row>
              </div>
            }
          </div>
        </Card>

        <Card className="card-shadow text-dark companyinfo-card mb-3">
          <div className="compnay-name-card">
            {props.showLoader === true ?
              <div style={{ textAlign: "center" }}>
                <img
                  style={{ position: "relative", height: 45 }}
                  src={loader}
                  alt="No loader found"
                />
                <div style={{ position: "relative", color: "white" }}>
                  Loading...
                </div>
              </div> :
              <div>
                <p className="mb-1 font-14">{props?.InvoiceData?.SMName} <a href="javascript:vodi(0)" className="ms-1"><ArrowUpRight size={16} /></a> </p>
                <p className="font-12 mb-2 ">{props?.InvoiceData?.SMAddressLine1} {props?.InvoiceData?.SMAddressLine2}</p>
                <Row className=" ">
                  <Col md={12} className="pe-0">
                    <div className="contact font-12">
                      {props?.InvoiceData?.SMPhoneNumber && <> <Telephone size={12} /> <span className="me-2">{HelperService.getFormattedContact(props?.InvoiceData?.SMPhoneNumber)}</span> </> }
                    </div>
                  </Col>
                </Row>
              </div>
            }
          </div>
        </Card>
        <Card className="card-style py-2 px-3 form-style mb-3">
          <FormGroup className="mb-2">
            <label>Batch Status</label>
            <SawinSelect
              options={status}
              selected={batchStatus}
              type={"ARROW"}
              onChange={(data: any) => getBatchData(data.id)}
            />
          </FormGroup>
          <FormGroup className="mb-3">
            <label>Batch #</label>
            <SawinSelect
              options={batchData}
              selected={batch}
              isCustomInput={true}
              isSearchable={true}
              isHideArrow={true}
              type={"ARROW"}
              onChange={(data: any) => onSelectBatch(data.id ? data.id : data)}
            />
          </FormGroup>
          <Accordion defaultActiveKey="" className="accordion-style-1">
            <Accordion.Item eventKey="0">
              <Accordion.Header className="text-brand">
                <span> Approved</span>
                <span className="count">{`(${approvedData.length})`}</span>
              </Accordion.Header>
              <Accordion.Body>
                <ul className="ps-3">
                  {
                    approvedData.map((res: any) => {
                      return (
                        <li><a href="#" onClick={()=>getChangedInvoiceNum(res.InvoiceNum)}>{res.InvoiceNum}</a></li>
                      )
                    })
                  }
                </ul>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header className="text-brand">Unapproved
                {/* <span> Approved</span> */}
                <span className="count">{`(${unApprovedData.length})`}</span></Accordion.Header>
              <Accordion.Body>
                <ul className="ps-3">
                  {
                    unApprovedData.map((res: any) => {
                      return (
                        <li><a href="#" onClick={()=>getChangedInvoiceNum(res.InvoiceNum)}>{res.InvoiceNum}</a></li>
                      )
                    })
                  }
                </ul>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header><span> Approved & Printed/ Emailed</span>
                <span className="count">{`(${printedData.length})`}</span></Accordion.Header>
              <Accordion.Body>
                <ul className="ps-3">
                  {
                    printedData.map((res: any) => {
                      return (
                        <li><a href="#" onClick={()=>getChangedInvoiceNum(res.InvoiceNum)}>{res.InvoiceNum}</a></li>
                      )
                    })
                  }
                </ul>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="3">
              <Accordion.Header><span> Posted</span>
                <span className="count">{`(${postedData.length})`}</span></Accordion.Header>
              <Accordion.Body>
                <ul className="ps-3">
                  {
                    postedData.map((res: any) => {
                      return (
                        <li><a href="#" onClick={()=>getChangedInvoiceNum(res.InvoiceNum)}>{res.InvoiceNum}</a></li>
                      )
                    })
                  }
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card>

        <Card className="card-style p-3 form-style mb-3">
          <div className="setp-wizard mb-4">
            <div className={props?.InvoiceData?.IsEmailed === true ? 'step-box actives-step' : 'step-box'} onClick={() => props?.InvoiceData?.IsEmailed === true ? setStatusTab('EMAIL') : ''}>
              {props?.InvoiceData?.IsEmailed === true ? <CheckCircleFill size={15} className="step-icon active " /> : <img src={pendingStepIcon} alt="icon" className="step-icon pending theme-icon-color" />}
              <p className="step-name">Email</p>
            </div>
            <div className={props?.InvoiceData?.IsPrinted === true ? 'connector active' : 'connector'}></div>
            <div className={props?.InvoiceData?.IsPrinted === true ? 'step-box actives-step' : 'step-box'} onClick={() => props?.InvoiceData?.IsPrinted === true ? setStatusTab('PRINTED') : ''}>
              {props?.InvoiceData?.IsPrinted === true ? <CheckCircleFill size={15} className="step-icon active " /> : <img src={pendingStepIcon} alt="icon" className="step-icon pending theme-icon-color" />}
              <p className="step-name">Printed</p>
            </div>
            <div className={props?.InvoiceData?.IsApproved === true ? 'connector active' : 'connector'}></div>
            <div className={props?.InvoiceData?.IsApproved === true ? 'step-box actives-step' : 'step-box'} onClick={() => props?.InvoiceData?.IsApproved === true ? setStatusTab('APPROVED') : ''}>
              {props?.InvoiceData?.IsApproved === true ? <CheckCircleFill size={15} className="step-icon active" /> : <img src={pendingStepIcon} alt="icon" className="step-icon pending theme-icon-color" />}
              <p className="step-name">Approved</p>
            </div>
            <div className={props?.InvoiceData?.IsPosted === true ? 'connector active' : 'connector'}></div>
            <div className={props?.InvoiceData?.IsPosted === true ? 'step-box actives-step' : 'step-box'} onClick={() => props?.InvoiceData?.IsPosted === true ? setStatusTab('POSTED') : ''}>
              {props?.InvoiceData?.IsPosted === true ? <CheckCircleFill size={15} className="step-icon active" /> : <img src={pendingStepIcon} alt="icon" className="step-icon pending theme-icon-color" />}
              <p className="step-name">Posted</p>
            </div>
            <div className={props?.InvoiceData?.IsSurveyEmailed === true ? 'connector active' : 'connector'}></div>
            <div className={props?.InvoiceData?.IsSurveyEmailed === true ? 'step-box actives-step' : 'step-box'} onClick={() => props?.InvoiceData?.IsSurveyEmailed === true ? setStatusTab('SURVEY') : ''}>
              {props?.InvoiceData?.IsSurveyEmailed === true ? <CheckCircleFill size={15} className="step-icon active" /> : <img src={pendingStepIcon} alt="icon" className="step-icon pending theme-icon-color" />}
              <p className="step-name">Survey</p>
            </div>
          </div>

          {statusTab === 'EMAIL' &&
            <div className="verticle-step px-2">
              <div className={props?.InvoiceData?.EmailedOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Sent</p>
                <p className="detail-text">{props?.InvoiceData?.EmailedBy}</p>
                <p className="detail-text">{props?.InvoiceData?.EmailedOn && moment(props?.InvoiceData?.EmailedOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
              <div className={props?.InvoiceData?.DelieveredOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Delivered</p>
                <p className="detail-text">{props?.InvoiceData?.DelieveredOn && moment(props?.InvoiceData?.DelieveredOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
              <div className={props?.InvoiceData?.ReadOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Read</p>
                <p className="detail-text">{props?.InvoiceData?.ReadOn && moment(props?.InvoiceData?.ReadOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
            </div>}

          {statusTab === 'PRINTED' &&
            <div className="verticle-step px-2">
              <div className="step-box">
                <p className="detail-text">{props?.InvoiceData?.PrintedBy}</p>
                <p className="detail-text">{props?.InvoiceData?.PrintedOn && moment(props?.InvoiceData?.PrintedOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
            </div>}

          {statusTab === 'APPROVED' &&
            <div className="verticle-step px-2">
              <div className="step-box">
                <p className="detail-text">{props?.InvoiceData?.ApprovedBy}</p>
                <p className="detail-text">{props?.InvoiceData?.ApprovedOn && moment(props?.InvoiceData?.ApprovedOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
            </div>}

          {statusTab === 'POSTED' &&
            <div className="verticle-step px-2">
              <div className="step-box">
                <p className="detail-text">{props?.InvoiceData?.PostedBy}</p>
                <p className="detail-text">{props?.InvoiceData?.PostedOn && moment(props?.InvoiceData?.PostedOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
            </div>}

          {statusTab === 'SURVEY' &&
            <div className="verticle-step px-2">
              <div className={props?.InvoiceData?.SurveyEmailedOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Sent</p>
                <p className="detail-text">{props?.InvoiceData?.SurveyEmailedBy}</p>
                <p className="detail-text">{props?.InvoiceData?.SurveyEmailedOn && moment(props?.InvoiceData?.SurveyEmailedOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
              <div className={props?.InvoiceData?.SurveyEmailDelieveredOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Delivered</p>
                <p className="detail-text">{props?.InvoiceData?.IsSurveyEmailDelievered}</p>
                <p className="detail-text">{props?.InvoiceData?.SurveyEmailDelieveredOn && moment(props?.InvoiceData?.SurveyEmailDelieveredOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
              <div className={props?.InvoiceData?.SurveyEmailReadOn ? "step-box active" : "step-box"}>
                <CircleFill size={12} className="circle-icon" />
                <p className="step-title">Read</p>
                <p className="detail-text">{props?.InvoiceData?.IsSurveyEmailRead}</p>
                <p className="detail-text">{props?.InvoiceData?.SurveyEmailReadOn && moment(props?.InvoiceData?.SurveyEmailReadOn).format('MM/DD/YY hh:mm A')}</p>
              </div>
            </div>}

        </Card>
      </div>
      <button className="btn btn-collapse" onClick={collaseCol}><img src={leftArrow} width="6" /></button>
    </div >
  </>;
};

export default InvoiceEntryLeftCol;


