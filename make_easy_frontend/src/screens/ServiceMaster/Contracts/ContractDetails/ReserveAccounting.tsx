import { useState, useEffect } from "react";
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
import HelperService from "../../../../utility/HelperService";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import callIcon from "../../../../assets/images/BookCall-icon.svg";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import {
    SET_WORK_ORDER_ID, setDataInRedux
} from "../../../../action/CommonAction";

const componentKey = "MaintenanceSchEntry";

const headers: GridHeader[] = [
    {
        title: "Interval",
    },
    {
        title: "Due Date",
        class:"text-center"
    },
    {
        title: "Billing Seq#",
        class:"text-end"
    },
    {
        title: " Invoice #",
    },
    {
        title: "Batch #",
    },
    {
        title: "Bill Amount",
        class:"text-end"
    },
    {
        title: "Renewal Seq#",
        class:"text-end"
    },
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

const ReserveAccounting = (props: PropData) => {
    const dispatch: Dispatch<any> = useDispatch();
    const navigate = useNavigate();
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [rows, setRows] = useState<GridRow[]>([]);

    const [ShowLoader, setShowLoader] = useState(false);


    console.log(props.data);
    // MaintainanceScheduleGridData

    useEffect(() => {
        if (props.data && props?.activeTab == "TabReserveAccounting") {
            props.data?.ReserveAccountingGridData.length > 0 && listReserveAccounting(props.data?.ReserveAccountingGridData)
        }
    }, [props.data, props.activeTab]);

    const listReserveAccounting = (res: any) => {
        setShowLoader(true)
        let rows: GridRow[] = [];
        for (var i in res) {
            let columns: GridColumn[] = [];
            columns.push({ value: `${res[i].Interval} ${res[i].BillMonthlyOrWeekly}` });
            columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDate(res[i].ScheduleDate) });
            columns.push({ value: res[i].BillSeqNum });
            columns.push({ value: res[i].InvoiceOrJournalNum ? onInvoice(res[i]) : "-" });
            columns.push({ value: res[i].BatchNum });
            columns.push({ value: res[i].BillAmount && HelperService.getCurrencyFormatter(res[i].BillAmount) });
            columns.push({ value: res[i].RenewalSeqNum });
            // columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
            rows.push({ data: columns });
        }
        setRows(rows);
        setShowLoader(false)
    };

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
                            // onClick={() => onEdit(value, data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={callIcon} height={20} className="theme-icon-color" />
                        </a>
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
                            onClick={() => onSave()}
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
        // Index.current = index
        // editData.current = data;
        // data.InvoiceOrJournalNum && (invoice = data.InvoiceOrJournalNum);
        // data.ScheduleDate && (dueDate = data.ScheduleDate);
        // data.BatchNum && (BatchNum = data.BatchNum);
        // data.BillAmount && (billAmount = data.BillAmount);

        // let columns: GridColumn[] = [];
        // {
        //   columns.push({ value: rowCompute.current[index].data[0].value });
        //   columns.push({ value: rowCompute.current[index].data[1].value });
        //   columns.push({ value: datePicker() });
        //   columns.push({ value: addInput("invoice") });
        //   columns.push({ value: addInput("Batch") });
        //   columns.push({ value: addInput("bill") });
        //   columns.push({ value: actionList(index, "UPDATE", data) });
        // }
        // setRows(
        //   rowCompute.current.map((option: GridRow, i: number) => {
        //     return i === index ? { data: columns } : option;
        //   })
        // );
    };

    const addInput = (e: any) => {
        // if (e == "invoice") {
        //   return (
        //     <div className="form-style">
        //       <input
        //         type="text"
        //         className="form-control"
        //         defaultValue={invoice}
        //         onChange={(e) => (invoice = e.target.value)}
        //         placeholder="Invoice"
        //       />
        //     </div>
        //   );
        // } else if (e == "Batch") {
        //   return (
        //     <div className="form-style">
        //       <input
        //         type="text"
        //         className="form-control"
        //         defaultValue={BatchNum}
        //         onChange={(e) => (BatchNum = e.target.value)}
        //         placeholder="Batch"
        //       />
        //     </div>
        //   );
        // } else if (e == "bill") {
        //   return (
        //     <div className="form-style">
        //       <input
        //         type="text"
        //         className="form-control"
        //         defaultValue={billAmount}
        //         onKeyPress={(e) => { HelperService.allowOnlyNumericValue(e) }}
        //         onChange={(e) => (billAmount = e.target.value)}
        //         placeholder="0.00"
        //       />
        //     </div>
        //   );
        // }

    };

    const datePicker = () => {
        // return (
        //   <SawinDatePicker
        //     selected={dueDate ? dueDate : new Date()}
        //     onChange={(data: any) => dueDate = data}
        //   />
        // )
    }

    const onSave = () => {
        // var data: any[] = [editData.current] 
        // data[0].InvoiceOrJournalNum = invoice;
        // data[0].ScheduleDate = dueDate;
        // data[0].BatchNum = BatchNum;
        // data[0].BillAmount = billAmount; 
        // data[0].IsRegularBilling = true;
        // data[0].IsUpdated = true;
        // setLoading(true);
        // WebService.postAPI({
        //   action: `SaiSDContractBilling/UpdateContractBilling`,
        //   body: data,
        // })
        //   .then((res) => {
        //     toast.success("Billing schedule updated successfully.");
        //     setLoading(false);
        //     var temp:any = props.data?.RegularBillingGridData;
        //     temp[Index.current] = data[0];
        //     listContractBilling(temp);
        //     Index.current = 0;
        //     editData.current = {};
        //   })
        //   .catch((e) => {
        //     setLoading(false);
        //     if (e.response.data.ErrorDetails.message) {
        //       setAlertModel(!showAlertModel);
        //       setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        //     }
        //   });

    };

    const onRemove = () => {
        // setRows(rowCompute.current);
    };

    const onDelete = (data: any, value: any) => {
        // setShowDeleteModal(true);
        // var obj = {
        //   id: value,
        // };
        // setDeletedData(obj);
    };

    const onDeleteStandardDescription = () => {
        // setShowDeleteModal(false);
        // setLoading(true);
        // let endPoint = "Problem";
        // WebService.deleteAPI({
        //   action: `StandardDescription/${user_info["AccountId"]}/${user_info["CompanyId"]}/${endPoint}`,
        //   body: null,
        // })
        //   .then((res) => {
        //     // getServiceDescription();
        //   })
        //   .catch((e) => {
        //     setLoading(false);
        //     if (e.response.data.ErrorDetails.message) {
        //       setAlertModel(!showAlertModel);
        //       setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        //     }
        //   });
    };


    return <>
 
        <Grid
            // filters={filters}
            // dateFilter={dateFilter}
            headers={gridHeader}
            rows={rows}
            errorMessage={'No Reserve Accounting Found'}
            // hoverRow={true}
            ShowLoader={ShowLoader}
            storeKey={componentKey}
        // isColumn={true}
        // onClickRow={true}
        />
    </>;
};

export default ReserveAccounting;


