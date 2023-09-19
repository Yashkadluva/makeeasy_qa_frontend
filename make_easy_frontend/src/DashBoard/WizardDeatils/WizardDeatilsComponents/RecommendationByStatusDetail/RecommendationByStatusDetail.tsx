import './RecommendationByStatusDetail.scss';
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
        title: "Phone #",
        class : "text-end"
    },
    {
        title: "Recmd Dt.",
        class : "text-center"
    },
    {
        title: "Status",
        class : "text-center"
    },
    {
        title: "Recmd made by",
    },
    {
        title: "Recmd description",
        class : "description-text"
    },
];

const RecommendationByStatusDetail = (props: PropData) => {
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
            getCancelledCallsDetail();
        }
    }, [props.data]);

    console.log(props.data);

    const getCancelledCallsDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'RecommendationByStatus',
            DetailWidgetCode : "RecommendationByStatusDetail",
            IsDetailData : "true",
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate:`${HelperService.getFormatedDateForSorting(toDate ? toDate : props.data?.value?.EndDate)} 0:0:0`,
                FromDate: `${HelperService.getFormatedDateForSorting(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetRecommendationsByStatusWidgetData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                console.log(res)

                let rows: GridRow[] = [];
                if (props.data) {
                    for (var i in res.Data) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.Data[i].SDServiceMasterId && onServiceMaster(res.Data[i]),});
                        columns.push({ value: res.Data[i].SMAddress });
                        columns.push({ value: res.Data[i].Phone && HelperService.getFormattedContact(res.Data[i].Phone) });
                        columns.push({ value: res.Data[i].RecommendedDate && HelperService.getFormatedDate(res.Data[i].RecommendedDate) });
                        columns.push({ value: res.Data[i].RecommendationStatusCode });
                        columns.push({ value: res.Data[i].RecommendedBy });
                        columns.push({ value: res.Data[i].RecommendationText && showDescription(res.Data[i].RecommendationText) });
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
            {value.Id}
        </a>
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.SDServiceMasterId}{" "}{value.SMName}
        </a>
    }

    const onNavaigteCallInfo = (e: any) => {
        dispatch(
            setDataInRedux({ type: SET_WORK_ORDER_ID, value: { id: e.Id, page: window.location.pathname, SMId: e.SDServiceMasterId }, })
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
                    {HelperService.removeHtml(e)}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    const DurationDataSource: any =  [
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
                <form className="form-style p-2" onSubmit={handleSubmit(getCancelledCallsDetail)}>
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
                            errorMessage={"No Cancelled Calls Detail Found"}
                        />
                    </div>
                </form>
            </>



        </>
    )
}

export default RecommendationByStatusDetail;


