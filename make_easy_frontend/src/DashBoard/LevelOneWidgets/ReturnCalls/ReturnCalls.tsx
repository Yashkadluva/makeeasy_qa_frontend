import './ReturnCalls.scss';
import { Dropdown } from "react-bootstrap";
import { useEffect, useState } from 'react';
import calendarIcon from '../../../../assets/images/calendar.svg';
import moment from "moment";
import HelperService from "../../../../utility/HelperService";
import WebService from "../../../../utility/WebService";
import dot from '../../../../assets/images/dot-icon.svg';
import poUnassignIcon from '../../../../assets/images/po-unassign.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const ReturnCalls = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [returnCallData, setReturnCallData] = useState<any>({});
    const [returnCallDetail, setReturnCallDetail] = useState<any>({});

    useEffect(() => {
        getReturnCallDetail()
    }, [props.isReload]);

    const getReturnCallDetail = (e?:boolean) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/ReturnCallsFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setReturnCallDetail(res)
                getReturnCallCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getReturnCallCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetReturnCallsCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'ReturnCalls',
                UserName: user_info["userName"],
                RefreshData: e ? 'true' : "false",
                Filter: {
                    Duration : data.Duration,
                    FromDate : `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
                    ToDate : `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
                }
            }
        })
            .then((res: any) => {
                setShowLoader(false)
                setReturnCallData(res)
            })
            .catch((e: any) => {
                setShowLoader(false)
            })
    }

    return (
        <>
            <div className="col-3 mt-2 return-call-page">
                <div className="card" style={{ backgroundColor: '#e0e9f2' }}>
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
                            <>
                                <div className="d-flex justify-content-between">
                                    <p className="name">Return Calls</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>props.selectOption(props.WidgetCode,"Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(returnCallDetail,"Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(returnCallDetail,"Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(returnCallDetail,"ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(returnCallData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(returnCallData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-return">
                                        <div className="d-flex">
                                            <img src={poUnassignIcon} className='card-icon' />
                                            <div className="count">{returnCallData?.Data && returnCallData?.Data[0]?.ReturnCalls}</div>
                                        </div>
                                        <div className="title">Call Returned</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(returnCallData?.LastRefreshedDateTime)}</div>
                                    <img onClick={()=>getReturnCallDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default ReturnCalls;