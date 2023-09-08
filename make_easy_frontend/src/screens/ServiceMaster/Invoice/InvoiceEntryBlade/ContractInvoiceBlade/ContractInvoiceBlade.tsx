import { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Form, Offcanvas } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import DraggableModal from '../../../../../components/DraggableModal/DraggableModal';
import Grid, {
    GridColumn,
    GridHeader,
    GridRow,
} from "../../../../../components/Grid/Grid";
import { RootState } from '../../../../../config/Store';
import { InviceSDMasterState } from '../../../../../reducer/CommonReducer';
import HelperService from '../../../../../utility/HelperService';
import WebService from '../../../../../utility/WebService';
import "../ContractInvoiceBlade/ContractInvoiceBlade.scss"

interface PropData {
    isShow: boolean;
    isClose: any;
}

const firstGridHeader: GridHeader[] = [
    {
        title: "Contract#",
    },
    {
        title: "Expiry Date",
    },
    {
        title: "Description",
    },
];

const secondGridHeader: GridHeader[] = [
    {
        title: "Maintenance Line",
    },
    {
        title: "Due Date",
    },
    {
        title: "Amount",
    },
];

const thirdGridHeader: GridHeader[] = [
    {
        title: "Billing Sequence #",
    },
    {
        title: "Due Date",
    },
    {
        title: "Amount",
    },
];

const ContractInvoiceBlade = (props: PropData) => {
    const [firstTableData, setFirstTableData] = useState<GridRow[]>([]);
    const [secondTableData, setSecondTableData] = useState<GridRow[]>([]);
    const [thirdTableData, setThirdTableData] = useState<GridRow[]>([]);
    const [ShowLoader, setShowLoader] = useState(false);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [dataTable, setDataTable] = useState<any[]>([])
    const [selectedFirstRow, setSelectedFirstRow] = useState<any>()
    const [selectedSecondRow, setSelectedSecondRow] = useState<any>()
    const [selectedThirdRow, setSelectedThirdRow] = useState<any>()
    const [errorMessage, setErrorMessage] = useState("");
    const [showAlertModel, setAlertModel] = useState(false);

    const CloseModal = () => {
        props.isClose(!props.isShow);
    }

    useEffect(() => {
        getFirstTableData()
    }, [])

    const getFirstTableData = () => {
        WebService.getAPI({
            action: `SaiSDContract/GetContracts/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoceSDMaster.invoceSDMaster.SDServiceMasterId}/false`,
            body: null
        })
            .then((res: any) => {
                setDataTable(res)
                let rows: GridRow[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: res[i].ContractNum });
                    columns.push({ value: res[i].ExpiryDate && HelperService.getFormatedDateInUs(res[i].ExpiryDate) });
                    columns.push({ value:res[i].ContractDescription });
                    rows.push({ data: columns });
                }
                setFirstTableData(rows);
            })
            .catch((e) => {

            })
    }

    const getSecondTableData = (id: any) => {
        WebService.getAPI({
            action: `SaiSDContractBilling/GetContractMantenanceSchedule/${user_info["AccountId"]}/${user_info["CompanyId"]}/${id}/${invoceSDMaster.invoceSDMaster.Id}`,
            body: null
        })
            .then((res: any) => {
                let rows: GridRow[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: res[i].BillingDetailLineNo });
                    columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDateInUs(res[i].ScheduleDate) });
                    columns.push({ value: HelperService.getCurrencyFormatter(res[i].MaintenanceAmount) });
                    rows.push({ data: columns });
                }
                setSecondTableData(rows);
                getThirdTableData(id)
            })
            .catch((e) => {

            })
    }

    const getThirdTableData = (id: any) => {
        WebService.getAPI({
            action: `SaiSDContractBilling/GetContractBilling/${user_info["AccountId"]}/${user_info["CompanyId"]}/${id}/${invoceSDMaster.invoceSDMaster.Id}`,
            body: null
        })
            .then((res: any) => {
                let rows: GridRow[] = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: res[i].BillSeqNum });
                    columns.push({ value: res[i].ScheduleDate && HelperService.getFormatedDateInUs(res[i].ScheduleDate) });
                    columns.push({ value: HelperService.getCurrencyFormatter(res[i].BillAmount) });
                    rows.push({ data: columns });
                }
                setThirdTableData(rows);
            })
            .catch((e) => {

            })
    }

    const selectedRow = (index: any, value: any) => {
        var id = '';
        for (var i in dataTable) {
            if (index == i) {
                id = dataTable[i].ContractNum
                setSelectedFirstRow(dataTable[i])
            }
        }
        getSecondTableData(id)
    };

    const twoSelect = (index: any, value: any) => {
        setSelectedSecondRow(value)
    }

    const threeSelect = (index: any, value: any) => {
        setSelectedThirdRow(value)
    }

    const onSubmit = () => {
        if (!selectedFirstRow?.ContractNum) {
            setAlertModel(true);
            setErrorMessage("Please select Contract and Maintenance Schedule Line.")
        } else if (!selectedSecondRow) {
            setAlertModel(true);
            setErrorMessage("Please select Contract and Maintenance Schedule Line.")
        } else {
            var obj = {
                first: selectedFirstRow,
                second: selectedSecondRow,
                third: selectedThirdRow
            }
            props.isClose(!props.isShow, obj);
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
            <Offcanvas show={props.isShow} onHide={CloseModal} placement={'end'} className="offcanvas-dex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Contract For Invoice</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className=" px-0 pb-0">
                    <Form className="form-style contract-invoice-blade">
                        <div className="px-4 pb-3 mb-2 modal-inner-min-h">
                            <div className='col-12 row'>
                                <div className='col-6'>
                                    <Grid
                                        headers={firstGridHeader}
                                        rows={firstTableData}
                                        onClickRow={true}
                                        hoverRow={true}
                                        isSelectedRow={selectedRow}
                                        ShowLoader={ShowLoader}
                                        errorMessage={"No items to display"}
                                    />
                                </div>
                                <div className='col-6'>
                                    <Grid
                                        headers={secondGridHeader}
                                        rows={secondTableData}
                                        onClickRow={true}
                                        hoverRow={true}
                                        isSelectedRow={twoSelect}
                                        ShowLoader={ShowLoader}
                                        errorMessage={"No items to display"}
                                    />
                                </div>
                                <div className='col-6'>  </div>
                            <div className='col-6'>
                                <Grid
                                    headers={thirdGridHeader}
                                    rows={thirdTableData}
                                    onClickRow={true}
                                    hoverRow={true}
                                    isSelectedRow={threeSelect}
                                    ShowLoader={ShowLoader}
                                    errorMessage={"No items to display"}
                                />
                            </div>
                            </div>
                            
                        </div>

                        <div className="offcanvas-footer">
                            <Button variant="primary" className="btn-brand-solid me-3" onClick={() => onSubmit()} disabled={secondTableData.length > 0 ? false : true}>Select</Button>
                            <Button variant="primary" className="btn-brand-outline" type="button" onClick={CloseModal}>Cancel</Button>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default ContractInvoiceBlade;