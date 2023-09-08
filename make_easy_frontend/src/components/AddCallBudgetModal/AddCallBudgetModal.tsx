import { useEffect, useState, useRef } from "react";
import { Label } from "../../components/Label/Label";
import "./AddCallBudgetModal.scss";
import Button from "react-bootstrap/Button";
import { right } from "@popperjs/core";
import leftIcon from "../../assets/images/new-left-arrow.svg";
import RightIcon from "../../assets/images/new-right-arrow.svg";
import WebService from "../../utility/WebService";
import moment from "moment";
import SawinSelect from "../Select/SawinSelect";
import loader from "../../assets/images/loader.gif";
import Form from "react-bootstrap/Form";
import Offcanvas from "react-bootstrap/Offcanvas";
import { getTechnicianTrade } from "../../utility/CommonApiCall";

interface PropData {
  isShow: boolean;
  title: any;
  isClose: any;
  isTaskCode: boolean;
}

const AddCallBudgetModal = (props: PropData) => {
  const onCloseModal = () => {
    props.isClose(!props.isShow);
  };

  const [zoneList, setZoneList] = useState<any>([]);
  const [callBudget, setCallBudget] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [zone, setZone] = useState(true);
  const [zoneTrade, setZoneTrade] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  const [zoneServiceMaintainance, setServiceMaintainance] = useState(false);
  const date = useRef<Date>(new Date());
  const [zoneId, setZoneId] = useState("");
  const [tradeId, setTradeId] = useState();

  useEffect(() => {
    if (props.isShow) {
      getCallBudget(0);
      getZoneList();
      getTrades();
    }
  }, [props.isShow]);

  const getZoneList = () => {
    setShowLoader(true);
    WebService.getAPI({
      action: `SetupSDZone/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].Zone, value: res[i].ZoneDescr });
        }
        setZoneList(array);
        setShowLoader(false);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const getCallBudget = (days: number) => {
    setShowLoader(true);
    date.current = moment(date.current).add(days, "d").toDate();

    const obj = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      Zone: "TX",
      SDTechTradeId: "0",
      ServiceDate: moment(date.current).format("MM/DD/YYYY"),
      IsNext: "true",
    };

    return WebService.postAPI({
      action: `SDCallBudget/GetCallBudgetByTradeCategory`,
      body: obj,
    })
      .then((res: any) => {
        setCallBudget(res);
        setShowLoader(false);
      })
      .catch((e) => {
        setShowLoader(false);
        return e;
      });
  };

  const getTrades = () => {
    setShowLoader(true);
    getTechnicianTrade({ user_info })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].TechTrade, value: res[i].Description });
        }
        setTrades(array);
        setShowLoader(false);
      })
      .catch((e) => {
        setShowLoader(false);
      });
  };

  const onCheck = (value: string) => {
    if (value === "ZONE") {
      setZone(true);
      setZoneTrade(false);
      setServiceMaintainance(false);
    } else if (value === "ZONE_TRADE") {
      setZone(false);
      setZoneTrade(true);
      setServiceMaintainance(false);
    } else {
      setZone(false);
      setZoneTrade(false);
      setServiceMaintainance(true);
    }
  };

  const getGridData = (value: any) => {
    if (zoneServiceMaintainance) {
      var regularCallCount =
        Number(value.TotalRegularCallsCanBeBooked) +
        Number(value.RegularTypeAdjustmentCount);
      var maintainanceCallCount =
        Number(value.TotalMaintainanceCallsCanBeBooked) +
        Number(value.MaintainanceTypeAdjustmentCount);
      return regularCallCount + " | " + maintainanceCallCount;
    } else {
      return Number(value.LiveCount) + Number(value.AdjustmentCount);
    }
  };

  const selectZone = (e: any) => {
    setZoneId(e);
    setShowLoader(true);
    date.current = moment(date.current).add(0, "d").toDate();
    const obj = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      Zone: e,
      SDTechTradeId: tradeId ? tradeId : "HVAC",
      ServiceDate: moment(date.current).format("MM/DD/YYYY"),
      IsNext: "true",
    };
    return WebService.postAPI({
      action: `SDCallBudget/GetCallBudgetByZone`,
      body: obj,
    })
      .then((res: any) => {
        setCallBudget(res);
        setShowLoader(false);
      })
      .catch((error) => {
        setShowLoader(false);
        return error;
      });
  };

  const selectTrade = (e: any) => {
    setTradeId(e);
    setShowLoader(true);
    date.current = moment(date.current).add(0, "d").toDate();
    const obj = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      Zone: zoneId ? zoneId : "MS",
      SDTechTradeId: e,
      ServiceDate: moment(date.current).format("MM/DD/YYYY"),
      IsNext: "true",
    };
    return WebService.postAPI({
      action: `SDCallBudget/GetCallBudgetByZoneAndTrade`,
      body: obj,
    })
      .then((res: any) => {
        setCallBudget(res);
        setShowLoader(false);
      })
      .catch((error) => {
        setShowLoader(false);
        return error;
      });
  };

  return (
    <Offcanvas
      show={props.isShow}
      onHide={onCloseModal}
      placement={"end"}
      className="offcanvas-large"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Call Budget</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
        <div className="call-buget-modal form-style mx-0 p-1">
          <div className="modal-body px-3 mt-4">
            <div className=" row mb-3 ">
              <div className="col-4">
                <Form.Check
                  type="radio"
                  label="By Zone"
                  name="ZONE"
                  checked={zone}
                  onChange={() => onCheck("ZONE")}
                />
              </div>
              <div className="col-4">
                <Form.Check
                  type="radio"
                  label="By Zone|Trade"
                  name="ZONE_TRADE"
                  checked={zoneTrade}
                  onChange={() => onCheck("ZONE_TRADE")}
                  className="checkbox"
                  disabled={props.isTaskCode == true ? false : true}
                />
              </div>
              <div className="col-4">
                <Form.Check
                  type="radio"
                  label="By Zone [Service / Maintainance]"
                  name="ZONE_SERVICE_MAINTAINANCE"
                  checked={zoneServiceMaintainance}
                  onChange={() => onCheck("ZONE_SERVICE_MAINTAINANCE")}
                />
              </div>
            </div>
            <div className=" row">
              <div className="col-6">
                <Label title="Zone" showStar={true} />
                <SawinSelect
                  options={zoneList}
                  disValue="BreakName"
                  value="BreakCode"
                  onChange={(data: any) => selectZone(data.id)}
                />
              </div>
              <div className="col-6">
                <Label title="Trade" />
                <SawinSelect
                  options={trades}
                  disValue="BreakName"
                  value="BreakCode"
                  onChange={(data: any) => selectTrade(data.id)}
                  isDisable={zone == true ? true : false}
                />
              </div>
            </div>

            <div className="row mt-4">
              <b className="col-8 text-dark" style={{ fontSize: 13 }}>
                Please select task code to view call budget by Zone | Trade
              </b>
              <div
                className="col-4 d-flex text-dark"
                style={{ textAlign: right, fontSize: 12 }}
              >
                <span className="col-8"> View Next / Prev Week</span>
                <div
                  className="col-2 m-0 p-0 cursor-pointer"
                  onClick={() => getCallBudget(-7)}
                >
                  {" "}
                  <img
                    src={leftIcon}
                    id="img_downarrow"
                    height={20}
                    className="icon-dark-light "
                    alt="downarrow"
                    style={{ marginLeft: "8px" }}
                  />
                </div>
                <div
                  className="col-2 cursor-pointer"
                  onClick={() => getCallBudget(7)}
                >
                  <img
                    src={RightIcon}
                    id="img_downarrow"
                    height={20}
                    className="icon-dark-light"
                    alt="downarrow"
                  />
                </div>
              </div>
            </div>

            {ShowLoader === true ? (
              <div className="">
                <div></div>
                <div style={{ textAlign: "center", marginTop: "10%" }}>
                  <img
                    style={{ position: "relative" }}
                    src={loader}
                    alt="No loader found"
                  />
                  <div style={{ position: "relative", color: "white" }}>
                    Loading...
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-1 mt-2">
                <div className="table-responsive">
                  <div className="dataTables_wrapper dt-bootstrap4">
                    <table
                      className="call-bugest-table"
                      role="grid"
                      aria-describedby="example_info"
                    >
                      <thead>
                        <tr>
                          <th style={{ verticalAlign: "middle" }} rowSpan={2}>
                            <label>Time Slot</label>
                          </th>
                          <th colSpan={9}>Service Date</th>
                        </tr>
                        <tr>
                          {callBudget.map((res, i) => {
                            return (
                              <th key={"service_date" + i}>
                                {moment(res.ServiceDate).format("ddd, MMM DD")}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {callBudget.map((res, i) => {
                          return res.CallBudgetCountPerTimePromisedCode[i] ? (
                            <tr key={"service_data" + i}>
                              <td>
                                {res.CallBudgetCountPerTimePromisedCode[i]
                                  .TimePromisedCode +
                                  " " +
                                  res.CallBudgetCountPerTimePromisedCode[i]
                                    .TimePromisedCodeDescription}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[0]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[1]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[2]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[3]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[4]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                              <td>
                                {" "}
                                {getGridData(
                                  callBudget[5]
                                    .CallBudgetCountPerTimePromisedCode[i]
                                )}
                              </td>
                            </tr>
                          ) : (
                            ""
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="offcanvas-footer mt-4 position-absolute">
            <Button
              variant="primary"
              className="btn-brand-outline"
              type="button"
              onClick={onCloseModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddCallBudgetModal;
