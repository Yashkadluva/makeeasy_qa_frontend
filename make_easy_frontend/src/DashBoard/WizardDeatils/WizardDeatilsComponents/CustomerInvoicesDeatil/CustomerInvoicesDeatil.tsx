import './CustomerInvoicesDeatil.scss';


import { useEffect, useState } from 'react';
import loader from "../../../../../assets/images/loader.gif";
import WebService from '../../../../../utility/WebService';
import { Col, Row } from 'react-bootstrap';
import { Label } from '../../../../../components/Label/Label';
import SawinSelect from '../../../../../components/Select/SawinSelect';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from '../../../../../components/SawinDatePicker/SawinDatePicker';
import Button from "react-bootstrap/Button";
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
    SET_WORK_ORDER_ID, setDataInRedux, SEARCH_RESULT, SET_ACTIVE_TAB
} from "../../../../../action/CommonAction";
import { useNavigate } from 'react-router-dom';
import DescriptionModal from '../../../../../components/DescriptionModal/DescriptionModal';
import moment from 'moment';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Master # - Name",
    },
    {
        title: "Address",
    },
    {
        title: "Call #",
        class: "text-end"
    },
    {
        title: "Batch",
    },
    {
        title: "Approved",
        class: "text-center"
    },
    {
        title: "Posted",
        class: "text-center"
    },
    {
        title: "Outcome Code",
    },
    {
        title: "Invoice #",
        class: "text-end"
    },
    {
        title: "Invoice Date",
        class: "text-center"
    },
    {
        title: "Amount",
        class: "text-end"
    },
];

const CustomerInvoicesDeatil = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [type, setType] = useState<any>("All");
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");

    useEffect(() => {
        if (props.data) {
            reset(props.data?.value)
            setDuration(props.data?.value?.Duration)
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate)
            getCustomerInvoicesDetail();
        }
    }, [props.data]);

    console.log(props.data);

    const getCustomerInvoicesDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'CallPurchaseOrder',
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate: `${HelperService.getFormatedDateForSorting(toDate ? toDate : props.data?.value?.EndDate)} 0:0:0`,
                FromDate: `${HelperService.getFormatedDateForSorting(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
                CallPurchaseOrderType: type
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetCustomerInvoicesData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                console.log(res)

                let rows: GridRow[] = [];
                for (var i in res.CustomerInvoices) {
                    let columns: GridColumn[] = [];
                    columns.push({
                        value: res.CustomerInvoices[i].SDServiceMasterId && onServiceMaster(res.CustomerInvoices[i]),
                    });
                    columns.push({ value: res.CustomerInvoices[i].Address1 });
                    columns.push({ value: res.CustomerInvoices[i].SDCallMasterId && onWorkOrder(res.CustomerInvoices[i]) });
                    columns.push({ value: res.CustomerInvoices[i].BatchNum });
                    columns.push({ value: res.CustomerInvoices[i].IsApproved ? "Yes" : "No" });
                    columns.push({ value: res.CustomerInvoices[i].IsPosted ? "Yes" : "No" });
                    columns.push({ value: res.CustomerInvoices[i].SetupSDOutcomeCodeId });
                    columns.push({ value: res.CustomerInvoices[i].Id && onInvoice(res.CustomerInvoices[i]) });
                    columns.push({ value: res.CustomerInvoices[i].InvoiceDate && HelperService.getFormatedDate(res.CustomerInvoices[i].InvoiceDate) });
                    columns.push({ value: res.CustomerInvoices[i].InvoiceTotal && HelperService.getCurrencyFormatter(res.CustomerInvoices[i].InvoiceTotal) });
                    rows.push({ data: columns });
                }

                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const onInvoice = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteInvoice(value)}>
            {value.Id}
        </a>
    };

    const onNavaigteInvoice = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.Id, page: window.location.pathname, SMId: e.SDServiceMasterId }, })
        );
        navigate(`/invoice-entry`)
    };

    const onWorkOrder = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteCallInfo(value)}>
            {value.SDCallMasterId}
        </a>
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.SDServiceMasterId}{" "}{value.SMName}
        </a>
    }

    const onNavaigteCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.SDCallMasterId, page: window.location.pathname, SMId: e.SDServiceMasterId }, })
        );
        navigate(`/call-information`)
    };

    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.SDServiceMasterId },
            })
        );
        navigate(`/service-master`);
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

    const DurationDataSource: any = [
        {
            value: 'Last 7 Days',
            id: '7 Days',
            days: '7'
        },
        {
            value: 'Last 15 Days',
            id: '15 Days',
            days: '15'
        },
        {
            value: 'Last 30 Days',
            id: '30 Days',
            days: '30'
        },
        {
            value: 'Last 45 Days',
            id: '45 Days',
            days: '45'
        },
        {
            value: 'Last 60 Days',
            id: '60 Days',
            days: '60'
        },
        {
            value: 'Last 90 Days',
            id: '90 Days',
            days: '90'
        },
        {
            value: 'Last 120 Days',
            id: '120 Days',
            days: '120'
        },
        {
            value: 'Last 1 Year',
            id: '1 Year',
            days: '365'
        },
        {
            value: 'Custom',
            id: 'Custom'
        }
    ];


    return (
        <>
            <DescriptionModal
                isShow={isShowDescription}
                title={"Problem Description"}
                isClose={() => setIsShowDescription(false)}
                data={descriptionData}
            />
            <>
                <form className="form-style p-2" onSubmit={handleSubmit(getCustomerInvoicesDetail)}>
                    <Row>
                        <Col md={3}>
                            <Label title='Duration' />
                            <Controller
                                control={control}
                                name="Duration"
                                render={({ field }) => (
                                    <SawinSelect
                                        options={DurationDataSource}
                                        selected={duration}
                                        onChange={(data: any) => { field.onChange(data.id); setDuration(data.id);
                                            if (data.id !== "Custom") {
                                                var date = moment(new Date()).subtract(data.days, 'd').format("MM/DD/YYYY");
                                                setFromDate(date)
                                                setToDate(moment(new Date()).format("MM/DD/YYYY"))
                                            }
                                        }}
                                    />
                                )}
                            />

                        </Col>
                        <Col md={3}>
                            <Label title='Start Date' showStar={true} />
                            <Controller
                                control={control}
                                name="StartDate"
                                render={({ field }) => (
                                    <SawinDatePicker
                                        isDisabled={duration == "Custom" ? false : true}
                                        selected={fromDate}
                                        onChange={(data: any) => {
                                            setFromDate(data);
                                            if (new Date(data) >= new Date(toDate)) {
                                                setValue("EndDate", data);
                                                setToDate(data);
                                            }
                                            field.onChange(data);
                                        }}
                                    />
                                )}
                            />

                        </Col>
                        <Col md={3}>
                            <Label title='End Date' showStar={true} />
                            <Controller
                                control={control}
                                name="EndDate"
                                render={({ field }) => (
                                    <SawinDatePicker
                                        selected={toDate}
                                        isDisabled={duration == "Custom" ? false : true}
                                        minData={new Date(fromDate)}
                                        onChange={(data: any) => {
                                            setToDate(data);
                                            field.onChange(data);
                                        }}
                                    />
                                )}
                            />

                        </Col>
                        <Col md={3} className="mt-1">
                            <div className="mt-4">
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid me-3"
                                    type="submit" >
                                    Search
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <div className="mt-2">
                        <Grid
                            headers={headers}
                            rows={rows}
                            ShowLoader={showLoader}
                            errorMessage={"No Customer Invoices Deatil Found"}
                        />
                    </div>
                </form>
            </>



        </>
    )
}

export default CustomerInvoicesDeatil;


