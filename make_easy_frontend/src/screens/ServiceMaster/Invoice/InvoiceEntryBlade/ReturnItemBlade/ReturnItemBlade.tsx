import { Button, Row, Col, Form, Offcanvas } from 'react-bootstrap';
import BsButton from "react-bootstrap/Button";
import { useEffect, useRef, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import HelperService from '../../../../../utility/HelperService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InviceSDMasterState, InvoiceState } from '../../../../../reducer/CommonReducer';
import "./ReturnItemBlade.scss"
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
        title: "Return #",
        class: "text-center",
    },
    {
        title: " Description",
        class: "text-start",
    },
    {
        title: "Return",
        class: "text-center",
    },
    {
        title: "Status",
        class: "text-center",
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

const ReturnItemBlade = (props: PropData) => {
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
    const [calculateSales, setCalculateSales] = useState(false);
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const selectedPart = useRef<any[]>([]);
    const [enableSubmit,setEnableSubmit] = useState(false)


    useEffect(() => {
        props.isShow == true &&  getPOItemWithProjectId()
        
    }, [props.isShow]);

    const getPOItemWithProjectId = () => {
        setShowLoader(true);
        WebService.getAPI({
            action: `SaiReturnPO/GetReturnDetails/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
        })
            .then((res: any) => {
                console.log(res)
                setShowLoader(false);
                let rows: any[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: res[i].RetunPONum});
                    columns.push({ value: HelperService.removeHtml(res[i].Description) });
                    columns.push({ value: HelperService.getFormatedDate(res[i].ReturnDate) });
                    columns.push({ value: res[i].ReturnPOStatus });
                    rows.push({ data: columns, POData: res[i].ReturnPODetails });
                }
                rowCompute.current = rows;
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false);
            });
    };

    // const getPOItemWithOutProjectId = () => {
    //     setShowLoader(true);
    //     WebService.getAPI({
    //         action: `SaiPO/GetPODetails/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData?.InvoiceNum}`,
    //     })
    //         .then((res: any) => {
    //             setShowLoader(false);
    //             let rows: any[] = [];
    //             for (var i in res) {
    //                 let columns: GridColumn[] = [];
    //                 columns.push({ value: HelperService.getFormatedDate(res[i].OrderDate) });
    //                 columns.push({ value: HelperService.removeHtml(res[i].Description) });
    //                 columns.push({ value: res[i].POStatus });
    //                 columns.push({ value: res[i].POPartStatus });
    //                 columns.push({ value: res[i].PONum });
    //                 rows.push({ data: columns, POData: res[i].ReturnPODetails });
    //             }
    //             rowCompute.current = rows;
    //             setRows(rows);
    //         })
    //         .catch((e) => {
    //             setShowLoader(false);
    //         });
    // };

    const selectedRow = (index: any, value: any) => {
        if (value?.POData.length > 0) {
            selectedRowIndex = index;
            setShowLoader(false);
            let rows: any[] = [];
            for (var i in value?.POData) {
                if (value && value.POData[i] && !value.POData[i].QuantityReceived) {
                    value.POData[i].QuantityReceived = value.POData[i].QuantityToAdd;
                }
                let columns: GridColumn[] = [];
                columns.push({ value: checkBox(Number(i), value?.POData[i]) });
                columns.push({ value: value?.POData[i].PartNum });
                columns.push({ value: value?.POData[i].Description });
                columns.push({ value: value?.POData[i].UnitCost });
                columns.push({ value: value?.POData[i].Quantity });
                columns.push({ value: value?.POData[i].ExtendedAmount });
                columns.push({ value: value?.POData[i].IsInventory });
                columns.push({ value: value?.POData[i].QuantityUsed });
                columns.push({ value: value?.POData[i].QuantityToAdd });
                columns.push({ value: value?.POData[i].QuantityReceived });
                columns.push({ value: value?.POData[i].POPartStatus });
                columns.push({value: actionList(Number(i), "ACTION", value?.POData[i]),type: "COMPONENT",});
                rows.push({ data: columns,isChecked : false});
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
        if (!e.IsUnitCostInRange && calculateSales) {
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
                selectedPart.current = selectedPart.current.filter((item:any)=>{
                    return item.PartNum !== e.PartNum
                })
                selectedPart.current.length == 0 && setEnableSubmit(false)
            }
            rowComputePart.current[index].isChecked = !rowComputePart.current[index].isChecked;
            setRows1( rowComputePart.current)
        }
    };


    const CloseModal = (e: any) => {
        setRows([])
        rowCompute.current = [];
        setRows1([])
        rowComputePart.current = [];
        selectedPart.current = [];
        setEnableSubmit(false)
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
        QuantityToAdd = data?.QuantityToAdd
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
            columns.push({ value: rowComputePart.current[index].data[8].value });
            columns.push({ value: rowComputePart.current[index].data[9].value });
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
        if (e.QuantityReceived >= QuantityToAdd) {
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
            setErrorMessage(`Qty To Add should be less than ${e.QuantityReceived}`)
            setAlertModel(true)
        }

    };

    const onRemove = () => {
        setRows1(rowComputePart.current);
    };

    const onSubmit = () => {
        const requestBody =  {
            ReturnDetails : selectedPart.current,
            AccountId : user_info["AccountId"],
            CompanyId : user_info["CompanyId"],
            InvoiceNum : invoiceData.invoiceData?.InvoiceNum,
        }
        console.log(requestBody)

        setLoading(true);
        WebService.postAPI({
            action: `SDInvoiceDetail/AddReturnItemsToInvoice`,
            body:requestBody
        })
            .then((res: any) => {
                setLoading(false); 
                CloseModal("yes")
            })
            .catch((e) => {
                setLoading(false);
            });
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
            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-ex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Return Item Selection</Offcanvas.Title>
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
                        <Button variant="primary" className="btn-brand-solid me-3" type="button" disabled={!enableSubmit} onClick={() => onSubmit()}>Add To Invoice</Button>
                        <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => CloseModal({})}>Cancel</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default ReturnItemBlade;