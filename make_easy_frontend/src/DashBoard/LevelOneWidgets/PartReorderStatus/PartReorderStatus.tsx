import { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import customerInvoiceNA from '../../../../assets/images/CI-NA.svg';
import customerInvoiceA from '../../../../assets/images/CI-A.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./PartReorderStatus.scss"
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const PartReorderStatus = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [partReorderData, setPartReorderData] = useState<any>({});
    const [partReorderDetail, setPartReorderDetail] = useState<any>({});

    useEffect(() => {
        getPartReorderDetail()
    }, [props.isReload]);

    const getPartReorderDetail = (e?:boolean) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/PartReOrderStatusFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setPartReorderDetail(res)
                getPartReorderCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getPartReorderCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetPartReOrderDetail`,

            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'PartReOrderStatus',
                UserName: user_info["userName"],
                RefreshData: e ? 'true' : "false",
                Filter: [data]
            }
        })
            .then((res: any) => {
                setShowLoader(false)
                setPartReorderData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    // 

    return (
        <>
            <div className="col-3 mt-2 part-reorder-status">
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
                                    <p className="name">Part Reorder Status</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>props.selectOption(props.WidgetCode,"Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(partReorderDetail,"Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(partReorderData?.Filter?.FromDate).format('MMM DD,YY')} - {moment(partReorderData?.Filter?.ToDate).format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-CI">
                                        <div className="d-flex">
                                            <img src={customerInvoiceNA} className='card-icon' />
                                            <div className="count">{partReorderData?.Data && partReorderData?.Data[0]?.BelowReorderQtyPartCount}</div>
                                        </div>
                                    </div>
                                    <div className="card-box-CI">
                                        <div className="d-flex">
                                            <img src={customerInvoiceA} className='card-icon' />
                                            <div className="count">{partReorderData?.Data && partReorderData?.Data[0]?.AboveMaxQtyPartCount}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(partReorderData?.LastRefreshedDateTime)}</div>
                                    <img onClick={()=>getPartReorderDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default PartReorderStatus