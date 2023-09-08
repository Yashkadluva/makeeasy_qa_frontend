import { useState, useEffect, useRef } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import CreateSchedule from './CreateSchedule'
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../../components/Grid/Grid";
import CreateMaintenanceSchedule from "../AddContract/CreateMaintenanceSchedule";
import AddContractBilling from "../AddContract/AddContractBilling";
import HelperService from "../../../../utility/HelperService";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import callIcon from "../../../../assets/images/BookCall-icon.svg";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import {
  SET_WORK_ORDER_ID, setDataInRedux, SET_IS_REFRESH, SET_ACTIVE_TAB, SET_CONTRACT_DATA
} from "../../../../action/CommonAction";


const componentKey = "MaintenanceSchEntry";

const headers: GridHeader[] = [
  {
    title: "Interval",
    sortingKey: 'ContractNum',
  },
  {
    title: "Task #",
    isShow: true,

  },
  {
    title: "Due Date",
    isShow: true,
    class: "text-center"

  },
  {
    title: "Complete Date",
    class: "text-center"
  },
  {
    title: "Invoice Date",
    class: "text-center"
  },
  {
    title: "Invoice",
    class: "text-end"
  },
  {
    title: "Maintenance $",
    class: "text-end"
  },
  {
    title: "Maintenance Done",
    class: "text-center"
  },

  {
    title: "Actions",
    isFilter: false,
    isSorting: false,
    class: "freeze-column text-center",
    isFreeze: true,
  }
];

const dateFilter: FilterOption[] = [
  {
    title: "Start Date",
    value: "StartDate",
  },
  {
    title: "Expiry Date",
    value: "ExpiryDate",
  },
];

const filters: Filter[] = [
  {
    title: "Contract Type",
    key: "ContractServiceType",
    child: [
      {
        title: "CRPM",
        value: "CRPM",
      },
      {
        title: "CPM",
        value: "CPM",
      },
      {
        title: "Dispatch",
        value: "D",
      },
      {
        title: "RRPM",
        value: "RRPM",
      },
      {
        title: "RPM",
        value: "RPM",
      },
      {
        title: "CPU-Check",
        value: "CPU-Check",
      },
      {
        title: "CRPM",
        value: "CRPM",
      },

    ],
  },
  {
    title: "Status",
    key: "Status",
    child: [
      {
        title: "Active",
        value: "Active",
      },
      {
        title: "Cancelled",
        value: "Cancelled",
      },
      {
        title: "Expired",
        value: "Expired",
      },
      {
        title: "Renewed",
        value: "Renewed",
      },
      {
        title: "New",
        value: "New",
      },
    ],
  },
];

interface PropData {
  data: any;
  activeTab: any;
}

