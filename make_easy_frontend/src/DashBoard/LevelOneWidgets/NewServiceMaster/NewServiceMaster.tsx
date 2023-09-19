import { useEffect, useState } from 'react'
import { Dropdown } from 'react-bootstrap';
import dot from '../../../../assets/images/dot-icon.svg';
import calendarIcon from "../../../../assets/images/calendar.svg"
import HelperService from '../../../../utility/HelperService';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import InactiveIcon from '../../../../assets/images/I-C.svg';
import moment from 'moment';
import WebService from '../../../../utility/WebService';
import "./NewServiceMaster.scss"
import loader from "../../../../assets/images/loader.gif";

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const NewServiceMaster = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [serviceMasterData, setServiceMasterData] = useState<any>({});
    const [serviceMasterDetail, setServiceMasterDetail] = useState<any>({});

    useEffect(() => {
        getServiceMasterDetail()
    }, [props.isReload]);

    const getServiceMasterDetail = (e?:boolean) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/NewServiceMasterCreatedFilter`,
        })
            .then((res: any) => {
                let temp: any = JSON.parse(res.value);
                res.value = temp;
                setServiceMasterDetail(res)
                getServiceMasterCount(temp,e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    const getServiceMasterCount = (data: any,e?:boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetNewServiceMasterCreatedCount`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'NewServiceMasterCreated',
                UserName: user_info["userName"],
                RefreshData: e ? 'true' : "false",
                Filter: [data]
            }
        })
            .then((res) => {
                setShowLoader(false)
                setServiceMasterData(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    }

    // 

    return (
        <>
            <div className="col-3 mt-2 new-service-master">
                <div className="card" style={{ backgroundColor: '#dfe8ec' }}>
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
                                    <p className="name">New Service Master</p>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>props.selectOption(props.WidgetCode,"Remove")}> 
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(serviceMasterDetail,"Details")}>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={()=>props.selectOption(serviceMasterDetail,"ScheduleEmail")}>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine mb-1" />
                                {/* <div className="d-flex" > 
                                    <img src={calendarIcon} className='calendar-icon' />
                                    <div className="date">{moment(serviceMasterData?.Filter?.FromDate).format('MMM DD,YY')} - {moment(serviceMasterData?.Filter?.ToDate).format('MMM DD,YY')}</div>
                                </div> */}
                                <div className="d-flex justify-content-between mt-4">
                                    <div className="card-box-service">
                                        <div className="d-flex">
                                            <img src={InactiveIcon} className='card-icon' />
                                            <div className="count">{serviceMasterData?.Data && serviceMasterData?.Data[0]?.SMInYearCount}</div>
                                        </div>
                                        <div className="title">Current Year</div>
                                    </div>
                                    <div className="card-box-service">
                                        <div className="d-flex">
                                            <img src={InactiveIcon} className='card-icon' />
                                            <div className="count">{serviceMasterData?.Data && serviceMasterData?.Data[0]?.SMInMonthCount}</div>
                                        </div>
                                        <div className="title">Current Month</div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div className="updated-date">Last Updated - {HelperService.getFormatedDateAndTime(serviceMasterData?.LastRefreshedDateTime)}</div>
                                    <img onClick={()=>getServiceMasterDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                </div>
                            </>
                    }

                </div>
            </div>
        </>
    )
}

export default NewServiceMaster;