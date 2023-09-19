import './CallPurchaseOrderDetail.scss';
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
import moment from 'moment';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Call #",
    },
    {
        title: "Service Master",
    },
    {
        title: "Technician Name",
    },
    {
        title: "PO#",
        class:"text-end"
    },
    {
        title: "PO Date",
        class:"text-center"
    },
    {
        title: "PO Status",
    },
    {
        title: "Vendor Name",
    },
];

const CallPurchaseOrderDetail = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [type, setType] = useState<any>("All")

    useEffect(() => {
        if (props.data) {
            reset(props.data?.value)
            setDuration(props.data?.value?.Duration)
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate)
            getPurchaseOrderDetail();
        }
    }, [props.data]);


    const getPurchaseOrderDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'CallPurchaseOrder',
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate:`${HelperService.getFormatedDateForDetail(toDate ? toDate : props.data?.value?.EndDate)} 23:59:59`,
                FromDate: `${HelperService.getFormatedDateForDetail(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
                CallPurchaseOrderType: type
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetPurchaseOrdersDetailData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);

                let rows: GridRow[] = [];
                if (props.data) {
                    for (var i in res.Data) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.Data[i].SDCallMasterId && onWorkOrder(res.Data[i]) });
                        columns.push({
                            value: res.Data[i].ServiceMasterId && onServiceMaster(res.Data[i]),
                        });
                        columns.push({ value: res.Data[i].TechName });
                        columns.push({ value: res.Data[i].PONumber });
                        columns.push({ value: res.Data[i].OrderDate && HelperService.getFormatedDate(res.Data[i].OrderDate) });
                        columns.push({ value: res.Data[i].POStatus });
                        columns.push({ value: res.Data[i].VendorName });
                        rows.push({ data: columns });
                    }
                }
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const onWorkOrder = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteCallInfo(value)}>
            {value.SDCallMasterId}
        </a>
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.ServiceMasterId}{" "}{value.SMName}
        </a>
    }

    const onNavaigteCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.SDCallMasterId, page: window.location.pathname, SMId: e.ServiceMasterId }, })
        );
        navigate(`/call-information`)
    };

    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.ServiceMasterId },
            })
        );
        navigate(`/service-master`);

    }

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

    const CallPurchaseOrderTypeDataSource: any = [
        { value: "All", id: "All" },
        { value: "Received Calls", id: "ReceivedCalls" },
        { value: "To Be Received", id: "ToBeReceived" },
        { value: "To Order", id: "ToOrder" }
    ];




    return (
        <>

            <>
                <form className="form-style p-2" onSubmit={handleSubmit(getPurchaseOrderDetail)}>
                    <Row>
                        <Col md={4}>
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
                        <Col md={4}>
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
                        <Col md={4}>
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
                        <Col md={4}>
                            <Label title='Type' />
                            <Controller
                                control={control}
                                name="Duration"
                                render={({ field }) => (
                                    <SawinSelect
                                        options={CallPurchaseOrderTypeDataSource}
                                        selected={type}
                                        onChange={(data: any) => { field.onChange(data.id); setType(data.id) }}
                                    />
                                )}
                            />

                        </Col>
                        <Col md={4}>
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
                            errorMessage={"No PO Detail Found"}
                        />
                    </div>
                </form>
            </>



        </>
    )
}

export default CallPurchaseOrderDetail;