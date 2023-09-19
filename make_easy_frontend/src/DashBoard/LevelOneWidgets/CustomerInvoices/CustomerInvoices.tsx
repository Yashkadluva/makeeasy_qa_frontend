import React, { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import customerInvoiceNA from '../../../../assets/images/CI-NA.svg';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import customerInvoiceA from '../../../../assets/images/CI-A.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./CustomerInvoices.scss"
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode:any;
};

const CustomerInvoices = (props:PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [customerInvoiceData, setCustomerInvoiceData] = useState<any>({});
    const [customerInvoiceDetail, setCustomerInvoiceDetail] = useState<any>({});
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        getCustomerInvoiceDetail()
    }, [props.isReload])


    const getCustomerInvoiceDetail = (e?:any) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/CustomerInvoicesFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setCustomerInvoiceDetail(res)
                getCustomerInvoiceCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }


    const getCustomerInvoiceCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetCustomerInvoicesCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'CustomerInvoices',
                UserName: user_info["userName"],
                RefreshData: e ? 'true' : "false",
                Filter: {
                    Duration : data.Duration,
                    FromDate : `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
                    ToDate : `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
                }
            }
        })
            .then((res) => {
                
                setShowLoader(false)
                setCustomerInvoiceData(res);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }


    return (
        <>
            <div className="col-3 mt-2 customer-invoice">
                <div className="card" style={{ backgroundColor: '#fff6fa' }}>
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
                                    <p className="name">Customer Invoices</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>props.selectOption(props.WidgetCode,"Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(customerInvoiceDetail,"Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(customerInvoiceDetail,"Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(customerInvoiceDetail,"ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(customerInvoiceData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(customerInvoiceData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-CI">
                                        <div className="d-flex">
                                            <img src={customerInvoiceNA} className='card-icon' />
                                            {/* <div className="count">{customerInvoiceData?.Data[0]?.CompletedInvoices}</div> */}
                                        </div>
                                        <div className="title">Completed & Not Approved</div>
                                    </div>
                                    <div className="card-box-CI">
                                        <div className="d-flex">
                                            <img src={customerInvoiceA} className='card-icon' />
                                            {/* <div className="count">{customerInvoiceData?.Data[0]?.ApprovedInvoices}</div> */}
                                        </div>
                                        <div className="title">Approved & Not Posted</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(customerInvoiceData?.LastRefreshedDateTime)}</div>
                                    <img onClick={()=>getCustomerInvoiceDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }
                </div>
            </div>

        </>
    )
}

export default CustomerInvoices