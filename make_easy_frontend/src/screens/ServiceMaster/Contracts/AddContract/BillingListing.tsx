import { useEffect, useRef, useState } from "react";
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../../components/Grid/Grid";
import HelperService from "../../../../utility/HelperService";
import WebService from "../../../../utility/WebService";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import { Col, Form, Button } from 'react-bootstrap';
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import { useForm } from "react-hook-form";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import { SET_WORK_ORDER_ID, setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import { useNavigate } from "react-router-dom";

interface PropData {
    data?: any;
    activeTab: any;
    changeTab: any;
    onSubmit: any;
    onCloseListing: any;
}

const headers: GridHeader[] = [
    {
        title: "Bill Interval",
        isShow: true,

    },
    {
        title: "Schedule Date",
        class: "text-center"

    },
    {
        title: "Billing",
        class: "text-end"
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
        title: "Amount",
        class: "text-end"
    },
    {
        title: "Renewal Sequence",
        class: "text-end"
    },
    {
        title: "Actions",
        class: "freeze-column text-center",
        isFreeze: true,
        isNotAllowClick: true
    }
];

const BillingListing = (props: PropData) => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
    const [ShowLoader, setShowLoader] = useState(false);
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [rows, setRows] = useState<GridRow[]>([]);
    const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
    const [scheduleListData, setScheduleListData] = useState<any>([]);
    const [maintenanceScheduleData, setMaintenanceScheduleData] = useState<any>(props.data);
    const [selectedRowId, setSelectedRowId] = useState<any>("")
    const { register, handleSubmit, formState: { errors }, watch, setValue, } = useForm();
    const watchAllFields = watch();
    const rowCompute = useRef<any>([])
    const [showBillingDeleteModal, setShowBillingDeleteModal] = useState(false);
    const [deletedBillingIndex, setDeletedBillingIndex] = useState("");
    const [removeSelectedRow, setRemoveSelectedRow] = useState<any>("");
    let invoice: any = "";
    let amount: any = "";
    let batch: any = "";
    let sequenceNum: any = "";
    let dueDate: any = "";
    const totalAmount = useRef<number>(0.00)

    useEffect(() => {
        setMaintenanceScheduleData(props.data)
        listBillingData(props.data);
    }, [props.data]);

    console.log("maintenanceScheduleData",maintenanceScheduleData);

    useEffect(() => {
        if (props.onSubmit) {
            onsubmit()
        }
    }, [props.onSubmit])

    const listBillingData = (res: any) => {
        totalAmount.current = 0.00
        setShowLoader(true)
        let rows: any[] = [];
        for (var i in res) {
            if (!res[i].IsDeleted) {
                let columns: GridColumn[] = [];
                columns.push({ value: `${res[i].Interval} ${res[i].BillMonthlyOrWeekly}` });
                columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDate(res[i].ScheduleDate) });
                columns.push({ value: res[i].BillSeqNum });
                columns.push({ value: res[i].InvoiceOrJournalNum ? onInvoice(res[i]) : "" });
                columns.push({ value: res[i].BatchNum ? res[i].BatchNum : "" });
                columns.push({ value: res[i].BillAmount ? HelperService.getCurrencyFormatter(res[i].BillAmount) : "0.00" });
                columns.push({ value: res[i].RenewalSeqNum });
                columns.push({ value: actionList(Number(i), "ACTION", res[i]) });
                rows.push({ data: columns, SeqNum: res[i].SeqNum });
                totalAmount.current += res[i].BillAmount
            }
        }
        setRows(rows);
        rowCompute.current = rows;
        setShowLoader(false)
    };

    const onInvoice = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteInvoice(value)}>
            {value.InvoiceOrJournalNum}
        </a>
    };

    const onNavaigteInvoice = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.InvoiceOrJournalNum, page: window.location.pathname, SMId: data.sd_master?.Id } })
        );
        navigate(`/invoice-entry`)
    };

    const onsubmit = () => {
        WebService.postAPI({
            action: `SaiSDContractBilling/UpdateContractBilling`,
            body: maintenanceScheduleData
        })
            .then((res) => {
                props.onCloseListing(false)
            })
            .catch((e) => {

            })
    }

    const actionList = (value: number, type: string, data: object) => {
        return (
            <div className="action-ele action-btns">
                {type === "ACTION" ? (
                    <div>
                        <a
                            onClick={() => onEdit(data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={editicon} height={20} className="theme-icon-color" />
                        </a>
                        <a
                            onClick={() => onDelete(data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={deleteicon} height={25} />
                        </a>
                    </div>
                ) : (
                    <div>
                        <a
                            onClick={() => onSave(data)}
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

    const onEdit = (data: any) => {
        var index: any;
        let temp:any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.data ;
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });
        sequenceNum = data.RenewalSeqNum;
        batch = data.BatchNum;
        dueDate = data.ScheduleDate;
        invoice = data.InvoiceOrJournalNum;
        amount = data.BillAmount;

        let columns: GridColumn[] = [];
        {
            columns.push({ value: rowCompute.current[index].data[0].value });
            columns.push({ value: datePicker() });
            columns.push({ value: rowCompute.current[index].data[2].value });
            columns.push({ value: addInputSchedule("invoice") });
            columns.push({ value: addInputSchedule("Batch") });
            columns.push({ value: addInputSchedule("amount") });
            columns.push({ value: addInputSchedule("seq") });
            columns.push({ value: actionList(index, "UPDATE", data) });
        }
        setRows(
            rowCompute.current.map((option: GridRow, i: number) => {
                return i === index ? { data: columns } : option;
            })
        );
    };

    const onSave = (data: any) => {
        var index: any;
        let temp:any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.data ;
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });
        temp[index].ScheduleDate = dueDate;
        temp[index].InvoiceOrJournalNum = invoice;
        temp[index].BillAmount = amount;
        temp[index].BatchNum = batch;
        temp[index].RenewalSeqNum = sequenceNum;
        temp[index].IsUpdated = true;
        setMaintenanceScheduleData([...temp]);
        listBillingData(temp)
    };

    const addInputSchedule = (e: any) => {
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
        } else if (e == "amount") {
            return (
                <div className="form-style">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={amount && HelperService.getCurrencyFormatter(amount)}
                        onChange={(e) => (amount = e.target.value)}
                        onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                        placeholder="Amount"
                    />
                </div>
            );
        } else if (e == "Batch") {
            return (
                <div className="form-style">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={batch}
                        onChange={(e) => (batch = e.target.value)}
                        placeholder="Batch"
                    />
                </div>
            );
        } else if (e == "seq") {
            return (
                <div className="form-style">
                    <input
                        type="text"
                        className="form-control"
                        defaultValue={sequenceNum}
                        onChange={(e) => (sequenceNum = e.target.value)}
                        onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                        placeholder=""
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
    };

    const onChangeDescription = (data: any) => {
        scheduleListData[0].BillingDescription = data;
        setScheduleListData([...scheduleListData])
        setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
            if (item.Id == scheduleListData[0].Id) {
                item.BillingDescription = data;
                return { ...item }
            } else {
                return item
            }
        }))
    }

    const selectedRow = (index: any, data: any) => {
        var index: any;
        maintenanceScheduleData.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind;
            }
        });
        maintenanceScheduleData[index].IsUpdated = true;
        setSelectedRowId(maintenanceScheduleData[index].Id)
        setScheduleListData([maintenanceScheduleData[index]])
        setMaintenanceScheduleData([...maintenanceScheduleData])
    };

    const closeModal = (value: any, type: any, data: any) => {
        if (type === "ON_SAVE") {
            scheduleListData[0].BillingDescription = `${scheduleListData[0].BillingDescription} ${data}`;
            setScheduleListData([...scheduleListData])
        }
        setShowStatndardDescriptionModel(value);
    };

    const onConfirmDeleteBilling = () => {
        setShowBillingDeleteModal(false)
        let temp: any[] = maintenanceScheduleData.map((item: any, index: any) => {
            if (index == deletedBillingIndex) {
                item.IsDeleted = true;
                item.IsUpdated = true;
                return { ...item }
            } else {
                return item
            }
        });
        setMaintenanceScheduleData(temp)
        listBillingData(temp);
        setRemoveSelectedRow(new Date().getTime());
        setScheduleListData([])
    };

    const onDelete = (data: any) => {
        let temp:any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.data ;
        var index: any;
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });
        setDeletedBillingIndex(index)
        setShowBillingDeleteModal(true)
    };

    const onRemove = () => {
        setRows(rowCompute.current);
    };

    const style = {
        "background": "#D9D9D9",
        "border-radius": "5px",
        "padding":"5px",
    }


    return (
        <>
            {
                showBillingDeleteModal &&
                <DraggableModal
                    isOpen={showBillingDeleteModal}
                    onClose={() => setShowBillingDeleteModal(false)}
                    title="Alert"
                    type="DELETE_MODAL"
                    width={600}
                    delete={onConfirmDeleteBilling}
                    data={null}
                />
            }
            {
                showStatndardDescriptionModel &&
                <StandardDescriptionModal
                    isShow={showStatndardDescriptionModel}
                    isClose={closeModal}
                    title="Standard Descriptions"
                    Contract={true}
                />
            }
            <div className=" ">
                <Grid
                    ShowLoader={ShowLoader}
                    headers={gridHeader}
                    rows={rows}
                    hoverRow={true}
                    errorMessage={'No Billing Found'}
                    onClickRow={true}
                    isSelectedRow={selectedRow}
                    unselectRow={removeSelectedRow}
                />
                <div className="d-flex justify-content-between mt-4" style={style}>
                    <Form.Label className="font-w-medium">Total  Records <span className="ms-1 font-w-regular">{rows.length}</span></Form.Label>
                    <Form.Label className="font-w-medium">Remaining <span className="ms-1 font-w-regular">0</span></Form.Label>
                    <Form.Label className="font-w-medium">Total Amount <span className="ms-1 font-w-regular">{totalAmount.current && HelperService.getCurrencyFormatter(totalAmount.current)}</span></Form.Label>
                    <Form.Label className="font-w-medium">Amount Remaining To Bill <span className="ms-1 font-w-regular">0.00</span></Form.Label>
                </div>
                {
                    scheduleListData.length > 0 &&
                    <Col md={12} className="mt-3 form-style">
                        <div className="d-flex justify-content-between">
                            <Form.Label className="text-dark">Description xx</Form.Label>
                            <Button variant="light" className="btn-brand-light mb-2"
                                onClick={() => setShowStatndardDescriptionModel(true)} >Standard Billing Description</Button>
                        </div>
                        <Form.Control value={scheduleListData[0].BillingDescription} as="textarea" rows={3} className="h-auto" onChange={(e) => { onChangeDescription(e.target.value) }} />
                    </Col>
                }
            </div>
        </>
    )
}

export default BillingListing;