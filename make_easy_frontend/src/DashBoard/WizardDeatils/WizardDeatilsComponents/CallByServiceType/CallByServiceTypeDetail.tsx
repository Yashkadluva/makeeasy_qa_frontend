import { Col, Row, Tab, Tabs } from 'react-bootstrap';
import { Label } from '../../../../../components/Label/Label';
import { useForm, Controller } from "react-hook-form";
import SawinSelect from '../../../../../components/Select/SawinSelect';
import SawinDatePicker from '../../../../../components/SawinDatePicker/SawinDatePicker';
import { useEffect, useState } from 'react';
import Button from "react-bootstrap/Button";
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import WebService from '../../../../../utility/WebService';
import HelperService from '../../../../../utility/HelperService';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Type",
    },
    {
        title: "Description",
    },
    {
        title: "Service Master",
    },
    {
        title: "Service Call",
        class: "text-start"
    }

];

const CallByServiceTypeDetail = (props: PropData) => {
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [rows, setRows] = useState<GridRow[]>([]);

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

    useEffect(() => {
        getServiceDetail()
    }, []);

    console.log(typeof(props.data?.value),props.data?.value);

    const getServiceDetail = () => {
        let temp:any = JSON.parse(props.data?.value);
        setFromDate(temp?.StartDate);
        setToDate(temp?.EndDate);
        setDuration(temp?.Duration);
        WebService.postAPI({
            action: `SaiUserWidget/GetServiceCallsDetailsByServiceType`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'ServiceCallsByServiceTypeDetail',
                UserName: user_info["userName"],
                RefreshData: 'true',
                Filter: {
                    ToDate: toDate ? toDate : temp?.EndDate,
                    FromDate: fromDate ? fromDate : temp?.StartDate,
                    Duration: duration ? duration : temp?.Duration,
                }
            }
        })
            .then((res: any) => {
                console.log("res", res.Data)
                if (res.Data && res.Data.length > 0) {
                    let rows: GridRow[] = [];
                    for (var i in res.Data) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.Data[i].ServiceType });
                        columns.push({ value: res.Data[i].ServiceTypeDescription });
                        columns.push({ value: res.Data[i].ServiceMasterId });
                        columns.push({ value: res.Data[i].SdCallMasterId });
                        rows.push({ data: columns });
                    }
                    setRows(rows);
                }
            })
            .catch((e) => {

            })
    }

    return (
        <>
            <div className="form-style p-2">
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
                <div className="mt-2 detail-grid-div">
                    <Grid
                        headers={headers}
                        rows={rows}
                        errorMessage={"No Service Calls Found"}
                    />
                </div>
            </div>
        </>
    )
}

export default CallByServiceTypeDetail;