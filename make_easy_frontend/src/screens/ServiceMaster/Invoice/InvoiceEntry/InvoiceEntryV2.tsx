import { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Envelope, Telephone, Phone, ArrowUpRight, CheckCircleFill, CircleFill } from 'react-bootstrap-icons';
import InvoiceEntryHeader from './InvoiceEntryHeader';
import InvoiceEntryLeftCol from './InvoiceEntryLeftCol';
import InvoiceEntryPagesLink from './InvoiceEntryPagesLink';
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";
import {WorkOrderIdState } from "../../../../reducer/CommonReducer";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import { RootState } from "../../../../config/Store";
import Offcanvas from 'react-bootstrap/Offcanvas';

import "./InvoiceEntry.scss"
import WebService from "../../../../utility/WebService";

const InvoiceEntryV2 = () => {
  const [ShowLoader, setShowLoader] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [invoiceData, setInvoiceData] = useState<any>({});
  const { id } = useParams();
  const workOrderId: any = useSelector<RootState, WorkOrderIdState>(
    (state) => state.workOrderId);
    console.log(workOrderId)

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
    getInvoiceData()
  }, [])

  const getInvoiceData = () => {
    var requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: id
    }
    WebService.postAPI({
      action: `SDInvoice/GetInvoiceDataToPrint/`,
      body: requestedBody
    })
      .then((res) => {
        console.log("res", res)
        setInvoiceData(res)
      })
      .catch((e) => { })
  }

  return <>
    <div className='page-content-wraper call-info-page'>
      <InvoiceEntryHeader />
      <Row>
        <Col lg={4} id="collapsibleCol">
          <InvoiceEntryLeftCol />
        </Col>
        <Col md={8} id="wideCol">
          <InvoiceEntryPagesLink />
        </Col>
      </Row>

    </div>

  </>;
};

export default InvoiceEntryV2;


