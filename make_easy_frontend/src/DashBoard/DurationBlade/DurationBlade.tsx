import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';
import { Row, Col, Card, } from 'react-bootstrap';
import { Controller, useForm } from "react-hook-form";
import './DurationBlade.scss';
import SawinSelect from '../../../components/Select/SawinSelect';
import { Label } from '../../../components/Label/Label';
import WebService from '../../../utility/WebService';
import SawinDatePicker from '../../../components/SawinDatePicker/SawinDatePicker';
import loader from "../../../assets/images/loader.gif";
import HelperService from '../../../utility/HelperService';
import moment from 'moment';

interface PropData {
    isShow: boolean;
    isClose: any;
    data: any;
    title: any;
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

const DurationBlade = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const [duration, setDuration] = useState<any>("");
    const [durationData, setDurationData] = useState<any>({});
    const [startDate, setStartDate] = useState<any>("");
    const [endDate, setEndDate] = useState<any>("");
    const [showLoader, setShowLoader] = useState(false);


    console.log(props.data?.key)
    useEffect(() => {
        if (props.data && props.isShow) {
            setDurationData(props.data);
            setDuration(props.data?.value?.Duration)
            setStartDate(props.data?.value?.StartDate)
            setEndDate(props.data?.value?.EndDate)
        }
    }, [props.isShow]);

    const onCloseModal = (e?: any) => {
        props.isClose(!props.isShow, e, props.data?.key);
    };

    const onSave = () => {
        let temp = { EndDate: endDate, StartDate: startDate, Duration: duration };
        setShowLoader(true)
        WebService.postAPI({
            action: `SAIUserPreference`,
            body: {
                userID: user_info["userID"],
                CompanyId: user_info["CompanyId"],
                AccountId: user_info["AccountId"],
                UserName: user_info["userName"],
                key: props.data?.key,
                value: JSON.stringify(temp)
            },
        })
            .then((res: any) => {
                setShowLoader(false)
                onCloseModal("on_save")
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const equipmentDurationDataSource: any = [
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

    return (
        <>
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Duration</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0">
                    <form onSubmit={handleSubmit(onSave)}>
                        {
                            showLoader ? <div style={{ textAlign: "center" }}>
                                <img
                                    style={{ position: "relative" }}
                                    src={loader}
                                    alt="No loader found"
                                />
                                <div style={{ position: "relative", color: "black" }}>
                                    Loading...
                                </div>
                            </div>
                                :
                                <div className="p-2">
                                    <h6>{props.title}</h6>
                                    <hr />
                                    <Col md={12}>

                                        <Row>
                                            <Col md={6} className="form-style">
                                                <Label title="Duration" />
                                                <Controller
                                                    control={control}
                                                    name="Duration"
                                                    render={({ field }) => (
                                                        <SawinSelect
                                                            options={props.data?.key == "EquipmentFilter" ? equipmentDurationDataSource : DurationDataSource}
                                                            selected={duration}
                                                            onChange={(data: any) => {
                                                                field.onChange(data.id);
                                                                setDuration(data.id)
                                                                if (data.id !== "Custom" && props.data?.key !== "EquipmentFilter") {
                                                                    var date = moment(new Date()).subtract(data.days, 'd').format("MM/DD/YYYY");
                                                                    setStartDate(date)
                                                                    setEndDate(moment(new Date()).format("MM/DD/YYYY"))
                                                                }
                                                                if (props.data?.key == "EquipmentFilter") {
                                                                    const aYearFromNow = new Date();
                                                                    aYearFromNow.setFullYear(aYearFromNow.getFullYear() - data.year);
                                                                    setStartDate(HelperService.getFormatedDate(aYearFromNow));
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                />
                                            </Col>
                                            <Col md={6} className="form-style">
                                            </Col>
                                            <Col md={6} className="form-style">
                                                <Label title="Start Date" showStar={true} />
                                                <Controller
                                                    control={control}
                                                    name="StartDate"
                                                    render={({ field }) => (
                                                        <SawinDatePicker
                                                            isDisabled={duration == 'Custom' ? false : true}
                                                            selected={startDate}
                                                            onChange={(data: any) => { field.onChange(data); setStartDate(HelperService.getFormatedDate(data)) }}
                                                        />
                                                    )}
                                                />
                                            </Col>

                                            <Col md={6} className="form-style">
                                                <Label title="End Date" showStar={true} />
                                                <Controller
                                                    control={control}
                                                    name="EndDate"
                                                    render={({ field }) => (
                                                        <SawinDatePicker
                                                            isDisabled={duration == 'Custom' ? false : true}
                                                            selected={endDate}
                                                            onChange={(data: any) => { field.onChange(data); setEndDate(HelperService.getFormatedDate(data)) }}
                                                        />
                                                    )}
                                                />
                                            </Col>
                                        </Row>

                                    </Col>
                                </div>
                        }

                        <div className="offcanvas-footer mt-4 position-absolute">
                            <Button variant="primary" className="btn-brand-solid me-3" type="submit">Apply</Button>
                            <Button variant="primary" className="btn-brand-outline" type="button" onClick={onCloseModal}>Cancel</Button>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default DurationBlade;