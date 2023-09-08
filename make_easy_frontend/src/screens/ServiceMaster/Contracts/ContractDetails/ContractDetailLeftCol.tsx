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

import "./ContractDetail.scss"
import { FormGroup } from "react-bootstrap";
import WebService from "../../../../utility/WebService";
import { Dot } from "react-bootstrap-icons";
import moment from "moment";
import { Draggable } from "react-beautiful-dnd";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader/Loader";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InviceSDMasterState } from "../../../../reducer/CommonReducer";

interface PropData {
  InvoiceData?: any;
  showLoader?: boolean;
}

const ContractDetailLeftCol = (props: PropData) => {
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

  return <>
    
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
                <h4 className="font-16 font-w-bold mb-1">{props?.InvoiceData?.SMNum}  {props?.InvoiceData?.SMName} <a href="javascript:vodi(0)" onClick={() => history("/service-master")} className="ms-1"><ArrowUpRight size={16} /></a> </h4>
                <p className="mb-1 font-14">{props?.InvoiceData?.ARName}</p>
                <p className="font-12 mb-2 ">{props?.InvoiceData?.ARAddress}</p>
                <Row className=" ">

                  <Col md={12} className="pe-0">
                    <div className="contact font-12 d-flex align-items-center">
                      <Telephone size={12} className="me-2" /> <span className="me-2">{props?.InvoiceData?.ARPhoneNumber}</span>
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
                      <Telephone size={12} /> <span className="me-2">{props?.InvoiceData?.SMPhoneNumber}</span>
                    </div>
                  </Col>
                </Row>
              </div>
            }
          </div>
        </Card>

      </div>
      <button className="btn btn-collapse" onClick={collaseCol}><img src={leftArrow} width="6" /></button>
    </div >
  </>;
};

export default ContractDetailLeftCol;


