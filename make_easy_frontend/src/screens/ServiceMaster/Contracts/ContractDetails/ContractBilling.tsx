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
import HelperService from "../../../../utility/HelperService";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import Loader from "../../../../components/Loader/Loader";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import {
  SET_WORK_ORDER_ID, setDataInRedux, SET_IS_REFRESH
} from "../../../../action/CommonAction";
import CreateMaintenanceBilling from "../AddContract/CreateMaintenanceBilling";

const componentKey = "RegulatBillingEntry";

const headers: GridHeader[] = [
  {
    title: "#",
    class: "text-end"
  },
  {
    title: "Interval",
    isShow: true,

  },
  {
    title: "Due Date",
    isShow: true,
    class: "text-center"

  },
  {
    title: "Invoice #",
    class: "text-end"
  },
  {
    title: "Batch #",
    class: "text-end"
  },
  {
    title: "Bill Amount",
    class: "text-end"
  },

  {
    title: "Actions",
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
        title: "Option 1",
        value: "option ",
      },
      {
        title: "Option 2",
        value: "option",
      },
      {
        title: "Option 3",
        value: "option",
      },


    ],
  }
];

interface PropData {
  data: any;
  activeTab: any;
}

const ContractBilling = (props: PropData) => {
  const navigate = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  let rowCompute = useRef<GridRow[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ShowLoader, setShowLoader] = useState(false);
  const [isShowMaintenanceSchedule, setShowMaintenanceSchedule] = useState(false);
  const editData = useRef<any>({})
  const Index = useRef<any>(0)
  let invoice: any = "";
  let dueDate: any = "";
  let billAmount: any = "";
  let BatchNum: any = "";

  useEffect(() => {
    if (props.data && props?.activeTab == "TabRegularBillingt") {
      props.data?.RegularBillingGridData.length > 0 && listContractBilling(props.data?.RegularBillingGridData)
    }
  }, [props.data, props.activeTab]);

  const listContractBilling = (res: any) => {
    setShowLoader(true)
    let rows: GridRow[] = [];
    var array = [];
    for (var i in res) {
      let columns: GridColumn[] = [];
      columns.push({ value: res[i].BillSeqNum });
      columns.push({ value: `${res[i].Interval} ${res[i].BillMonthlyOrWeekly}` });
      columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDate(res[i].ScheduleDate) });
      columns.push({ value: res[i].InvoiceOrJournalNum ? onInvoice(res[i]) : "-" });
      columns.push({ value: res[i].BatchNum ? res[i].BatchNum : "-" });
      columns.push({ value: res[i].BillAmount ? HelperService.getCurrencyFormatter(res[i].BillAmount) : "0.00" });
      columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
      rows.push({ data: columns });
      array.push(res[i])
    }
    rowCompute.current = rows
    setRows(rows);
    setShowLoader(false)
  }

  const onInvoice = (value: any) => {
    return <a className="grid-hypper-link" onClick={() => onNavaigteInvoice(value)}>
      {value.InvoiceOrJournalNum}
    </a>
  }

  const onNavaigteInvoice = (e: any) => {
    dispatch(
      setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.InvoiceOrJournalNum, page: window.location.pathname, SMId: data.sd_master?.Id } })
    );
    navigate(`/invoice-entry`)
  }

  const actionList = (value: number, type: string, data: object) => {
    return (
      <div className="action-ele action-btns">
        {type === "ACTION" ? (
          <div>
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

  const onEdit = (index: number, data: any) => {
    Index.current = index
    editData.current = data;
    data.InvoiceOrJournalNum && (invoice = data.InvoiceOrJournalNum);
    data.ScheduleDate && (dueDate = data.ScheduleDate);
    data.BatchNum && (BatchNum = data.BatchNum);
    data.BillAmount && (billAmount = data.BillAmount);

    let columns: GridColumn[] = [];
    {
      columns.push({ value: rowCompute.current[index].data[0].value });
      columns.push({ value: rowCompute.current[index].data[1].value });
      columns.push({ value: datePicker() });
      columns.push({ value: addInput("invoice") });
      columns.push({ value: addInput("Batch") });
      columns.push({ value: addInput("bill") });
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
            defaultValue={invoice}
            onChange={(e) => (invoice = e.target.value)}
            placeholder="Invoice"
          />
        </div>
      );
    } else if (e == "Batch") {
      return (
        <div className="form-style">
          <input
            type="text"
            className="form-control"
            defaultValue={BatchNum}
            onChange={(e) => (BatchNum = e.target.value)}
            placeholder="Batch"
          />
        </div>
      );
    } else if (e == "bill") {
      return (
        <div className="form-style">
          <input
            type="text"
            className="form-control"
            defaultValue={billAmount}
            onKeyPress={(e) => { HelperService.allowOnlyNumericValue(e) }}
            onChange={(e) => (billAmount = e.target.value)}
            placeholder="0.00"
          />
        </div>
      );
    }

  };

  const datePicker = () => {
    return (
      <SawinDatePicker
        selected={dueDate ? dueDate : new Date()}
        onChange={(data: any) => dueDate = data}
      />
    )
  }

  const onSave = (index: number) => {
    var data: any[] = props.data?.RegularBillingGridData;
    data[index].InvoiceOrJournalNum = invoice;
    data[index].ScheduleDate = dueDate;
    data[index].BatchNum = BatchNum;
    data[index].BillAmount = billAmount;
    data[index].IsRegularBilling = true;
    data[index].IsUpdated = true;
    handleContractBilling(data)
  };

  const handleContractBilling = (data: any) => {
    var uniqueInvoiceNum: any = [];
    var repeatedInvoiceNum: any = [];
    data.map((item: any) => {
      if (!item.InvoiceOrJournalNum) {
        return item
      }
      if (uniqueInvoiceNum.indexOf(item.InvoiceOrJournalNum) > -1) {
        repeatedInvoiceNum.push(item.InvoiceOrJournalNum)
      } else {
        uniqueInvoiceNum.push(item.InvoiceOrJournalNum)
      }
    })

    if (repeatedInvoiceNum.length) {
      setErrorMessage(`The specified Invoice Numbers ${repeatedInvoiceNum[0]} are attached to other Maintenance Schedule.`)
      setAlertModel(true)
    } else {
      setLoading(true);
      WebService.postAPI({
        action: `SaiSDContractBilling/UpdateContractBilling`,
        body: data,
      })
        .then((res) => {
          toast.success("Billing schedule updated successfully.");
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
    }
  }

  const onRemove = () => {
    setRows(rowCompute.current);
  };

  const onDelete = (data: any, value: any) => {
    setShowDeleteModal(true);
    setDeletedData({ data: data, index: value });
  };

  const onDeleteContractBilling = () => {
    setShowDeleteModal(false);
    var data: any[] = props.data?.RegularBillingGridData;
    data[deletedData.index].IsUpdated = true;
    data[deletedData.index].IsDeleted = true;
    handleContractBilling(data)
  };

  const onCloseMaintenanceSchedule = (value:any ,type: any) => {
    setShowMaintenanceSchedule(false)
    type == "Add" && dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
  };

  return <>
    <DraggableModal
      isOpen={showAlertModel}
      onClose={() => setAlertModel(false)}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage}
    />
    <Loader show={isLoading} />
    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeleteContractBilling}
    />

    <CreateMaintenanceBilling
      isShow={isShowMaintenanceSchedule}
      onClose={onCloseMaintenanceSchedule}
      data={props.data}
    />

    <div className="text-end mt-2">
      <Button variant="light" className="btn-brand-light  mb-2" type="button" onClick={() => setShowMaintenanceSchedule(true)}>
        + Create
      </Button>
    </div>

    <div className=" ">
      <Grid
        // filters={filters}
        // dateFilter={dateFilter}
        ShowLoader={ShowLoader}
        headers={gridHeader}
        rows={rows}
        errorMessage={'No Billing Found'}
        // hoverRow={true}
        storeKey={componentKey}
      // isColumn={true}
      // onClickRow={true}
      />
    </div>
  </>;
};

export default ContractBilling;


