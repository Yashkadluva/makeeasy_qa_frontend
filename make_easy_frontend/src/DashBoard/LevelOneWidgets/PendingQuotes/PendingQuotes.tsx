import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import QuotesNA from '../../../../assets/images/Q-NS.svg';
import QuotesP from '../../../../assets/images/Q-P.svg';
import "./PendingQuotes.scss"
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const PendingQuotes = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [pendingQuoteData, setPendingQuoteData] = useState<any>({});
    const [pendingQuoteDetail, setPendingQuoteDetail] = useState<any>({});

    useEffect(() => {
        getPedingQuotesDetail()
    }, [props.isReload]);

    const getPedingQuotesDetail = (e?:boolean) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/QuotesAndRecommendationFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                console.log("temp",temp)
                res.value = temp;
                setPendingQuoteDetail(res)
                getPedingQuotesCount(res.value,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getPedingQuotesCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetPendingQuotesAndRecommendationsCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'QuoteAndRecommendation',
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
                setPendingQuoteData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }



    return (
        <>
            <div className="col-3 mt-2 pending-quotes">
                <div className="card" style={{ backgroundColor: '#f5faff' }}>
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
                                    <p className="name">Pending Quotes & Recomd.</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => props.selectOption(props.WidgetCode, "Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(pendingQuoteDetail, "Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(pendingQuoteDetail, "Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(pendingQuoteDetail, "ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(pendingQuoteData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(pendingQuoteData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-quotes">
                                        <div className="d-flex">
                                            <img src={QuotesNA} className='card-icon' />
                                            <div className="count">{pendingQuoteData?.Data && pendingQuoteData?.Data[0]?.PendingQuotesCount}</div>
                                        </div>
                                        <div className="title">Not Scheduled</div>
                                    </div>
                                    <div className="card-box-quotes">
                                        <div className="d-flex">
                                            <img src={QuotesP} className='card-icon' />
                                            <div className="count">{pendingQuoteData?.Data && pendingQuoteData?.Data[0]?.PendingRecommendationCount}</div>
                                        </div>
                                        <div className="title">Pending Recmd.</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(pendingQuoteData?.LastRefreshedDateTime)}</div>
                                    <img onClick={() => getPedingQuotesDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default PendingQuotes