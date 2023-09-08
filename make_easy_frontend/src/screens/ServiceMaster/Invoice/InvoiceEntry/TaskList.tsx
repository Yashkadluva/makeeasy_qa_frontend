import { useState, useEffect } from "react";
import loader from "../../../../assets/images/loader.gif";
import Plumbing from "../../../../assets/images/plumbing.jpg";
import Electrician from "../../../../assets/images/electrician.jpg";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Card, Row, Col, Offcanvas, Form } from 'react-bootstrap';
import "./InvoiceEntry.scss"
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceState, InviceSDMasterState } from "../../../../reducer/CommonReducer";
import Loader from "../../../../components/Loader/Loader";
import { ChevronRight, CircleFill, X, FilePdf, FileExcel, FileText } from "react-bootstrap-icons";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";
import { toast } from 'react-toastify';
import TaskListBlade from "../InvoiceEntryBlade/TaskListBlade/TaskListBlade";

const TaskList = () => {
  const [isLoading, setLoading] = useState(false);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [show2, setShow2] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  const [taskData, setTaskData] = useState<any>([])
  const [taskListData, setTaskListData] = useState(false);
  const [ShowAllChecklist, setAllChecklist] = useState(false)
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const [selectedTaskData, setSelectedTaskData] = useState<any>({})
  const [selectedTaskIds, setSelectedTaskIds] = useState<any>({})


  useEffect(() => {
    // getTaskList();
    getTaskListInitial();
  }, []);

  const handleShow2 = (e: any, data: any) => {
    setSelectedTaskIds(data);
    setSelectedTaskData(e);
    setShow2(true);
  };

  // console.log(taskData)

  const getTaskListInitial = () => {
    setShowLoader(true)
    WebService.getAPI({
      action: `SDTechAssignedOnCall/GetAllOrOneTechByInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}/null`,
      body: null,
    })
      .then((res: any) => {
        setShowLoader(false)
        // setTaskData(res)
        res.length > 0 && arrangeTaskList(res, 0)
      })
      .catch((e) => { setShowLoader(false) });
  }

  const arrangeTaskList = (data: any, e: number) => {
    if (data.length > e) {
      setShowLoader(true)
      WebService.getAPI({
        action: `SaiTaskList/GetAllCheckListsForCall/${user_info["AccountId"]}/${user_info["CompanyId"]}/${data[e].InvoiceNum}/${data[e].EntityCode}`,
        body: null,
      })
        .then((res: any) => {
          if (data.length > e) {
            data[e].TaskField = res;
            arrangeTaskList(data, ++e)
          }
        })
        .catch((e) => { setShowLoader(false) });
    } else {
      setShowLoader(false)
      setTaskData(data)
    }
  }


  const getTaskList = () => {
    // setShowLoader(true)
    // WebService.getAPI({
    //   action: `SaiTaskList/GetAllCheckListsForCall/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}/${e}`,
    //   body: null,
    // })
    //   .then((res: any) => {
    //     setShowLoader(false)
    //     // setTaskData(res)
    //   })
    //   .catch((e) => { setShowLoader(false) });
  }

  const onCloseTaskListBlade = (value: any, type: any) => {
    setShow2(value)
  }



  return <>
    <TaskListBlade
      isShow={show2}
      isClose={onCloseTaskListBlade}
      Ids={selectedTaskData}
      data={selectedTaskIds}
    />
    <Loader show={isLoading} />
    <div className=' '>
      <Row>
        <Col md={12} id="wideCol">
          <BackComponent title={'Task List'} />
          <Row>
            <Col md={12} id="wideCol">
              <Card className="border-0 p-3 task-list-card card-style">
                <div className="d-flex justify-content-end">
                  <Form.Group className="mb-3" controlId="ShowAll">
                    <Form.Check type="checkbox" label="Show All Checklist" checked={ShowAllChecklist} onChange={() => {
                      setAllChecklist(!ShowAllChecklist); setTaskData(taskData)
                    }} />
                  </Form.Group>
                </div>
                {
                  ShowLoader == true ? (
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
                    <div>
                      {
                        taskData.length > 0 && taskData.map((item: any, index: number) => {

                          return (
                            <div>
                              <div>
                                <span>Tech # : {item?.SetupSaiSDTechMaster?.TechNum}</span>
                                <span className="mx-4">Name : {item?.SetupSaiSDTechMaster?.TechNameInternal}</span>  </div>
                              {
                                item?.TaskField.length > 0 &&
                                item?.TaskField.map((res: any) => {
                                  if (res.IsIncluded == true && ShowAllChecklist === false) {
                                    return (
                                      <Card key={index} className="border border-light task-list-cards " onClick={() => handleShow2(res, item)}>
                                        <div className=" ">
                                          <CircleFill size={15} className="text-success me-2 mb-1" />  <span>{res.Header}</span>
                                          <span className="float-end"> <ChevronRight /> </span>
                                        </div>
                                      </Card>
                                    )
                                  }
                                  else if (ShowAllChecklist === true) {
                                    return (
                                      <Card key={index} className="border border-light task-list-cards " onClick={() => handleShow2(res, item)}>
                                        <div className=" ">
                                          <CircleFill size={15} className="text-success me-2 mb-1" />  <span>{res.Header}</span>
                                          <span className="float-end"> <ChevronRight /> </span>
                                        </div>
                                      </Card>
                                    )
                                  }
                                })
                              }
                            </div>
                          )
                        })
                      }

                    </div>
                  )
                }

              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  </>;
};

export default TaskList;


