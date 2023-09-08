import React from "react";
import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import iconDate from "../../../../assets/images/calander-icon.svg";
import invoiceImg from "../../../../assets/images/invoice-img.jpg";
import loader from "../../../../assets/images/loader.gif";
import moment from "moment";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Offcanvas, Card, Row, Col, Form } from 'react-bootstrap';
import { X } from 'react-bootstrap-icons';
import WebService from "../../../../utility/WebService";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import "./InvoiceEntry.scss"
import { RootState } from "../../../../config/Store";
import { InvoiceState } from "../../../../reducer/CommonReducer";
import { useSelector } from "react-redux";
import SawinMultiSelect from "../../../../components/Select/SawinMultiSelect";


// const DropDownOpt: Options[] = [
//   { id: 1, value: "Select" },
//   { id: 2, value: "Option 2" },
//   { id: 3, value: "Option 3" },
//   { id: 4, value: "Option 4" },
// ];

const CallReceipt = () => {
  const {
    formState: { errors },
    control,
  } = useForm();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const invoiceData: any = useSelector<RootState, InvoiceState>((state) => state.invoice);
  const [rawData, setRawData] = useState('')
  const [footer, setFooter] = useState('')
  const [isLoading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const date = useRef<Date>(new Date());
  const url = useRef('')
  const [tech, setTech] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState<any[]>([]);
  const [initialSelectedTech, setInitialSelectedTech] = useState<any[]>([]);

  useEffect(() => {
    getDownloadUrl()
    getTech()
  }, []);


  const getDocument = (firstDate?: any, secondDate?: any, filterValue?: boolean) => {
    console.log("filterValue",filterValue)
    setRawData('')
    setFooter('')
    let TechnicianList: any[] = [];
    if (selectedTech.length > 0) {
      for (let i in selectedTech) {
        TechnicianList.push(selectedTech[i].id)
      }
    }
    var requestedBody = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: invoiceData?.invoiceData?.InvoiceNum,
      FromDate: firstDate ? moment(firstDate).format('YYYY-MM-DD hh:mm:ss') : moment(date.current).format('MM/DD/YYYY') + " 0:0:0",
      ToDate: secondDate ? moment(secondDate).format('YYYY-MM-DD hh:mm:ss') : moment(new Date()).format("MM/DD/YYYY") + " 23:0:0",
      IsDateFilter: filterValue,
      IsPrintorEmail: "false",
      TechnicianList: TechnicianList
    }

    WebService.postAPI({
      action: `SDInvoice/GetInterpolatedInvoiceCallReceiptHtml`,
      body: requestedBody
    })
      .then((res: any) => {
        setRawData(res.ContentHtml)
        setFooter(res.FooterHtml)

        setLoading(false)
      })
      .catch((e) => {
        console.log("e", e)
        setLoading(false)
      })
  }

  const getDownloadUrl = () => {

    setLoading(true)
    let requestedBody: any = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: invoiceData?.invoiceData?.InvoiceNum,

    }
    if (startDate) {
      requestedBody.FromDate =
        moment(startDate).format("MM/DD/YYYY") + " 0:0:0";
    } else {
      requestedBody.FromDate = moment(new Date()).format("MM/DD/YYYY") + " 0:0:0";
    }

    if (endDate) {
      requestedBody.ToDate =
        moment(endDate).format("MM/DD/YYYY") + " 23:0:0";
    } else {
      requestedBody.ToDate =
        moment(new Date()).format("MM/DD/YYYY") + " 23:0:0";
    }
    WebService.postAPI({
      action: `SetupSaiSDTechMaster/GetTechForCallReceipt`,
      body: requestedBody
    })
      .then((res: any) => {
        url.current = res
        getDocument("", "", true)
      })
      .catch((e) => {
        setLoading(false)
      })
  }

  const getTech = (firstDate?: any, secondDate?: any) => {
    let requestedBody: any = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      InvoiceNum: invoiceData?.invoiceData?.InvoiceNum,

    }
    if (startDate) {
      requestedBody.FromDate =
        moment(startDate).format("MM/DD/YYYY") + " 0:0:0";
    } else {
      requestedBody.FromDate = moment(new Date()).format("MM/DD/YYYY") + " 0:0:0";
    }

    if (endDate) {
      requestedBody.ToDate =
        moment(endDate).format("MM/DD/YYYY") + " 23:0:0";
    } else {
      requestedBody.ToDate =
        moment(new Date()).format("MM/DD/YYYY") + " 23:0:0";
    }
    WebService.postAPI({
      action: `SetupSaiSDTechMaster/GetTechForCallReceipt`,
      body: requestedBody,
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].TechNum, value: res[i].TechNameInternal });
        }
        let selectedArray = [];
        if (res.length > 0) {
          for (let i in res) {
            selectedArray.push(res[i].TechNum)
          }
        }
        setInitialSelectedTech(selectedArray)
        setTech(array);
        setLoading(false);
        {
          firstDate && getDocument(firstDate, secondDate, true)
        }
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  return <>

    {/* <Loader show={isLoading} /> */}

    <div className=''>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Call Receipt'} />
          <Card className="card-style form-style call-recipt-card">
            <Card.Body className="border-bottom border-light">
              <Row className="align-items-end">
              <h6 className="text-small">Service Date</h6>
                <Col md={7} className="d-flex align-items-center">
                  <div className="me-2">
                    <label htmlFor="" className="font-14 mb-0">From Date</label>
                    <Controller
                      control={control}
                      name="StartDate"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SawinDatePicker
                          selected={startDate}
                          onChange={(data: any) => {
                            setStartDate(data);
                            field.onChange(data);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="me-2">
                    <label htmlFor="" className="font-14 mb-0">To Date</label>
                    <Controller
                      control={control}
                      name="endDate"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SawinDatePicker
                          selected={endDate}
                          onChange={(data: any) => {
                            setEndDate(data);
                            field.onChange(data);
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="me-2 col-3">
                    <Button variant="primary" className="btn-brand-solid-2 btn-sm mt-4" style={{ minWidth: "auto", height: "33px" }} onClick={() => getTech(startDate, endDate)}>Show Techs</Button>
                  </div>
                </Col>
                <Col md={5} className="d-flex align-items-center">
                  <div className="col-7 pe-3">

                    <SawinMultiSelect
                      options={tech}
                      selected={initialSelectedTech}
                      placeholder="Select"
                      onChange={(data: any) =>
                        setSelectedTech(data)}
                    />
                  </div>
                  <Button variant="primary" className="btn-brand-solid-2 btn-sm" style={{ minWidth: "auto", height: "33px" }} onClick={() => getDocument(startDate, endDate, false)}>Retrieve</Button>
                </Col>
              </Row>
            </Card.Body>
            <Card.Body>
              {
                isLoading === true ?
                  <div style={{ textAlign: "center" }}>
                    <img
                      style={{ position: "relative", height: 79 }}
                      src={loader}
                      alt="No loader found"
                    />
                    <div style={{ position: "relative", color: "white" }}>
                      Loading...
                    </div>
                  </div>
                  :
                  <div className="blue-border">
                    <div dangerouslySetInnerHTML={{ __html: rawData }} />
                    <div dangerouslySetInnerHTML={{ __html: footer }} />
                  </div>
              }
            </Card.Body>

          </Card>
        </Col>
      </Row>
    </div>




  </>;
};

export default CallReceipt;


