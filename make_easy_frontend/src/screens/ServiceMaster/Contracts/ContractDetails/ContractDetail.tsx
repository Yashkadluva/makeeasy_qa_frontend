import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Tabs, Tab } from 'react-bootstrap';
import { Envelope, Telephone, Phone, ArrowUpRight, CheckCircleFill, CircleFill } from 'react-bootstrap-icons';
import ContractDetailLeftCol from './ContractDetailLeftCol';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { WorkOrderIdState } from "../../../../reducer/CommonReducer";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import { RootState } from "../../../../config/Store";
import { Dispatch } from "redux";
import { Button } from "../../../../components/Button/Button";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Grid, { GridHeader, GridRow, GridColumn, Filter } from "../../../../components/Grid/Grid";
import BackComponent from "../../../../components/BackComponent/BackComponent";

const componentKey = "contractDetailEntry";
const headers: GridHeader[] = [
  {
    title: "Contract#"

  },
  {
    title: "Type"

  },
  {
    title: "Start Date"

  },
  {
    title: "End date"

  },
  {
    title: "Amount"

  },
  {
    title: "Action"

  }
];

const ContractDetail = () => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [rows, setRows] = useState<GridRow[]>([]);
  const [ShowLoader, setShowLoader] = useState(false);
  const [pageLoader, setPageLoader] = useState(false);
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  let isActiveToggle: boolean = false;
  let isEdit: boolean;
  let descriptionData: any;
  const [totalCount, setTotalCount] = useState(0);

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
  const filters: Filter[] = [
    {
      title: "Is Active",
      key: "IsActive",
      child: [
        {
          title: "Yes",
          value: "true",
        },
        {
          title: "No",
          value: "false",
        },
      ],
    },
  ];

  return <>
    <Tabs defaultActiveKey="TabGeneralInfo" >
      <Tab
        eventKey="TabProfitability"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/icon-profitability.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            <label className="nav-text">Profitability</label>
          </div>
        }

      >
        <h3>Profitability</h3>
      </Tab>

      <Tab
        eventKey="TabGeneralInfo"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/detail-icon.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">General Info</label>
          </div>
        }
      >
        <h3>General Info</h3>
        </Tab>
      <Tab
        eventKey="TabEquipment"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/equipment-icon.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">Equipment</label>
          </div>
        }
      >
        <h3>Equipment</h3>
        </Tab>

      <Tab
        eventKey="TabRegularBillingt"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/contract-invoices-icon.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">Regular Billing</label>
          </div>
        }
      >
        <h3>Regular Billing</h3>
        </Tab>
      <Tab
        eventKey="TabMaintenanceSchedule"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/icon-maintenance-schedule.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">Maintenance Schedule</label>
          </div>
        }
      >
        <h3>Maintenance Schedule</h3>
        </Tab>

      <Tab
        eventKey="TabReserveAccounting"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/icon-accounting.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">Reserve Accounting</label>
          </div>
        }
      >
        <h3>Reserve Accounting</h3>
        </Tab>
      <Tab
        eventKey="TabDescription"
        title={
          <div className="d-flex flex-column justify-content-center align-items-center">
            <img
              src={
                require("../../../../assets/images/icon-description.svg").default
              }
              className="theme-icon-color"
              height={21}
              width={21}
            />
            {" "}
            <label className="nav-text">Description</label>
          </div>
        }
      >
        <h3>Description</h3>
        </Tab>

    </Tabs>

  </>;
};

export default ContractDetail;


