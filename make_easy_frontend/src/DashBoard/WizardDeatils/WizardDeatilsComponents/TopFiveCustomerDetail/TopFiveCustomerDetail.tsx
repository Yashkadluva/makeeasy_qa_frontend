import './TopFiveCustomerDetail.scss';
import { useEffect, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import SawinSelect from '../../../../../components/Select/SawinSelect';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from '../../../../../components/SawinDatePicker/SawinDatePicker';
import Button from "react-bootstrap/Button";
import { useNavigate } from 'react-router-dom';
import ExceptionListDetail from './ExceptionListDetail';
import Top5CustomerDetail from './Top5CustomerDetail';
import { Label } from '../../../../../components/Label/Label';
import HelperService from '../../../../../utility/HelperService';

interface PropData {
    data: any;
};

const TopFiveCustomerDetail = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("");
    const [pendingData, sePendingData] = useState<any>({});

    useEffect(() => {
        if (props.data) {
            reset(props.data?.value)
            setDuration(props.data?.value?.Duration)
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate)
            getCancelledCallsDetail();
        }
    }, [props.data]);


    const getCancelledCallsDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'QuoteAndRecommendation',
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate: `${HelperService.getFormatedDateForSorting(toDate ? toDate : props.data?.value?.EndDate)} 0:0:0`,
                FromDate: `${HelperService.getFormatedDateForSorting(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetTopFiveRevenueCustomersWidgetDetails`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                sePendingData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const DurationDataSource: any = [
        {
            value: 'Last 7 Days',
            id: '7 Days'
        },
        {
            value: 'Last 15 Days',
            id: '15 Days'
        },
        {
            value: 'Last 30 Days',
            id: '30 Days'
        },
        {
            value: 'Last 45 Days',
            id: '45 Days'
        },
        {
            value: 'Last 60 Days',
            id: '60 Days'
        },
        {
            value: 'Last 90 Days',
            id: '90 Days'
        },
        {
            value: 'Last 120 Days',
            id: '120 Days'
        },
        {
            value: 'Last 1 Year',
            id: '1 Year'
        },
        {
            value: 'Custom',
            id: 'Custom'
        }
    ];

    return (
        <>
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
                                        onChange={(data: any) => { field.onChange(data.id); setDuration(data.id) }}
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
                </form>
                <div className="tab-style contract-details mb-0 p-2">
                    <Tabs defaultActiveKey="Quotes" className=" mt-1">

                        <Tab
                            eventKey="Quotes"
                            title={
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <label className="nav-text">Top 5 Customers</label>
                                </div>
                            }

                        >
                            <Top5CustomerDetail data={pendingData && pendingData?.Data && pendingData?.Data} showLoader={showLoader} />
                        </Tab>
                        <Tab eventKey="Recommendation"
                            title={
                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <label className="nav-text">Exeption List</label>
                                </div>
                            }

                        >
                            <ExceptionListDetail data={pendingData && pendingData?.BelowReorderQtyPartList && pendingData?.BelowReorderQtyPartList} showLoader={showLoader} />

                        </Tab>

                    </Tabs>
                </div>

            </>



        </>
    )
}

export default TopFiveCustomerDetail;