const ContractMaintenanceSchedule = (props: PropData) => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [isShowMaintenanceSchedule, setShowMaintenanceSchedule] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  const rowCompute = useRef<any>([])
  const taskOption = useRef<any>([]);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [partDetailsData, setPartDetailsData] = useState<any>({ Inventory: [], nonInventory: [] });


  let isActiveToggle: boolean = false;
  let taskCode: any;
  let dueDate: any;
  let completeDate: any;
  let invoiceDate: any;
  let invoice: any;
  let amount: any;

  const onCloseMaintenanceSchedule = (value: any, type: any) => {
    setShowMaintenanceSchedule(false)
    type == "Add" && dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
  };
  // MaintainanceScheduleGridData

  useEffect(() => {
    if (props.data && props?.activeTab == "TabMaintenanceSchedule") {
      props.data?.MaintainanceScheduleGridData.length > 0 && listMaintenanceSchedule(props.data?.MaintainanceScheduleGridData)
      taskOption.current.length == 0 && getTaskCode()
    }
  }, [props.data, props.activeTab]);

  const listMaintenanceSchedule = (res: any) => {
    setShowLoader(true)
    let rows: GridRow[] = [];
    for (var i in res) {
      let columns: GridColumn[] = [];
      columns.push({ value: `${res[i].Interval} ${res[i].WeeklyOrMonthly}` });
      columns.push({ value: `${res[i].ProblemTaskFunctionCode}.${res[i].ProblemTaskComponentCode}` });
      columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDate(res[i].ScheduleDate) });
      columns.push({ value: res[i].CompleteDate && HelperService.getFormatedDate(res[i].CompleteDate) });
      columns.push({ value: res[i].InvoiceDate && HelperService.getFormatedDate(res[i].InvoiceDate) });
      columns.push({ value: res[i].InvoiceNum ? onInvoice(res[i]) : "-" });
      columns.push({ value: res[i].MaintenanceAmount && HelperService.getCurrencyFormatter(res[i].MaintenanceAmount) });
      columns.push({ value: res[i].MaintenanceDone ? "Yes" : "No" });
      columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
      rows.push({ data: columns });
    }
    rowCompute.current = rows
    setRows(rows);
    setShowLoader(false)
  };

  const onInvoice = (value: any) => {
    return <a className="grid-hypper-link" onClick={() => onNavaigteInvoice(value)}>
      {value.InvoiceNum}
    </a>
  };

  const onNavaigteInvoice = (e: any) => {
    dispatch(
      setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.InvoiceNum, page: window.location.pathname, SMId: data.sd_master?.Id } })
    );
    navigate(`/invoice-entry`)
  };

  const actionList = (value: number, type: string, data: any) => {
    return (
      <div className="action-ele action-btns">
        {type === "ACTION" ? (
          <div>
            {

              <a
                onClick={() => onBookCall(data)}
                className={data.MaintenanceDone ? "disable-option" : "text-dark ms-2 font-18 cursor-pointer"}
              >
                <img src={callIcon} height={20} className="theme-icon-color" />
              </a>
            }

            <a
              onClick={() => onEdit(value, data)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={editicon} height={20} className="theme-icon-color" />
            </a>
            <a
              onClick={() => onDelete(data, value)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={deleteicon} height={25} />
            </a>
          </div>
        ) : (
          <div>
            <a
              onClick={() => onSave(value)}
              className="text-dark ms-3 font-18 cursor-pointer"
            >
              <img src={saveIcon} />
            </a>
            <a
              onClick={() => onRemove()}
              className="text-dark ms-3 font-18 cursor-pointer"
            >
              <img src={cancelIcon} className="theme-icon-color" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const onBookCall = (data: any) => {
    dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "BookService" }));
    dispatch(setDataInRedux({ type: SET_CONTRACT_DATA, value: data }));
    navigate(-1)
  }

  const onEdit = (index: number, data: any) => {
    isActiveToggle = data.MaintenanceDone;
    taskCode = `${data.ProblemTaskFunctionCode}.${data.ProblemTaskComponentCode}`;
    dueDate = data.ScheduleDate;
    completeDate = data.CompleteDate;
    invoiceDate = data.InvoiceDate;
    invoice = data.InvoiceNum;
    amount = data.MaintenanceAmount;

    let columns: GridColumn[] = [];
    {
      columns.push({ value: rowCompute.current[index].data[0].value });
      columns.push({ value: addDropDown() });
      columns.push({ value: datePicker("due") });
      columns.push({ value: datePicker("com") });
      columns.push({ value: datePicker("invoice") });
      columns.push({ value: addInput("invoice") });
      columns.push({ value: addInput("Batch") });
      columns.push({ value: addDrpoDown(data.MaintenanceDone) });
      columns.push({ value: actionList(index, "UPDATE", data) });
    }
    setRows(
      rowCompute.current.map((option: GridRow, i: number) => {
        return i === index ? { data: columns } : option;
      })
    );
  };

  const addInput = (e: any) => {
    if (e == "invoice") {
      return (
        <div className="form-style">
          <input
            type="text"
            className="form-control"
            style={{ width: "110px" }}
            defaultValue={invoice}
            onChange={(e) => (invoice = e.target.value)}
            placeholder="Invoice"
          />
        </div>
      );
    } else if (e == "Batch") {
      return (
        <div className="form-style" style={{ width: "115px" }}>
          <input
            type="text"
            className="form-control"
            defaultValue={amount}
            onChange={(e) => (amount = e.target.value)}
            placeholder="Batch"
          />
        </div>
      );
    }
  };

  const datePicker = (e: any) => {
    if (e == "due") {
      return (
        <div style={{ width: "110px" }}>
          <SawinDatePicker
            selected={dueDate ? dueDate : new Date()}
            onChange={(data: any) => dueDate = data}

          />
        </div>
      )
    } else if (e == "com") {
      return (
        <div style={{ width: "110px" }}>
          <SawinDatePicker
            selected={completeDate}
            onChange={(data: any) => completeDate = data}
          />
        </div>
      )
    } else if (e == "invoice") {
      return (
        <div style={{ width: "110px" }}>
          <SawinDatePicker
            selected={invoiceDate}
            onChange={(data: any) => invoiceDate = data}
          />
        </div>
      )
    }
  };

  const addDropDown = () => {
    return (
      <div style={{ width: "150px" }} className="form-style">
        <SawinSelect
          options={taskOption.current}
          selected={taskCode}
          onChange={(data: any) => {
            taskCode = data.id;
          }
          }
          type={"ARROW"}
        />
      </div>
    )
  };

  const getTaskCode = () => {
    WebService.getAPI({
      action: `SetupSDProblemTaskCode/${user_info["AccountId"]}/${user_info["CompanyId"]}/M`,
    })
      .then((res: any) => {
        let columns: any[] = []
        for (var i in res) {
          columns.push({ value: res[i].Description, id: res[i].text, object: res[i] })
        }
        taskOption.current = columns;
      })
      .catch((e) => { });
  };

  const inventoryOptions: Options[] = [
    { id: true, value: "Yes" },
    { id: false, value: "No" },
  ];

  const addDrpoDown = (e: any) => {
    return (
      <div className="form-style">
      <SawinSelect
        options={inventoryOptions}
        selected={e}
        onChange={(data: any) => isActiveToggle = data.id}
      />
      </div>
    )
  };

  const onSave = (index: any) => {
    var data: any[] = props.data?.MaintainanceScheduleGridData
    let tasks: any = taskCode.split(".");
    data[index].MaintenanceDone = isActiveToggle;
    data[index].ProblemTaskFunctionCode = tasks.length > 0 && tasks[0];
    data[index].ProblemTaskComponentCode = tasks.length > 0 && tasks[1];
    data[index].ScheduleDate = dueDate;
    data[index].CompleteDate = completeDate;
    data[index].InvoiceDate = invoiceDate;
    data[index].InvoiceNum = invoice;
    data[index].MaintenanceAmount = amount;
    data[index].IsUpdated = true;
    handleMaintenanceSchedule(data, index)
  };

  const handleMaintenanceSchedule = (data: any, index: number) => {
    setLoading(true);
    WebService.postAPI({
      action: `SaiSDContractMaintenanceSchedule/ValidateMaintenanceScheduleWorkOrder`,
      body: data,
    })
      .then((res: any) => {
        let temp: any = res.filter((item: any) => {
          return item.HasError && item.WOAlreadyAttached
        });

        if (temp.length == 0) {
          WebService.postAPI({
            action: `SaiSDContractMaintenanceSchedule/ValidateMaintenanceScheduleInvoice`,
            body: data,
          })
            .then((res: any) => {
              let newTemp: any = res.filter((item: any) => {
                return item.HasError && item.InvoiceAlreadyAttached
              });
              if (newTemp.length == 0) {
                WebService.postAPI({
                  action: `SaiSDContractMaintenanceSchedule/UpdateMaintenanceSchedule`,
                  body: data,
                })
                  .then((res: any) => {
                    toast.success("Maintenance Schedule updated successfully.");
                    setLoading(false);
                    dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
                  })
                  .catch((e) => {
                    setLoading(false);
                    if (e.response.data.ErrorDetails.message) {
                      setAlertModel(!showAlertModel);
                      setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                    }
                  });
              } else {
                setLoading(false);
                setAlertModel(true);
                setErrorMessage("The specified Invoice Numbers # Cancelled are attached to other Maintenance Schedule.")
              }
            })
            .catch((e) => {
              setLoading(false);
              if (e.response.data.ErrorDetails.message) {
                setAlertModel(!showAlertModel);
                setErrorMessage(e?.response?.data?.ErrorDetails?.message);
              }
            });
        } else {
          setLoading(false);
          setAlertModel(true);
          setErrorMessage("The specified Invoice Numbers # Cancelled are attached to other Maintenance Schedule.")
        }
      })
      .catch((e) => {
        setLoading(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };

  const onRemove = () => {
    setRows(rowCompute.current);
  };

  const onDelete = (data: any, value: any) => {
    setShowDeleteModal(true);
    setDeletedData({ index: value });
  };

  const onDeleteMaintenanceSchedule = () => {
    setShowDeleteModal(false);
    var data: any[] = props.data?.MaintainanceScheduleGridData;
    data[deletedData.index].IsUpdated = true;
    data[deletedData.index].IsDeleted = true;
    handleMaintenanceSchedule(data, deletedData?.index);
  };

  return <>
    <Loader show={isLoading} />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeleteMaintenanceSchedule}
      data={null}
    />

    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />

    <CreateMaintenanceSchedule
      isShow={isShowMaintenanceSchedule}
      isClose={onCloseMaintenanceSchedule}
      data={props.data}
      partDetaiil={partDetailsData}
    />

    <div className="text-end mt-3">
      <Button variant="light" className="btn-brand-light  mb-2" type="button" onClick={() => setShowMaintenanceSchedule(true)}>
        + Create
      </Button>
    </div>
    <div className="maintenance-Schedule-grid">
      <Grid
        // filters={filters}
        // dateFilter={dateFilter}
        headers={gridHeader}
        rows={rows}
        errorMessage={'No Maintenance Schedule Found'}
        // hoverRow={true}
        ShowLoader={ShowLoader}
        storeKey={componentKey}
      // isColumn={true}
      // onClickRow={true}
      />
    </div>
  </>;
};

export default ContractMaintenanceSchedule;


