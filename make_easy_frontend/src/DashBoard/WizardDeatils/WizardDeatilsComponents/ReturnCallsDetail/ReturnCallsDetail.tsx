import './ReturnCallsDetail.scss';
import { useEffect, useRef, useState } from 'react';
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
        title: "Service Master# - Name",
    },
    {
        title: "Call #",
    },
    {
        title: "Service Date",
        class: "text-center"
    },
    {
        title: "Problem Description",
    },
    {
        title: "Orig Call #",
    },
    {
        title: "Orig Call Date",
        class: "text-center"
    },
    {
        title: "Orig Call Problem Description",
    },
    {
        title: "Orig Tech#",
    },
    {
        title: "Orig Work Description",
    },
];



const ReturnCallsDetail = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [selectedTechnician, setSelectedTechnician] = useState<any>("All")
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");
    const allTechnician = useRef<any[]>([]);
    const [technicianOption, setTechnicianOption] = useState<any[]>([]);
    const [retunCallData, setretunCallData] = useState<any[]>([])

    useEffect(() => {
        if (props.data) {
            reset(props.data?.value)
            setDuration(props.data?.value?.Duration)
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate);
            allTechnician.current.length == 0 && getTechnican()
            getPurchaseOrderDetail();
        }
    }, [props.data]);

    const getPurchaseOrderDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'ReturnCalls',
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate: `${HelperService.getFormatedDateForDetail(toDate ? toDate : props.data?.value?.EndDate)} 23:59:59`,
                FromDate: `${HelperService.getFormatedDateForDetail(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetReturnCallsData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                let techData: any = [];
                let rows: GridRow[] = [];
                setretunCallData(res.ReturnCalls)
                if (props.data) {
                    for (var i in res.ReturnCalls) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.ReturnCalls[i].SmNumber && onServiceMaster(res.ReturnCalls[i]), });
                        columns.push({ value: res.ReturnCalls[i].CallNumber && onWorkOrder(res.ReturnCalls[i]) });
                        columns.push({ value: res.ReturnCalls[i].ServiceDate && HelperService.getFormatedDate(res.ReturnCalls[i].ServiceDate) });
                        columns.push({ value: showDescription(res.ReturnCalls[i]) });
                        columns.push({ value: res.ReturnCalls[i].OldCallNumber && onOldWorkOrder(res.ReturnCalls[i]) });
                        columns.push({ value: res.ReturnCalls[i].OldCallDate && HelperService.getFormatedDate(res.ReturnCalls[i].OldCallDate) });
                        columns.push({ value: showOldDescription(res.ReturnCalls[i]) });
                        columns.push({ value: res.ReturnCalls[i].OldTechNumber });
                        columns.push({ value: showWorkDescription(res.ReturnCalls[i]) });
                        rows.push({ data: columns });
                        techData.push(res.ReturnCalls[i].OldTechNumber)
                    }
                    let technicianData: any = techData.filter((item: any,
                        index: number) => techData.indexOf(item) === index);
                    var array = [{ id: "All", value: "All" }];
                    for (let x of allTechnician.current) {
                        for (var i in technicianData) {
                            if (x.TechNum == technicianData[i]) {
                                array.push({
                                    id: x.TechNum,
                                    value: x.TechNameInternal,
                                });
                            }
                        }
                    }

                    setTechnicianOption(array)
                };
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const filterByTechnician = (res: any) => {
        if (res.length > 0) {
            let rows: GridRow[] = [];
            for (var i in res) {
                let columns: GridColumn[] = [];
                columns.push({ value: res[i].SmNumber && onServiceMaster(res[i]), });
                columns.push({ value: res[i].CallNumber && onWorkOrder(res[i]) });
                columns.push({ value: res[i].ServiceDate && HelperService.getFormatedDate(res[i].ServiceDate) });
                columns.push({ value: showDescription(res[i]) });
                columns.push({ value: res[i].OldCallNumber && onOldWorkOrder(res[i]) });
                columns.push({ value: res[i].OldCallDate && HelperService.getFormatedDate(res[i].OldCallDate) });
                columns.push({ value: showOldDescription(res[i]) });
                columns.push({ value: res[i].OldTechNumber });
                columns.push({ value: showWorkDescription(res[i]) });
                rows.push({ data: columns });
            }
            setRows(rows);
        } else {
            setRows([]);
        }

    }

    const showWorkDescription = (e: any) => {
        if (e) {
            return (
                <a className="grid-hypper-link"
                    onClick={() => viewFullDescription(e.OldWorkDescription)}>
                    {e.OldWorkDescription}
                </a>
            );
        }
    };

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a className="grid-hypper-link"
                    onClick={() => viewFullDescription(e.ProblemDescription)}>
                    {e.ProblemDescription}
                </a>
            );
        }
    };

    const showOldDescription = (e: any) => {
        if (e) {
            return (
                <a className="grid-hypper-link"
                    onClick={() => viewFullDescription(e.OldCallProblemDescription)}>
                    {e.OldCallProblemDescription}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    const onWorkOrder = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteCallInfo(value)}>
            {value.CallNumber}
        </a>
    };

    const onOldWorkOrder = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteOldCallInfo(value)}>
            {value.OldCallNumber}
        </a>
    };

    const onNavaigteOldCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.OldCallNumber, page: window.location.pathname, SMId: e.SmNumber }, })
        );
        navigate(`/call-information`)
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.SmNumber}{" "}{value.SmName}
        </a>
    };

    const onNavaigteCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.CallNumber, page: window.location.pathname, SMId: e.SmNumber }, })
        );
        navigate(`/call-information`)
    };

    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.SmNumber },
            })
        );
        navigate(`/service-master`);

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

    const getTechnican = () => {
        WebService.getAPI({
            action: `SetupSaiSDTechMaster/${user_info["AccountId"]}/${user_info["CompanyId"]}/false`,
        })
            .then((res: any) => {
                allTechnician.current = res
            })
            .catch((e) => { })
    };

    const onChangeTechnician = (data: any) => {
        setSelectedTechnician(data)
        if (data !== "All") {
            let temp: any = retunCallData.filter((item: any) => {
                return item.OldTechNumber == data;
            });
            filterByTechnician(temp)
        } else if (data == "All") {
            filterByTechnician(retunCallData)
        }

    };



    return (
        <>
            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={() => setIsShowDescription(false)}
                data={descriptionData}
            />

            <>
                <form className="form-style p-2" onSubmit={handleSubmit(getPurchaseOrderDetail)}>
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
                                        onChange={(data: any) => {
                                            field.onChange(data.id); setDuration(data.id);
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
                        <Col md={3}>
                            <div className="mt-4">
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid me-3"
                                    type="submit" >
                                    Search
                                </Button>
                            </div>
                        </Col>
                        {
                            rows.length > 0 &&
                            <Col md={3}>
                                <Label title='Technician' />
                                <SawinSelect
                                    options={technicianOption}
                                    selected={selectedTechnician}
                                    onChange={(data: any) => { onChangeTechnician(data.id) }}
                                />

                            </Col>
                        }


                    </Row>
                    <div className="mt-2">
                        <Grid
                            headers={headers}
                            rows={rows}
                            ShowLoader={showLoader}
                            errorMessage={"No Return Calls Detail Found"}
                        />
                    </div>
                </form>
            </>



        </>
    )
}

export default ReturnCallsDetail;