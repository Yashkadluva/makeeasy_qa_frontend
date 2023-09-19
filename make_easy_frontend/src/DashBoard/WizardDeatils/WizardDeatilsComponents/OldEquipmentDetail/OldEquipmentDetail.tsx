import './OldEquipmentDetail.scss';
import { useEffect, useRef, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import { Col, Row } from 'react-bootstrap';
import { Label } from '../../../../../components/Label/Label';
import SawinSelect from '../../../../../components/Select/SawinSelect';
import Button from "react-bootstrap/Button";
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
    setDataInRedux, SEARCH_RESULT, SET_ACTIVE_TAB
} from "../../../../../action/CommonAction";
import { useNavigate } from 'react-router-dom';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Master",
    },
    {
        title: "Address",
    },
    {
        title: "Email",
    },
    {
        title: "Phone #",
    },
    {
        title: "Manufacturer",
    },
    {
        title: "Model",
    },
    {
        title: "Serial",
    },
    {
        title: "Unit",
    },
    {
        title: "Location",
    },
    {
        title: "Our Install",
        class: "text-center"
    },
    {
        title: "Install Date",
        class: "text-center"
    },
    {
        title: "Age",
    },
];



const OldEquipmentDetail = (props: PropData) => {
    const navigate = useNavigate()
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    

    useEffect(() => {
        if (props.data) {
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate);
            setDuration(props.data?.value?.Duration)
            let temp:any = (new Date(props.data?.value?.EndDate).getTime() - new Date(props.data?.value?.StartDate).getTime())/1000;
            temp /= (60 * 60 * 24)
            console.log(temp/365.25);
            
            getEquipmentDetail();
        }
    }, [props.data]);

    const getEquipmentDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'Equipment',
            DetailWidgetCode: 'EquipmentDetail',
            UserName: user_info["userName"],
            RefreshData: 'true',
            IsDetailData: true,
            Filter: {
                ToDate: `${HelperService.getFormatedDateForDetail(toDate ? toDate : props.data?.value?.EndDate)} 23:59:59`,
                FromDate: `${HelperService.getFormatedDateForDetail(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetEquipmentWdigetData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: GridRow[] = [];
                if (props.data) {
                    for (var i in res.Data) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.Data[i].ServiceMasterId && onServiceMaster(res.Data[i]), });
                        columns.push({ value: res.Data[i].Address });
                        columns.push({ value: res.Data[i].Email });
                        columns.push({ value: res.Data[i].Phone && HelperService.getFormattedContact(res.Data[i].Phone) });
                        columns.push({ value: res.Data[i].Manufacturer });
                        columns.push({ value: res.Data[i].Model });
                        columns.push({ value: res.Data[i].Serial });
                        columns.push({ value: res.Data[i].Unit });
                        columns.push({ value: res.Data[i].Location });
                        columns.push({ value: res.Data[i].OurInstall });
                        columns.push({ value: res.Data[i].InstallDate && HelperService.getFormatedDate(res.Data[i].InstallDate) });
                        columns.push({ value: res.Data[i].Age });
                        rows.push({ data: columns });
                    };
                    setRows(rows);
                };
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.ServiceMasterId}{" "}{value.SMName}
        </a>
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

    };

    const DurationDataSource: any = [
        {
            value: 'Last 5 Years',
            id: '5 Years',
            year: 5,
        },
        {
            value: 'Last 7 Years',
            id: '7 Years',
            year: 7,
        },
        {
            value: 'Last 10 Years',
            id: '10 Years',
            year: 10,
        },
        {
            value: 'Last 15 Years',
            id: '15 Years',
            year: 15,
        },
        {
            value: 'Last 20 Years',
            id: '20 Years',
            year: 20,
        }
    ];

    const onChangeDuration = (data: any) => {
        setDuration(data.id)
        const aYearFromNow = new Date();
        aYearFromNow.setFullYear(aYearFromNow.getFullYear() - data.year);
        setFromDate(HelperService.getFormatedDateForTimePicker(aYearFromNow));
    };


    return (
        <>

            <div className='p-2'>
                <Row className='mb-2'>
                    <Col md={4}>
                        <Label title='Duration' />
                        <div className="form-style">
                            <SawinSelect
                                options={DurationDataSource}
                                selected={duration}
                                onChange={(data: any) => { onChangeDuration(data) }}
                            />
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="mt-4">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                onClick={() => getEquipmentDetail()} >
                                Search
                            </Button>
                        </div>
                    </Col>

                </Row>
                <div className="mt-2 detail-grid-div">
                    <Grid
                        headers={headers}
                        rows={rows}
                        ShowLoader={showLoader}
                        errorMessage={"No Old Equipment Detail Found"}
                    />
                </div>
            </div>



        </>
    )
}

export default OldEquipmentDetail;