import './CallPurchaseOrder.scss';
import { Dropdown } from "react-bootstrap";
import calendarIcon from '../../../../assets/images/calendar.svg';
import dot from '../../../../assets/images/dot-icon.svg';
import moment from "moment";
import { useEffect, useState } from 'react';
import poUnassignIcon from '../../../../assets/images/po-unassign.svg';
import poReceive from '../../../../assets/images/po-receive.svg';
import poOrder from '../../../../assets/images/po-order.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import WebService from '../../../../utility/WebService';
import HelperService from '../../../../utility/HelperService';
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const CallPurchaseOrder = (props: PropData) => {
    const [purchaseOrderData, setPurchaseOrderData] = useState<any>();
    const [purchaseOrderDetail, setPurchaseOrderDetail] = useState<any>();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        getPurchaseOrderDetail()
    }, [props.isReload]);

    const getPurchaseOrderDetail = (e?:any) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/CallPurchaseOrderFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setPurchaseOrderDetail(res)
                getPurchaseOrderCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getPurchaseOrderCount = (data: any,e?:boolean) => {
        console.log(data)
        console.log(data.EndDate)
        
        WebService.postAPI({
            action: `SaiUserWidget/GetPurchaseOrdersWidget`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'CallPurchaseOrder',
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
                setPurchaseOrderData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }


    return (
        <>
            <div className="col-3 mt-2 call-purchase-order">
                <div className="card" style={{ backgroundColor: '#F6FFF8' }}>
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
                                    <p className="name">Call - Purchase Order</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>{props.selectOption(props.WidgetCode,"Remove")}}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(purchaseOrderDetail,"Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(purchaseOrderDetail,"Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(purchaseOrderDetail,"ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(purchaseOrderData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(purchaseOrderData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-po">
                                        <div className="d-flex">
                                            <img src={poUnassignIcon} className='card-icon' />
                                            <div className="count">{purchaseOrderData?.Data && purchaseOrderData?.Data[0]?.PORecievedButCallNotAssinged}</div>
                                        </div>
                                        <div className="title">Unassigned Call</div>
                                    </div>
                                    <div className="card-box-po">
                                        <div className="d-flex">
                                            <img src={poReceive} className='card-icon' />
                                            <div className="count">{purchaseOrderData?.Data && purchaseOrderData?.Data[0]?.POToBeReceivedCount}</div>
                                        </div>
                                        <div className="title">To Be Recv.</div>
                                    </div>
                                    <div className="card-box-po">
                                        <div className="d-flex">
                                            <img src={poOrder} className='card-icon' />
                                            <div className="count">{purchaseOrderData?.Data && purchaseOrderData?.Data[0]?.POToBeOrderCount}</div>
                                        </div>
                                        <div className="title">To Order</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(purchaseOrderData?.LastRefreshedDateTime)}</div>
                                    <img src={refresh} onClick={()=>getPurchaseOrderDetail(true)} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default CallPurchaseOrder;