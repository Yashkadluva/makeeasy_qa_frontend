import { useState, useEffect } from "react";
import iconCall from "../../../../assets/images/call-circle.svg";
import loader from "../../../../assets/images/loader.gif";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Card, Row, Col } from 'react-bootstrap';
import "./InvoiceEntry.scss"
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceState, InviceSDMasterState } from "../../../../reducer/CommonReducer";
import Loader from "../../../../components/Loader/Loader";
import { ArrowRight } from "react-bootstrap-icons";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";
import { toast } from 'react-toastify';

const ActivityLog = () => {
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const [activityLogData, setActivityLogData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any>({});
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [ShowLoader, setShowLoader] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [isShowSystemLog, setShowSystemLog] = useState(false);

  useEffect(() => {
    getActivityLog(2)
  }, []);


  const getActivityLog = (e: any) => {
    setShowLoader(true)
    WebService.getAPI({
      action: `SDCallActivity/GetActivityDetails/${invoiceData?.invoiceData?.CallNum}/${user_info["AccountId"]}/${user_info["CompanyId"]}/${e}`,
      body: null
    })
      .then((res: any) => {
        setShowLoader(false)
        let temp = res.sort((a: any, b: any) => {
          return (a.ActivityDateTime > b.ActivityDateTime) ? -1 : 1
        })
        setActivityLogData(temp)
      })
      .catch((e) => {
        setShowLoader(false)
      })
  }

  const onSubmit = () => {
    if (textMessage == "") {
      toast.error("Please Enter Comments")
    } else {
      setLoading(true)
      let requestedData = {
        SDCallMasterId: invoceSDMaster?.invoceSDMaster?.Id,
        SDServiceMasterId: invoceSDMaster?.invoceSDMaster?.SDServiceMasterId,
        SDServiceMasterName: invoceSDMaster?.invoceSDMaster?.SDServiceMaster?.CompanyName,
        CompanyId: user_info["CompanyId"],
        AccountId: user_info["AccountId"],
        NewValue: textMessage,
      }
      WebService.postAPI({
        action: `SDCallMaster/LogCallActivity`,
        body: requestedData
      })
        .then((res) => {
          setLoading(false)
          toast.success('Activity log added successfully')
          setTextMessage("")
          getActivityLog(isShowSystemLog == true ? 1 : 2);
        })
        .catch((e) => {
          setLoading(false)
        })
    }
  }

  const handleEntry = (e: any) => {
    setShowSystemLog(e)
    if (e == true) {
      getActivityLog(1)
    } else if (e == false) {
      getActivityLog(2)
    }
  }
  //Placeholder Avtar Name
  const getShortName = (fullName: string) => {
    if (fullName) {
      return fullName.split(' ').map(n => n[0]).join('');
    }
  }

  return <>
    <Loader show={isLoading} />
    <div className=' '>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Activity Log'} />


          <Row>
            <Col md={12} id="wideCol">
              <Card className="border-0 p-3 form-style activity-log-card card-style">
                <Card.Body className="p-0 mb-2" style={{flex: "inherit"}}>
                  <Row className="align-items-start">
                    <Col className="text-end mb-2 d-flex" md="12">
                      <div className="w-100 text-start pe-3">
                        <label className="font-14">Comments</label>
                        <textarea value={textMessage} rows={2} onChange={(e) => setTextMessage(e.target.value)} className="form-control h-auto"></textarea>
                      </div>
                      <Button onClick={() => onSubmit()} variant="light" className="btn-brand-light mt-4">+ Add</Button></Col>
                  </Row>
                </Card.Body>
                <div className="mb-2 col-4">
                  <ToggleButton isChecked={isShowSystemLog} title="Show System Log" label_id="" onChange={handleEntry} />
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

                    <>

                      {
                        isShowSystemLog == false &&
                        activityLogData.map((res, index) => {
                          return (
                            <Card.Body className="border-top border-light py-2 ps-0" key={index} style={{flex: "inherit"}}>
                              <Row className='align-items-center'>
                                <Col md={12}>
                                  <div className="d-flex">
                                    <div className=" ">
                                        <div className="name-palceholder tech-name-avtar">
                                        {
                                          res.TechProfilePictureUrl ?
                                            <img
                                              src={res.TechProfilePictureUrl}
                                              alt="Photo"
                                              width={45}
                                              height={45}
                                              className="user-photo"
                                            />
                                            :
                                            getShortName(res.UpdatedBy)
                                        }
                                      </div>
                                    </div>

                                    <div className='ps-2'>
                                      <p className='mb-1 text-brand font-14 font-w-medium'>{res.UpdatedBy} <span className='mb-0 text-secondary font-12 ms-2'>{res.ActivityDateTime && HelperService.getFormatedDateAndTime(res.ActivityDateTime)}</span></p>
                                      <p className='mb-0 text-dark font-14 font-w-medium'>Description:</p>
                                      <p className='mb-0 text-dark font-14'>{res.NewValue && res.NewValue.replaceAll("Desc:", '')}</p>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )
                        })
                      }
                      {
                        isShowSystemLog == false &&
                        activityLogData.length == 0 &&
                        <Card.Body className="border-top border-light py-2" style={{flex: "inherit"}}>
                          <Row className='align-items-center'>
                            <Col md={12}>
                              <div className="d-flex justify-content-center">
                                <p className='mb-0 text-dark font-14 font-w-medium text-center'>No Activity Log Found</p>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      }
                      {
                        isShowSystemLog == true &&
                        activityLogData.length == 0 &&
                        <Card.Body className="border-top border-light py-2">
                          <Row className='align-items-center'>
                            <Col md={12}>
                              <div className="d-flex justify-content-center">

                                <p className='mb-0 text-dark font-14 font-w-medium text-center'>No Activity Log Found</p>

                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      }
                      {
                        isShowSystemLog == true &&
                        activityLogData.map((res, index) => {
                          return (
                            <Card.Body className="border-top border-light" >
                              <Row className='align-items-center'>
                                <Col md={12}>
                                  <div className="d-flex">
                                    <div>
                                    <div className="name-palceholder tech-name-avtar">
                                        {
                                          res.TechProfilePictureUrl ?
                                            <img
                                              src={res.TechProfilePictureUrl}
                                              alt="Photo"
                                              width={45}
                                              height={45}
                                              className="user-photo"
                                            />
                                            :
                                            getShortName(res.UpdatedBy)
                                        }
                                      </div>
                                      </div>
                                    <div className='ps-2'>
                                      <p className='mb-1 text-brand font-14 font-w-medium'>{res.UpdatedBy} <span className='mb-0 text-secondary font-12 ms-2'>{res.ActivityDateTime && HelperService.getFormatedDateAndTime(res.ActivityDateTime)}</span></p>
                                      <p className='mb-0 text-dark font-14 font-w-medium'>Description :</p>
                                      <p className='mb-0 text-dark font-14'>{res.NewValue && HelperService.removeHtml(res.ActivityDescription.replaceAll("Desc:", ''))}</p>
                                      {
                                        <p className='mb-0 text-dark font-14'>{res.OldValue ? <> {HelperService.removeHtml(res.OldValue)}{res.OldValue && res.NewValue && <ArrowRight className="mx-2" />}</> : ""}  {res.NewValue ? HelperService.removeHtml(res.NewValue) : ""}</p>
                                      }
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </Card.Body>
                          )
                        })
                      }
                    </>
                }
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

    </div>
  </>;
};

export default ActivityLog;


