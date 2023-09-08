import { useState, useEffect } from "react";
import { Row, Col, Offcanvas } from 'react-bootstrap';

import { Envelope, Telephone, Phone, ArrowUpRight, CheckCircleFill, CircleFill } from 'react-bootstrap-icons';
import InvoiceEntryHeader from './InvoiceEntryHeader';
import InvoiceEntryLeftCol from './InvoiceEntryLeftCol';
import InvoiceEntryPagesLink from './InvoiceEntryPagesLink';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { WorkOrderIdState,isRefreshState } from "../../../../reducer/CommonReducer";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import { RootState } from "../../../../config/Store";
import { Dispatch } from "redux";
import { setDataInRedux, SET_INVOICE_DATA,SET_INVOICE_SD_MASTER } from "../../../../action/CommonAction";
import { Button } from "../../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import "./InvoiceEntry.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";

const InvoiceEntry = () => {
  const [isLoading, setLoading] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [invoiceData, setInvoiceData] = useState<any>({});
  const [invoiceStatus, setInvoiceStatus] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlertModel, setAlertModel] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const workOrderId: any = useSelector<RootState, WorkOrderIdState>(
    (state) => state.workOrderId);
    const isRefresh: any = useSelector<RootState, isRefreshState>(
      (state) => state.isRefresh);
  const dispatch: Dispatch<any> = useDispatch();
  let history = useNavigate();
  
  const dropdonwOptions: Options[] = [
    { id: 1, value: "Option 1" },
    { id: 2, value: "Option 2" },
    { id: 3, value: "Option 3" },
    { id: 4, value: "Option 4" },
  ];

  const collaseCol = () => {
    var element = document.getElementById("collapsibleCol");
    if (element) {
      element.classList.toggle("hideCol");
    }
  }


  useEffect(() => {
    getInvoiceData(workOrderId.workOrderId.id)
    getInvoiceCountStatus(workOrderId.workOrderId.id);
  }, []);


useEffect(()=>{
  getInvoiceData(invoiceData?.InvoiceNum)
  getInvoiceCountStatus(invoiceData?.InvoiceNum)
},[isRefresh])





  const SDMasterDataSet = (e:any) => {
    WebService.getAPI({
      action: `SDInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${e}`,
      body: null,
      })
      .then((res: any) => {
        dispatch(setDataInRedux({ type: SET_INVOICE_SD_MASTER, value: res }));
      })
      .catch((e) => { });
  }

  const getInvoiceData = (id: string) => {
    if(id){
      setLoading(true)
      var requestedBody = {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        InvoiceNum: id
      }
      WebService.postAPI({
        action: `SDInvoice/GetInvoiceDataToPrint`,
        body: requestedBody
      })
        .then((res) => {
          setInvoiceData(res)
          let CallNumber:any = res;
          SDMasterDataSet(id)
          dispatch(setDataInRedux({ type: SET_INVOICE_DATA, value: res }));
          setLoading(false)
        })
        .catch((e) => {
          setPageLoader(false);
          if(e.response.data.ErrorDetails.message){
           setAlertModel(!showAlertModel)
          setErrorMessage(e?.response?.data?.ErrorDetails?.message)
          }
          })
    }
 
  }

  const getInvoiceCountStatus = (id: string) => {
    setLoading(true)
    WebService.getAPI({
      action: `SDCallMaster/GetCallInstanceCountByStatus/${user_info["AccountId"]}/${user_info["CompanyId"]}/${id}`,
      body: null
    })
      .then((res: any) => {
        setInvoiceStatus(res.Data)
        setLoading(false)
      })
      .catch((e) => { setLoading(false) })
  }

  const onSearch = (value: any) => {
    if(value){
      if(window.location.pathname == "invoice-entry"){
        getInvoiceData(value)
        getInvoiceCountStatus(value)
      }else{
        getInvoiceData(value)
        getInvoiceCountStatus(value)  
        history("invoice-entry")
      }
    }  
  }

  return <>

  <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />
    <div className='page-content-wraper call-info-page'>
      <InvoiceEntryHeader InvoiceData={invoiceData} invoiceCount={invoiceStatus} searchId={onSearch} showLoader={isLoading} />
      <Row>
        <Col lg={4} id="collapsibleCol">
          <InvoiceEntryLeftCol InvoiceData={invoiceData} searchId={onSearch} showLoader={isLoading} />
        </Col>
        <Col md={8} id="wideCol" className="invoces-pages">
          <Outlet />
        </Col>
      </Row>
    </div>

  </>;
};

export default InvoiceEntry;


