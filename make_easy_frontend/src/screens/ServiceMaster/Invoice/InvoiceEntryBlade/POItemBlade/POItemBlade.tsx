import { Button, Row, Col, Form, Offcanvas } from 'react-bootstrap';
import BsButton from "react-bootstrap/Button";
import { useEffect, useRef, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import HelperService from '../../../../../utility/HelperService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InviceSDMasterState, InvoiceState } from '../../../../../reducer/CommonReducer';
import "./POItemBlade.scss"
import Loader from '../../../../../components/Loader/Loader';
import Grid, {
    GridHeader,
    GridRow,
    GridColumn,
    Filter,
} from "../../../../../components/Grid/Grid";
import editicon from "../../../../../assets/images/edit.svg";
import saveIcon from "../../../../../assets/images/save.svg";
import cancelIcon from "../../../../../assets/images/cancel.svg";
import { toast } from 'react-toastify';
import DraggableModal from '../../../../../components/DraggableModal/DraggableModal';

interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
}

const headers: GridHeader[] = [
    {
        title: "Order Date",
        class: "text-center",
    },
    {
        title: " Description",
        class: "text-start",
    },
    {
        title: "Status",
        class: "text-center",
    },
    {
        title: "Part Status",
        class: "text-center",
    },
    {
        title: "PO#",
        class: "text-end",
    },
];

const headers2: GridHeader[] = [
    {
        title: "",
        isSorting: false,
        class: "text-center",
    },
    {
        title: " Part#",
        class: "text-start",
    },
    {
        title: "Description",
        class: "text-start",
    },
    {
        title: "Unit Cost",
        class: "text-end",
    },
    {
        title: "Qty Ordered",
        class: "text-end",
    },
    {
        title: "Extended Amount",
        class: "text-end",
    },
    {
        title: "Is Inv",
        class: "text-center",
    },
    {
        title: "Already Included",
        class: "text-end",
    },
    {
        title: "Qty To Add",
        class: "text-end",
    },
    {
        title: "Qty Received",
        class: "text-end",
    },
    {
        title: "Part Status",
        class: "text-start",
    },
    {
        title: "Action",
        class: "text-center freeze-column",
        isFreeze: true,
        isSorting: false,
    },
];

