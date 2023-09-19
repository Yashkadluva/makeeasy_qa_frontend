import { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import poUnassignIcon from '../../../../assets/images/po-unassign.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./CancelledCalls.scss";
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const CancelledCalls = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [cancelledCallData, setCancelledCallData] = useState<any>({});
    const [cancelledCallDetail, setCancelledCallDetail] = useState<any>({});
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        getInactiveCustomerDetail()
    }, [props.isReload]);

    const getInactiveCustomerDetail = (e?: any) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/CancelledCallsFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setCancelledCallDetail(res)
                getInactiveCustomerCount(temp, e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getInactiveCustomerCount = (data: any, e?: boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetCancelledCallsCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'CancelledCalls',
                UserName: user_info["userName"],
                RefreshData: e ? 'true' : "false",
                Filter: {
                    Duration: data.Duration,
                    FromDate: `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
                    ToDate: `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
                }
            }
        })
            .then((res) => {
                setShowLoader(false)
                setCancelledCallData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    // 

    return (
        <>
            <div className="col-3 mt-2 canceled-calls">
                <div className="card" style={{ backgroundColor: '#f8f6f4' }}>
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
                                    <p className="name">Cancelled Calls</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => props.selectOption(props.WidgetCode, "Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(cancelledCallDetail, "Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(cancelledCallDetail, "Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(cancelledCallDetail, "ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(cancelledCallData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(cancelledCallData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-cancelled">
                                        <div className="d-flex">
                                            <img src={poUnassignIcon} className='card-icon' />
                                            <div className="count">{cancelledCallData?.Data && cancelledCallData?.Data[0]?.CancelledCalls}</div>
                                        </div>
                                        <div className="title">Call Cancelled</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(cancelledCallData?.LastRefreshedDateTime)}</div>
                                    <img onClick={() => getInactiveCustomerDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default CancelledCalls