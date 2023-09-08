import { useState, useEffect, useRef } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../../components/Grid/Grid";
import HelperService from "../../../../utility/HelperService";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import { Label } from "../../../../components/Label/Label";
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import ContractAddPart from "../AddContract/ContractAddPart";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import PartsAdvanceSearch from "../../../../components/PartsAdvanceSearch/PartsAdvanceSearch";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import { Dispatch } from "redux";
import { SET_WORK_ORDER_ID, setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";
import ContractAttachEquipment from "./ContractAttachEquipment";

const componentKey = "MaintenanceSchEntry";

const headers1: GridHeader[] = [
    {
        title: "Task #",
        isShow: true,

    },
    {
        title: "Interval",
        // sortingKey: 'ContractNum',
    },
    {
        title: "Line#",
        // sortingKey: 'ContractNum',
    },
    {
        title: "WO#",
        // sortingKey: 'ContractNum',
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
        class: "text-center form-style"
    },

    {
        title: "Actions",
        isFilter: false,
        isSorting: false,
        class: "freeze-column text-center",
        isFreeze: true,
        isNotAllowClick: true
    }
];

const headers: GridHeader[] = [
    {
        title: "Model",
        isShow: true,

    },
    {
        title: "Serial #",
        isShow: true,

    },
    {
        title: "Manufacturer",
    },
    {
        title: "System",
    },
    {
        title: "Location",
    },

    {
        title: "Unit",
    },
    {
        title: "Job #",
    }
];

const headersPart: GridHeader[] = [
    {
        title: "Is Inventory",
        isShow: true,
        class: "text-center"

    },
    {
        title: "Part Number",
        isShow: true,

    },
    {
        title: "Description",
    },
    {
        title: "Quantity",
        class: "text-end"
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
    changeTab: any;
    listData: any;
    onSubmit: any;
    colseBlade: any;
    partDetaiil: any;
};

const MaintenanceScheduleListing = (props: PropData) => {
    const navigate = useNavigate();
    const dispatch: Dispatch<any> = useDispatch();
    const { register, handleSubmit, formState: { errors }, watch, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
    const watchAllFields = watch();
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [partGridHeader, setPartGridHeader] = useState<GridHeader[]>(headersPart);
    const [rows, setRows] = useState<GridRow[]>([]);
    const [rowsSchedule, setRowsSchedule] = useState<GridRow[]>([]);
    const [rowsPart, setRowsPart] = useState<GridRow[]>([]);
    const partRowCompute = useRef<GridRow[]>([]);
    const [scheduleData, setScheduleData] = useState<any>({})
    const taskOptions = useRef<any[]>([])
    const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);
    const [descriptionData, setDescriptionData] = useState("");
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [ShowLoader, setShowLoader] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showAlertModel, setAlertModel] = useState(false);
    const [showAddPartModal, setshowAddPartModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [partDetailsData, setPartDetailsData] = useState<any>([]);
    const [maintenanceScheduleData, setMaintenanceScheduleData] = useState<any>(props.listData);
    const [scheduleListData, setScheduleListData] = useState<any>([]);
    const [showAttachEquipmentModal, setshowAttachEquipmentModal] = useState(false);
    const [selectedRowId, setSelectedRowId] = useState<any>("")
    const [removeSelectedRow, setRemoveSelectedRow] = useState<any>("");
    const [showPartDeleteModal, setShowPartDeleteModal] = useState(false)
    const [showScheduleDeleteModal, setShowScheduleDeleteModal] = useState(false);
    const [deletedPartIndex, setDeletedPartIndex] = useState("");
    const [deletedScheduleIndex, setDeletedScheduleIndex] = useState("");
    let partNum: any = "";
    let isInventory: any = false;
    let description: any = "";
    let quantity: any = 1;
    let partData = useRef<any>([])
    const rowCompute = useRef<any>([])
    const editPartData = useRef<any>([])
    const rowId = useRef<any>("")
    let isActiveToggle: boolean = false;
    let taskCode: any;
    let dueDate: any;
    let completeDate: any;
    let invoiceDate: any;
    let invoice: any;
    let amount: any;
    //////

    useEffect(() => {
        setPartDetailsData(props.partDetaiil)
    }, [props.partDetaiil]);

    const getUniqueId = () => {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    useEffect(() => {
        if (props.activeTab == "Tablisting") {
            taskOptions.current.length == 0 && getTaskCode()
            setScheduleData(props.data)
            listMaintenanceSchedule(props.listData);
        } else {
            partRowCompute.current = []
            setScheduleListData([]);
            setRemoveSelectedRow(new Date().getTime())
        }
    }, [props.activeTab]);


    useEffect(() => {
        listMaintenanceSchedule(props.listData);
        setMaintenanceScheduleData(props.listData);
    }, [props.listData]);

    useEffect(() => {
        if (props.onSubmit !== "") {
            handleMaintenanceSchedule(maintenanceScheduleData)
        }
    }, [props.onSubmit]);

    const listEquipments = (res: any) => {
        setShowLoader(true);
        let rows: GridRow[] = [];
        var array = [];
        for (var i in res) {
            let columns: GridColumn[] = [];
            columns.push({ value: res[i].EqpManufacturer });
            columns.push({ value: res[i].EqpModel });
            columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
            columns.push({ value: res[i].SerialNo });
            columns.push({ value: res[i].Location });
            columns.push({ value: res[i].System });
            columns.push({ value: res[i].Unit });
            rows.push({ data: columns });
            array.push(res[i])
        }
        setShowLoader(false);
        setRows(rows);
    };

    const listParts = (res: any) => {
        setShowLoader(true);
        let rows: any[] = [];
        for (var i in res) {
            if (!res[i].IsDeleted) {
                let columns: GridColumn[] = [];
                columns.push({ value: checkBox(res[i].IsInventory) });
                columns.push({ value: res[i].PartNum });
                columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
                columns.push({ value: res[i].Quantity });
                columns.push({
                    value: actionList(Number(i), "ACTION", res[i]),
                    type: "COMPONENT",
                });
                columns.push({ value: res[i].Unit });
                rows.push({ data: columns });
            }
        }
        setShowLoader(false);
        partRowCompute.current = rows
        setRowsPart(rows);
    };

    const listMaintenanceSchedule = (res: any) => {
        setShowLoader(true)
        let rows: any[] = [];
        for (var i in res) {
            if (!res[i].IsDeleted) {
                let columns: GridColumn[] = [];
                columns.push({ value: `${res[i].ProblemTaskFunctionCode}.${res[i].ProblemTaskComponentCode}` });
                columns.push({ value: `${res[i].Interval} ${res[i].WeeklyOrMonthly}` });
                columns.push({ value: res[i].BillingDetailLineNo });
                columns.push({ value: res[i].SDCallMasterId ? onCallInfo(res[i]) : "-" });
                columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDate(res[i].ScheduleDate) });
                columns.push({ value: res[i].CompleteDate && HelperService.getFormatedDate(res[i].CompleteDate) });
                columns.push({ value: res[i].InvoiceDate && HelperService.getFormatedDate(res[i].InvoiceDate) });
                columns.push({ value: res[i].InvoiceNum ? onInvoice(res[i]) : "-" });
                columns.push({ value: res[i].MaintenanceAmount && HelperService.getCurrencyFormatter(res[i].MaintenanceAmount) });
                columns.push({ value: res[i].MaintenanceDone ? "Yes" : "No" });
                columns.push({ value: scheduleActionList(Number(i), "ACTION", res[i]) });
                rows.push({ data: columns, SeqNum: res[i].SeqNum });
            }
        }
        rowCompute.current = rows
        setRowsSchedule(rows);
        setShowLoader(false)
    };

    const onCallInfo = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteCallInfo(value)}>
            {value.SDCallMasterId}
        </a>
    };

    const onNavaigteCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.SDCallMasterId, page: window.location.pathname, SMId: data.sd_master?.Id } })
        );
        navigate(`/invoice-entry`)
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

    const scheduleActionList = (value: number, type: string, data: any) => {
        return (
            <div className="action-ele action-btns">
                {type === "ACTION" ? (
                    <div>
                        <a
                            onClick={() => onEditSchedule(value, data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={editicon} height={20} className="theme-icon-color" />
                        </a>
                        <a
                            onClick={() => onDeleteSchedule(data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={deleteicon} height={25} />
                        </a>
                    </div>
                ) : (
                    <div>
                        <a
                            onClick={() => onSaveSchedule(value, data)}
                            className="text-dark ms-3 font-18 cursor-pointer"
                        >
                            <img src={saveIcon} />
                        </a>
                        <a
                            onClick={() => onRemoveSchedule()}
                            className="text-dark ms-3 font-18 cursor-pointer"
                        >
                            <img src={cancelIcon} className="theme-icon-color" />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    const onDeleteSchedule = (data: any) => {
        var index: any;
        let temp: any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.listData
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });
        setDeletedScheduleIndex(index)
        setShowScheduleDeleteModal(true)
    };

    const onEditSchedule = (inde: any, data: any) => {
        let temp: any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.listData
        var index: any;
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });

        isActiveToggle = data.MaintenanceDone;
        taskCode = `${data.ProblemTaskFunctionCode}.${data.ProblemTaskComponentCode}`;
        dueDate = data.ScheduleDate;
        completeDate = data.CompleteDate;
        invoiceDate = data.InvoiceDate;
        invoice = data.InvoiceNum;
        amount = data.MaintenanceAmount;

        let columns: GridColumn[] = [];
        {
            columns.push({ value: addDropDown() });
            columns.push({ value: rowCompute.current[index].data[1].value });
            columns.push({ value: rowCompute.current[index].data[2].value });
            columns.push({ value: rowCompute.current[index].data[3].value });
            columns.push({ value: datePicker("due") });
            columns.push({ value: datePicker("com") });
            columns.push({ value: datePicker("invoice") });
            columns.push({ value: addInputSchedule("invoice") });
            columns.push({ value: addInputSchedule("Batch") });
            columns.push({ value: addToggleButton() });
            columns.push({ value: scheduleActionList(index, "UPDATE", data) });
        }
        setRowsSchedule(
            rowCompute.current.map((option: GridRow, i: number) => {
                return i === index ? { data: columns } : option;
            })
        );
    };

    const onSaveSchedule = (inde: any, data: any) => {
        let temp: any = maintenanceScheduleData.length > 0 ? maintenanceScheduleData : props.listData
        var index: any;
        temp.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                index = ind
            }
        });

        let tasks: any = taskCode.split(".");
        temp[index].ProblemTaskFunctionCode = tasks.length > 0 && tasks[0];
        temp[index].ProblemTaskComponentCode = tasks.length > 0 && tasks[1];
        temp[index].MaintenanceDone = isActiveToggle;
        temp[index].ScheduleDate = dueDate;
        temp[index].CompleteDate = completeDate;
        temp[index].InvoiceDate = invoiceDate;
        temp[index].InvoiceNum = invoice;
        temp[index].MaintenanceAmount = amount;
        temp[index].IsUpdated = true;
        setMaintenanceScheduleData([...temp]);
        listMaintenanceSchedule(temp)
    };

    const onRemoveSchedule = () => {
        setRowsSchedule(rowCompute.current);
    };

    const addInputSchedule = (e: any) => {
        if (e == "invoice") {
            return (
                <div className="form-style" style={{width: "110px"}}>
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
                        defaultValue={amount && HelperService.getCurrencyFormatter(amount)}
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
                <div style={{width: "110px"}}>
                <SawinDatePicker
                    selected={dueDate ? dueDate : new Date()}
                    onChange={(data: any) => dueDate = data}
                />
                </div>
            )
        } else if (e == "com") {
            return (
                <div style={{width: "110px"}}>
                <SawinDatePicker
                    selected={completeDate}
                    onChange={(data: any) => completeDate = data}
                />
                </div>
            )
        } else if (e == "invoice") {
            return (
                <div style={{width: "110px"}}>
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
            <div className="form-style">
            <SawinSelect
                options={taskOptions.current}
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

    const addToggleButton = () => {
        return (
            <div className="pt-2">
            <ToggleButton
                isChecked={isActiveToggle}
                title=""
                label_id=""
                onChange={(data: any) => isActiveToggle = data}
            />
            </div>
        );
    };

    const handleMaintenanceSchedule = (data: any,) => {
        setLoading(true);
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
                            props.colseBlade(false)
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

    const actionList = (value: number, type: string, data: object) => {
        return (
            <div className="action-ele action-btns">
                {type === "ACTION" ? (
                    <div>
                        <a
                            onClick={() => onEditPart(data)}
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
                            onClick={() => onSavePart()}
                            className="text-dark ms-3 font-18 cursor-pointer "
                        >
                            <img src={saveIcon} />
                        </a>
                        <a
                            onClick={() => onRemove()}
                            className="text-dark ms-3 font-18 cursor-pointer "
                        >
                            <img src={cancelIcon} className="theme-icon-color" />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    const onEditPart = (data: any) => {
        partNum = data.PartNum;
        isInventory = data.IsInventory;
        description = data.Description;
        quantity = data.Quantity;
        maintenanceScheduleData.map((item: any) => {
            if (item.Id == rowId.current) {
                item.SaiSDContractMaintenanceScheduleParts.map((res: any, ind: any) => {
                    if (res.Id == data.Id) {
                        handleEditPart(ind);
                    }
                })
            }
        });

        data.IsUpdated = true;
        editPartData.current = [data]
    };

    const handleEditPart = (index: number) => {
        let columns: GridColumn[] = [];
        {
            columns.push({ value: partRowCompute.current[index].data[0].value });
            columns.push({ value: partSearch(isInventory) });
            columns.push({ value: addInput("desc") });
            columns.push({ value: addInput("qty") });
            columns.push({
                value: actionList(index, "UDATE", data),
                type: "COMPONENT",
            });
        }
        let temp: any = partRowCompute.current.map((option: GridRow, i: number) => {
            return i == index ? { data: columns } : option;
        });
        setRowsPart(temp);
    };

    const onDelete = (data: any) => {
        var index: any;
        maintenanceScheduleData.map((item: any) => {
            if (item.Id == rowId.current) {
                item.SaiSDContractMaintenanceScheduleParts.map((res: any, ind: any) => {
                    if (res.Id == data.Id) {
                        index = ind;
                        return
                    }
                })
            }
        });
        setDeletedPartIndex(index)
        setShowPartDeleteModal(true)
    };

    const onSavePart = () => {
        if (partNum == "") {
            toast.error("Please Enter Part Number")
        } else if (description == "") {
            toast.error("Please Enter Description")
        } else if (quantity == "") {
            toast.error("Please Enter Quantity")
        } else {
            if (editPartData.current.length > 0) {
                editPartData.current[0].PartNum = partNum;
                editPartData.current[0].IsInventory = isInventory;
                editPartData.current[0].Description = description;
                editPartData.current[0].Quantity = quantity;
                partData.current = partData.current.map((item: any) => {
                    if (item.Id == editPartData.current[0].Id) {
                        return editPartData.current[0]
                    } else {
                        return item;
                    }
                })
                editPartData.current = [];
                listParts(partData.current);
                scheduleListData[0].SaiSDContractMaintenanceScheduleParts = partData.current;
                setScheduleListData([...scheduleListData])
                setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
                    if (item.Id == selectedRowId) {
                        item.SaiSDContractMaintenanceScheduleParts = partData.current;
                        return { ...item }
                    } else {
                        return item
                    }
                }));

            } else {
                let temp = {
                    AccountId: user_info["AccountId"],
                    CompanyId: user_info["CompanyId"],
                    IsInventory: isInventory,
                    PartNum: partNum,
                    Description: description,
                    Quantity: quantity,
                    MaintenanceScheduleSeqNum: selectedRowId,
                    Id: getUniqueId(),
                    ContractNum: scheduleData?.Contract?.ContractNum,
                }
                partData.current.unshift(temp);
                listParts(partData.current)
                scheduleListData[0].SaiSDContractMaintenanceScheduleParts = partData.current;
                setScheduleListData([...scheduleListData])
                setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
                    if (item.Id == selectedRowId) {
                        item.SaiSDContractMaintenanceScheduleParts = partData.current;
                        return { ...item }
                    } else {
                        return item
                    }
                }));
            }
        }
    };

    const onRemove = () => {
        editPartData.current = [];
        let temp: any = [...partRowCompute.current]
        setRowsPart(temp)
    };

    const checkBox = (e: boolean) => {
        return (
            <div className="text-center">
                <Form.Check type="checkbox" checked={e} />
            </div>
        )
    };

    const onAddPart = () => {
        editPartData.current = [];
        let columns: GridColumn[] = [];
        columns.push({ value: addDrpoDown(false) });
        columns.push({ value: AddPartSearch(isInventory) });
        columns.push({ value: addInput("desc") });
        columns.push({ value: addInput("qty") });
        columns.push({
            value: actionList(0, "UDATE", {}),
            type: "COMPONENT",
        });
        setRowsPart([{ data: columns }, ...partRowCompute.current]);
    };

    const partSearch = (e: boolean) => {
        return (
            <PartsAdvanceSearch
                isInventory={e}
                selected={partNum}
                onChange={(value: any, data: any) => {
                    onSelectPart(value, data)
                }} />
        )
    };

    const AddPartSearch = (e:boolean) => {
        return (
            <PartsAdvanceSearch
            isInventory={e}
            selected={partNum}
            onChange={(value: any, data: any) => {
                onAddSelectPart(value, data)
            }} />
        )
    };

    const onChangeInventory = (data: any) => {

        setLoading(true);
        setTimeout(() => {
            description = "";
            partNum = "";
            quantity = 1;
            isInventory = data.id;

            let columns: GridColumn[] = [];
            {
                columns.push({ value: addDrpoDown(data.id) });
                columns.push({ value: AddPartSearch(data.id) });
                columns.push({ value: addInput("desc") });
                columns.push({ value: addInput("qty") });
                columns.push({ value: actionList(0, "UDATE", data) });
            }
            let temp: any = [{ data: columns }, ...partRowCompute.current];
            setRowsPart(temp);
            setLoading(false);

        }, 1000)

    }

    const onAddSelectPart = (e: any,value:any) => {
        let data = e.id ? e.id : e;
        if (value) {
            setLoading(true);
            setRowsPart([]);
            partNum = value.PartNum;

            if (value.SalesDescription) {
                description = value.SalesDescription;
            }
            let columns: GridColumn[] = [];
            {
                columns.push({ value: addDrpoDown(isInventory) });
                columns.push({ value: partSearch(isInventory) });
                columns.push({ value: addInput("desc") });
                columns.push({ value: addInput("qty") });
                columns.push({ value: actionList(0, "UDATE", data) });
            }
            let temp: any = [{ data: columns }, ...partRowCompute.current];
            setRowsPart(temp);
            setLoading(false);
        } else {
            partNum = data;
        }
    };

    const addInput = (e: any) => {
        if (e == "desc") {
            return (
                <div className="form-style">
                    <input className="form-control" type="text" defaultValue={description} onChange={(e) => { description = e.target.value }} />
                </div>
            )
        } else if (e == "qty") {
            return (
                <div className="form-style">
                    <input className="form-control" type="text" defaultValue={quantity} onChange={(e) => { quantity = e.target.value }} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                </div>
            )
        }

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
                onChange={(data: any) => onChangeInventory(data)}
            />
            </div>
        )
    };

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a
                    className="grid-hypper-link"
                    onClick={() => viewFullDescription(e)}
                >
                    {e}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    const closeDescription = (value: any) => {
        setIsShowDescription(value);
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
                taskOptions.current = columns;
            })
            .catch((e) => { });
    };

    const closeAddPart = (value: any, data: any) => {
        setshowAddPartModal(false)
    };

    const onSelectPart = (e: any,value:any) => {
        let data = e.id ? e.id : e;
     
        if (value) {
            setLoading(true);
            setRowsPart(partRowCompute.current);

            setTimeout(() => {
                partNum = value.PartNum;
                var index: any = "0";
                if (editPartData.current.length > 0) {
                    maintenanceScheduleData.map((item: any) => {
                        if (item.Id == rowId.current) {
                            item.SaiSDContractMaintenanceScheduleParts.map((res: any, ind: any) => {
                                if (res.Id == editPartData.current[0].Id) {
                                    index = ind;
                                }
                            })
                        }
                    });
                }
                if (value.SalesDescription) {
                    description = value.SalesDescription;
                }
                let columns: GridColumn[] = [];
                {
                    columns.push({ value: addDrpoDown(data.id) });
                    columns.push({ value: partSearch(data.id) });
                    columns.push({ value: addInput("desc") });
                    columns.push({ value: addInput("qty") });
                    columns.push({ value: actionList(index, "UDATE", data) });
                }
                let temp: any = partRowCompute.current.map((option: GridRow, i: number) => {
                    return i == index ? { data: columns } : option;
                });
                setRowsPart(temp);
                setLoading(false);
            }, 1000)

        } else {
            partNum = data;
        }
    };

    const selectedRow = (inde: any, data: any) => {
        maintenanceScheduleData.map((item: any, ind: any) => {
            if (item.SeqNum == data.SeqNum) {
                handleSelectedRow(ind);
            }
        });

    };

    const handleSelectedRow = (index: number) => {
        setScheduleListData([maintenanceScheduleData[index]])
        setSelectedRowId(maintenanceScheduleData[index].Id)
        rowId.current = maintenanceScheduleData[index].Id;
        maintenanceScheduleData[index].SaiSDContractMaintenanceScheduleParts && maintenanceScheduleData[index].SaiSDContractMaintenanceScheduleParts.length > 0 && listParts(maintenanceScheduleData[index].SaiSDContractMaintenanceScheduleParts);
        maintenanceScheduleData[index].SaiSDContractMaintenanceScheduleParts && (partData.current = maintenanceScheduleData[index].SaiSDContractMaintenanceScheduleParts);
        let temp: any = [];
        if (maintenanceScheduleData[index]?.SelectedEquipmentItems.length > 0) {
            props.data?.EquipmentGridData.map((item: any) => {
                maintenanceScheduleData[index]?.SelectedEquipmentItems.map((res: any) => {
                    if (item.Id == res) {
                        temp.push(item)
                    }
                })
            });
        }
        setSelectedEquipment(temp);
        listEquipments(temp);
        maintenanceScheduleData[index].IsUpdated = true;
        setMaintenanceScheduleData([...maintenanceScheduleData])
    };

    const onChangeDescription = (data: any) => {
        scheduleListData[0].MaintenanceDescription = data;
        setScheduleListData([...scheduleListData])
        setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
            if (item.Id == scheduleListData[0].Id) {
                item.MaintenanceDescription = data;
                return { ...item }
            } else {
                return item
            }
        }))
    };

    const closeAttachEquipment = (e: any, type: any, data: any, hasChange: boolean) => {
        setshowAttachEquipmentModal(false);
        if (type == 'SAVE') {
            let temp: any[] = [];
            if (data.length > 0) {
                temp = data.map((item: any) => {
                    return item.Id
                })
            }
            setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
                if (item.Id == selectedRowId) {
                    item.SelectedEquipmentItems = temp;
                    return { ...item }
                } else {
                    return item
                }


            }))
            setSelectedEquipment(data)
            listEquipments(data)
        }
    };

    const onDeletePart = () => {
        setShowPartDeleteModal(false)
        partData.current[deletedPartIndex].IsDeleted = true;
        partData.current[deletedPartIndex].IsUpdated = true;
        scheduleListData[0].SaiSDContractMaintenanceScheduleParts[deletedPartIndex].IsDeleted = true;
        scheduleListData[0].SaiSDContractMaintenanceScheduleParts[deletedPartIndex].IsUpdated = true;
        setScheduleData([...scheduleListData]);
        setMaintenanceScheduleData(maintenanceScheduleData.map((item: any) => {
            if (item.Id == selectedRowId) {
                item.SaiSDContractMaintenanceScheduleParts = partData.current;
                return { ...item }
            } else {
                return item
            }
        }))
        listParts(partData.current)
    };

    const onConfirmDeleteSchedule = () => {
        setShowScheduleDeleteModal(false)
        let temp: any[] = maintenanceScheduleData.map((item: any, index: any) => {
            if (index == deletedScheduleIndex) {
                item.IsDeleted = true;
                item.IsUpdated = true;
                return { ...item }
            } else {
                return item
            }
        });
        setMaintenanceScheduleData(temp)
        listMaintenanceSchedule(temp);
        setRemoveSelectedRow(new Date().getTime());
        setScheduleData([])
        setScheduleListData([])
    };

    return <>
        {
            showScheduleDeleteModal &&
            <DraggableModal
                isOpen={showScheduleDeleteModal}
                onClose={() => setShowScheduleDeleteModal(false)}
                title="Alert"
                type="DELETE_MODAL"
                width={600}
                delete={onConfirmDeleteSchedule}
                data={null}
            />
        }
        {
            showPartDeleteModal &&
            <DraggableModal
                isOpen={showPartDeleteModal}
                onClose={() => setShowPartDeleteModal(false)}
                title="Alert"
                type="DELETE_MODAL"
                width={600}
                delete={onDeletePart}
                data={null}
            />
        }
        {
            showAttachEquipmentModal &&
            <ContractAttachEquipment
                isShow={showAttachEquipmentModal}
                title="Attach EquipmentModal"
                isClose={closeAttachEquipment}
                selectedData={selectedEquipment}
                data={props.data?.EquipmentGridData}
            />
        }
        {
            showAlertModel &&
            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
        }
        {
            isShowDescription &&
            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={closeDescription}
                data={descriptionData}
            />
        }
        {
            showAddPartModal &&
            <ContractAddPart
                isShow={showAddPartModal}
                isClose={closeAddPart}
                data={props?.data}
            />
        }

        <Loader show={isLoading} />

        <div className="form-style">
            <Row>
                <Col md={12} >
                    <div className="maintScehdListGrid">
                        <Grid
                            // filters={filters}
                            // dateFilter={dateFilter}
                            headers={headers1}
                            rows={rowsSchedule}
                            errorMessage={'No Maintenance Schedule Found'}
                            hoverRow={true}
                            ShowLoader={ShowLoader}
                            storeKey={componentKey}
                            // isColumn={true}
                            onClickRow={true}
                            isSelectedRow={selectedRow}
                            unselectRow={removeSelectedRow}
                        />
                    </div>
                </Col>
                {
                    scheduleListData.length > 0 &&
                    <>
                        <Col md={12} className="mb-3">
                            <div className="d-flex justify-content-between">
                                <Form.Label>Description</Form.Label>
                            </div>
                            <Form.Control value={scheduleListData[0].MaintenanceDescription} as="textarea" rows={3} className="h-auto" onChange={(e) => { onChangeDescription(e.target.value) }} />
                        </Col>
                        <Col md={12} className="d-flex justify-content-between">
                            <h6>Equipments</h6>
                            <Button variant="light" onClick={() => { setshowAttachEquipmentModal(true) }} className="btn-brand-light" type="button">+ Attach Equipment</Button>
                        </Col>

                        <Col md={12} >

                            <Grid
                                headers={gridHeader}
                                rows={rows}
                                ShowLoader={ShowLoader}
                                errorMessage={'No Equipment Found'}
                                // hoverRow={true}
                                storeKey={componentKey}
                            />

                        </Col>
                        <Col md={12} className="d-flex justify-content-between">
                            <h6>Parts Used In Maintenance Schedule</h6>
                            <Button variant="light" onClick={() => { onAddPart() }} className="btn-brand-light" type="button">+ Add Part</Button>
                        </Col>
                        <Col md={12} >
                            <Grid
                                headers={partGridHeader}
                                rows={rowsPart}
                                ShowLoader={ShowLoader}
                                errorMessage={'No Parts Found'}
                            />
                        </Col>
                    </>
                }
            </Row>
        </div>
    </>;
};

export default MaintenanceScheduleListing;


