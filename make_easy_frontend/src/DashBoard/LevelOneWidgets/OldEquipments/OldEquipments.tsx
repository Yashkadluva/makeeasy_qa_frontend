import { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import QuotesNA from '../../../../assets/images/Q-NS.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./OldEquipments.scss"
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const OldEquipments = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [equipmentData, setEquipmentData] = useState<any>({});
    const [equipmentDetail, setEquipmentDetail] = useState<any>({});
    const [yearsOld,setYearsOld] = useState<any>("")

    useEffect(() => {
        getEquipmentDetail()
    }, [props.isReload]);

    const getEquipmentDetail = (e?:boolean) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/EquipmentFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setEquipmentDetail(res)
                getEquipmentCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getEquipmentCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetEquipmentWdigetData`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'EquipmentDetail',
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
                setEquipmentData(res);
                setYearsOld(`${res.Filter.Duration.charAt(0)}${res.Filter.Duration.charAt(1)} + Years Old Equipment`)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    // 

    return (
        <>
            <div className="col-3 mt-2 old-equipments">
                <div className="card" style={{ backgroundColor: '#f1edf8' }}>
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
                                    <p className="name">{yearsOld ? yearsOld :  "7 + Years Old Equipment"}</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>props.selectOption(props.WidgetCode,"Remove")}>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(equipmentDetail,"Details",yearsOld)}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(equipmentDetail,"Duration")}>
                                                {" "}
                                                Duration
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(equipmentDetail,"ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine" />
                                <div className="d-flex">
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(equipmentData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {moment(equipmentData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="card-box-equipment">
                                        <div className="d-flex">
                                            <img src={QuotesNA} className='card-icon' />
                                            <div className="count">{equipmentData?.Data && equipmentData?.Data[0]?.EquipmentsCount}</div>
                                        </div>
                                        <div className="title">Customers</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(equipmentData?.LastRefreshedDateTime)}</div>
                                    <img onClick={()=>getEquipmentDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default OldEquipments;