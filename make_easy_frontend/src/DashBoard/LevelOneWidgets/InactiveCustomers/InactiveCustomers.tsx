import { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import InactiveIcon from '../../../../assets/images/I-C.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./InactiveCustomers.scss";
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const InactiveInvoices = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [inactiveCustomerData, setInactiveCustomerData] = useState<any>({});
    const [inactiveInvoicesDetail, setInactiveInvoicesDetail] = useState<any>({});
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        getInactiveCustomerDetail()
    }, [props.isReload]);

    const getInactiveCustomerDetail = (e?:any) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/InactiveCustomersFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setInactiveInvoicesDetail(res)
                getInactiveCustomerCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getInactiveCustomerCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetInactiveCustomersCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'InactiveCustomer',
                UserName: user_info["userName"],
                RefreshData: 'true',
                Filter: {
                    Duration : data.Duration,
                    FromDate : `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
                    ToDate : `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
                }
            }
        })
            .then((res) => {
                setShowLoader(false)
                setInactiveCustomerData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    return (
        <>
            <div className="col-3 mt-2 inactive-customer">
                <div className="card" style={{ backgroundColor: '#fffff4' }}>
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
                                    <p className="name">Inactive Customers</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => props.selectOption(props.WidgetCode, "Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(inactiveInvoicesDetail, "Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(inactiveInvoicesDetail, "Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => props.selectOption(inactiveInvoicesDetail, "ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{inactiveCustomerData?.Filter && moment(inactiveCustomerData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {inactiveCustomerData?.Filter && moment(inactiveCustomerData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-inactive">
                                        <div className="d-flex">
                                            <img src={InactiveIcon} className='card-icon' />
                                            <div className="count">{inactiveCustomerData?.Data && inactiveCustomerData?.Data[0]?.InactiveCustomers}</div>
                                        </div>
                                        <div className="title">Not Scheduled</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(inactiveCustomerData?.LastRefreshedDateTime)}</div>
                                    <img src={refresh} onClick={()=>getInactiveCustomerDetail(true)} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default InactiveInvoices