const POItemBlade = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const [isLoading, setLoading] = useState(false);
    const [ShowLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const [rows1, setRows1] = useState<GridRow[]>([]);
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [gridHeader1, setHeader1] = useState<GridHeader[]>(headers2);
    let rowCompute = useRef<GridRow[]>([]);
    let rowComputePart = useRef<GridRow[]>([]);
    let QuantityToAdd: any = "";
    let selectedRowIndex: number = 0;
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const selectedPart = useRef<any[]>([]);
    const calculateSales = useRef(false);
    const [enableSubmit, setEnableSubmit] = useState(false)


    useEffect(() => {
        if (props.data?.SDSMProjectId) {
            getPOItemWithProjectId()
        } else {
            getPOItemWithOutProjectId()
        }
    }, [props.isShow]);

    const getPOItemWithProjectId = () => {
        setShowLoader(true);
        WebService.getAPI({
            action: `SaiPO/GetPODetailsByProjectId/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data?.SDSMProjectId}`,
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: any[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: HelperService.getFormatedDate(res[i].OrderDate) });
                    columns.push({ value: HelperService.removeHtml(res[i].Description) });
                    columns.push({ value: res[i].POStatus });
                    columns.push({ value: res[i].POPartStatus });
                    columns.push({ value: res[i].PONum });
                    rows.push({ data: columns, POData: res[i].PODetails });
                }
                rowCompute.current = rows;
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false);
            });
    };

    const getPOItemWithOutProjectId = () => {
        setShowLoader(true);
        WebService.getAPI({
            action: `SaiPO/GetPODetails/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData?.InvoiceNum}`,
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: any[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: HelperService.getFormatedDate(res[i].OrderDate) });
                    columns.push({ value: HelperService.removeHtml(res[i].Description) });
                    columns.push({ value: res[i].POStatus });
                    columns.push({ value: res[i].POPartStatus });
                    columns.push({ value: res[i].PONum });
                    rows.push({ data: columns, POData: res[i].PODetails });
                }
                rowCompute.current = rows;
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false);
            });
    };

    const selectedRow = (index: any, value: any) => {
        if (value?.POData.length > 0) {
            selectedRowIndex = index;
            setShowLoader(false);
            let rows: any[] = [];
            for (var i in value?.POData) {
                if (value && value.POData[i] && !value.POData[i].OriginalQuantityToAdd) {
                    value.POData[i].OriginalQuantityToAdd = value.POData[i].QuantityToAdd;
                }
                let columns: GridColumn[] = [];
                columns.push({ value: checkBox(Number(i), value?.POData[i]) });
                columns.push({ value: value?.POData[i].PartNum });
                columns.push({ value: value?.POData[i].Description });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].UnitCost) });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].Quantity) });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].ExtendedAmount) });
                columns.push({ value: (value?.POData[i].IsInventory == true && "true") || (value?.POData[i].IsInventory == false && "false") });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].QuantityUsed) });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].QuantityToAdd) });
                columns.push({ value: HelperService.getCurrencyFormatter(value?.POData[i].QuantityReceived) });
                columns.push({ value: value?.POData[i].POPartStatus });
                columns.push({
                    value: actionList(Number(i), "ACTION", value?.POData[i]),
                    type: "COMPONENT",
                });
                rows.push({ data: columns, isChecked: false });
            }
            rowComputePart.current = rows;
            setRows1(rows);
        } else {
            toast.error("No Parts Found")
            rowComputePart.current = [];
            setRows1([]);
        }

    };

    const checkBox = (index: number, data: any) => {
        return (
            <div className="d-flex justify-content-center">
                <Form.Check defaultChecked={false} onClick={() => click(index, data)} type="checkbox" label=" " />
            </div>
        );
    };

    const click = (index: number, e: any) => {
        if (!e.IsUnitCostInRange && calculateSales.current) {
            setErrorMessage(`The unit cost for selected material price sheet is out of range.`)
            setAlertModel(true)
        } else if (e.QuantityToAdd == 0) {
            setErrorMessage(`Cannot add line item with zero quantity.`)
            setAlertModel(true)
        } else {
            if (rowComputePart.current[index].isChecked == false) {
                selectedPart.current.push(e)
                setEnableSubmit(true)
            } else {
                selectedPart.current = selectedPart.current.filter((item: any) => {
                    return item.PartNum !== e.PartNum
                })
                selectedPart.current.length == 0 && setEnableSubmit(false)
            }
            rowComputePart.current[index].isChecked = !rowComputePart.current[index].isChecked;
            setRows1(rowComputePart.current)
        }
    };

    const CloseModal = (e: any) => {
        setRows([])
        rowCompute.current = [];
        setRows1([])
        rowComputePart.current = [];
        selectedPart.current = [];
        setEnableSubmit(false)
        calculateSales.current = false;
        props.isClose(!props.isShow, e);
    };

    const actionList = (value: number, type: string, data: object) => {
        return (
            <div className="action-ele action-btns">
                {type === "ACTION" ? (
                    <div>
                        <a
                            onClick={() => onEdit(value, data)}
                            className="text-dark ms-2 font-18 cursor-pointer"
                        >
                            <img src={editicon} height={20} />
                        </a>
                    </div>
                ) : (
                    <div>
                        <a
                            onClick={() => onSave(value, data)}
                            className="text-dark ms-3 font-18 cursor-pointer"
                        >
                            <img src={saveIcon} />
                        </a>
                        <a
                            onClick={() => onRemove()}
                            className="text-dark ms-3 font-18 cursor-pointer"
                        >
                            <img src={cancelIcon} />
                        </a>
                    </div>
                )}
            </div>
        );
    };

    const onEdit = (index: any, data: any) => {
        QuantityToAdd = HelperService.getCurrencyFormatter(data?.QuantityToAdd)
        let columns: GridColumn[] = [];
        {
            columns.push({ value: rowComputePart.current[index].data[0].value });
            columns.push({ value: rowComputePart.current[index].data[1].value });
            columns.push({ value: rowComputePart.current[index].data[2].value });
            columns.push({ value: rowComputePart.current[index].data[3].value });
            columns.push({ value: rowComputePart.current[index].data[4].value });
            columns.push({ value: rowComputePart.current[index].data[5].value });
            columns.push({ value: rowComputePart.current[index].data[6].value });
            columns.push({ value: rowComputePart.current[index].data[7].value });
            columns.push({ value: addInput() });
            columns.push({ value: rowComputePart.current[index].data[9].value });
            columns.push({ value: rowComputePart.current[index].data[10].value });
            columns.push({ value: actionList(index, "UPDATE", data) });
        }
        setRows1(
            rowComputePart.current.map((option: GridRow, i: number) => {
                return i === index ? { data: columns, isChecked: false } : option;
            })
        );
    };

    const addInput = () => {
        return (
            <div>
                <input
                    type="text"
                    className="form-control"
                    defaultValue={QuantityToAdd}
                    onKeyPress={(e) =>
                        HelperService.allowOnlyNumericValue(e)
                    }
                    onChange={(e) => (QuantityToAdd = e.target.value)}
                />
            </div>
        );
    };

    const onSave = (index: number, e: any) => {
        if (e.OriginalQuantityToAdd >= QuantityToAdd) {
            e.QuantityToAdd = QuantityToAdd;
            let data: any = rows;
            data[selectedRowIndex].POData[index] = e;
            setRows(data)
            rowCompute.current = data;
            let partData: any = rowComputePart.current;
            partData[index].data[8].value = QuantityToAdd
            setRows1(partData)
            rowComputePart.current = partData;
        } else {
            setErrorMessage(`Qty To Add should be less than ${e.OriginalQuantityToAdd}`)
            setAlertModel(true)
        }

    };

    const onRemove = () => {
        setRows1(rowComputePart.current);
    };

    const onSubmit = () => {
        getRegulateCalulation(0)
        // if (calculateSales.current == true) {
        // } else {
        //     const requestBody = {
        //         PODetails: selectedPart.current,
        //         AccountId: user_info["AccountId"],
        //         CompanyId: user_info["CompanyId"],
        //         InvoiceNum: invoiceData.invoiceData?.InvoiceNum,
        //     }
        //     setLoading(true);
        //     WebService.postAPI({
        //         action: `SDInvoiceDetail/AddPOItemsToInvoice`,
        //         body: requestBody
        //     })
        //         .then((res: any) => {
        //             setLoading(false);
        //             CloseModal("yes")
        //         })
        //         .catch((e) => {
        //             setLoading(false);
        //             if (e.response.data.ErrorDetails.message) {
        //                 setAlertModel(!showAlertModel);
        //                 setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        //             }
        //         });
        // }

    }

    const getRegulateCalulation = (e: any) => {
        if (e <= (selectedPart.current.length - 1)) {
            getCalulation(selectedPart.current, e)
        } else {
            const requestBody = {
                PODetails: selectedPart.current,
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                InvoiceNum: invoiceData.invoiceData?.InvoiceNum,
            }
            setLoading(true);
            WebService.postAPI({
                action: `SDInvoiceDetail/AddPOItemsToInvoice`,
                body: requestBody
            })
                .then((res: any) => {
                    setLoading(false);
                    CloseModal("yes")
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

    const getCalulation = (data: any, index: number) => {
        setLoading(true);
        data[index].IsCreatingFromSolutionCode = true;
        WebService.postAPI({
            action: `SDInvoice/GetCalculatedCharges`,
            body: data[index]
        })
            .then((res: any) => {
                if (res.Data) {
                    selectedPart.current[index].Discount = res.Data.Discount;
                    selectedPart.current[index].SalesTax = res.Data.SalesTax;
                    selectedPart.current[index].SalesAmount = res.Data.SalesAmount;
                    selectedPart.current[index].RetailPrice = res.Data.RetailPrice;
                    selectedPart.current[index].TaxAmount = res.Data.UseTaxAmount;
                    getRegulateCalulation(++index)
                } else {
                    setLoading(false);
                    setErrorMessage(`The unit cost for selected material price sheet is out of range.`)
                    setAlertModel(true)
                }
            })
            .catch((e) => {
                setLoading(false);
                // if (e.response.data.ErrorDetails.message) {
                //     setAlertModel(!showAlertModel);
                //     setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                // }
            });
    }

    const onCalculateSalesAmount = () => {
        if (calculateSales.current == false && selectedPart.current.length > 0) {
            let data = selectedPart.current.filter((item: any) => {
                return item.IsUnitCostInRange == false
            })
            if (data.length > 0) {
                selectedPart.current = selectedPart.current.filter((item: any) => {
                    return item.PartNum !== data[0].PartNum
                })
                selectedPart.current.length == 0 && setEnableSubmit(false)
                setErrorMessage(`The unit cost for selected material price sheet is out of range.`)
                setAlertModel(true)
            }
            calculateSales.current = !calculateSales.current;
        } else {
            calculateSales.current = !calculateSales.current;
        }
    }

    return (
        <>
            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-dex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Purchase Order Item Selection</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className=" px-0 pb-0">
                    <div className="px-4 pb-3  modal-inner-min-h poItem-container">
                        <div className="poItem-upper-grid">
                            <Grid
                                errorMessage={"No Purchase Order Item Found"}
                                headers={gridHeader}
                                rows={rows}
                                ShowLoader={ShowLoader}
                                onClickRow={true}
                                // filters={filters}
                                // isColumn={true}
                                isSelectedRow={selectedRow}
                                hoverRow={true}
                            // storeKey={componentKey}
                            />
                        </div>
                        <div className="poItem-lower-grid">
                            {
                                rows1.length > 0 &&
                                <Grid
                                    errorMessage={"No Parts Found"}
                                    headers={gridHeader1}
                                    rows={rows1}
                                    ShowLoader={ShowLoader}
                                    // filters={filters}
                                    // isColumn={true}
                                    hoverRow={true}
                                // storeKey={componentKey}
                                />
                            }

                        </div>
                    </div>
                    <div className="offcanvas-footer d-flex justify-content-center">
                        <Form.Check className='mx-3' defaultChecked={false} onChange={() => { onCalculateSalesAmount() }} type="checkbox" label="Calculate Sales Amount on PO Items" />
                        <Button variant="primary" className="btn-brand-solid me-3" type="button" disabled={!enableSubmit} onClick={() => onSubmit()}>Add To Invoice</Button>
                        <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => CloseModal({})}>Cancel</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default POItemBlade;