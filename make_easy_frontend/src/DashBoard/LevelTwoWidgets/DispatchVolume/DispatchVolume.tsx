
import './DispatchVolume.scss';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import { useEffect, useRef, useState } from 'react';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import WebService from '../../../../utility/WebService';
import moment from 'moment';
import loader from "../../../../assets/images/loader.gif";
import HelperService from '../../../../utility/HelperService';
import SawinSelect from '../../../../components/Select/SawinSelect';

interface PropData {
    // selectOption: any;
    // isReload: any;
    // WidgetCode: any;
};

const DispatchVolume = (props: PropData) => {
    const chartRef = useRef<Chart | null>(null);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [topCustometDetail, setTopCustometDetail] = useState<any>({});
    const [topCustometData, setTopCustometData] = useState<any>({});
    const [lables, setLables] = useState<any[]>([]);
    const [amount, setAmount] = useState<any[]>([]);
    const [duration, setDuration] = useState<any>("");
    const startDate = useRef<any>();
    const [costData, setCostData] = useState([]);
    const [salesData, setSalesData] = useState([30,0,50,10]);

    // useEffect(() => {
    //     getTopCustomerDetail()
    // }, [props.isReload]);

    const getTopCustomerDetail = (e?: any) => {
        // setShowLoader(true)
        // WebService.getAPI({
        //     action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/TopFiveRevenueMakingCustomersFilter`,
        // })
        //     .then((res: any) => {
        //         console.log("5res", res);
        //         let temp: any = JSON.parse(res.value);
        //         startDate.current = temp?.value?.StartDate
        //         setDuration(temp.Duration)
        //         res.value = temp;
        //         setTopCustometDetail(res)
        //         getInactiveCustomerCount(temp, e)
        //     })
        //     .catch((e) => {
        //         setShowLoader(false)
        //     })
    };

    // const getInactiveCustomerCount = (data: any, e?: boolean) => {
    //     WebService.postAPI({
    //         action: `SaiUserWidget/GetTopFiveRevenueCustomersWidgetData`,
    //         body: {
    //             AccountId: user_info["AccountId"],
    //             CompanyId: user_info["CompanyId"],
    //             userID: user_info["userID"],
    //             WidgetCode: 'TopFiveCustomersWithMaxArBalance',
    //             UserName: user_info["userName"],
    //             RefreshData: 'true',
    //             Filter: {
    //                 Duration: data.Duration,
    //                 FromDate: `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
    //                 ToDate: `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
    //             }
    //         }
    //     })
    //         .then((res: any) => {
    //             setShowLoader(false);

    //             setTopCustometData(res)
    //             if (res.Data.length > 0) {
    //                 let labelTemp: any = [];
    //                 let ammTemp: any = [];
    //                 res.Data.map((item: any) => {
    //                     labelTemp.push(item.Name)
    //                     ammTemp.push(item.TotalSale)
    //                 });
    //                 setLables(labelTemp);
    //                 setAmount(ammTemp);
    //             }
    //         })
    //         .catch((e) => {
    //             setShowLoader(false)
    //         })
    // };

    const formatData = (): Chart.ChartData => ({
        labels: ["01/1", "01/2", "01/3","01/4","01/5","01/6","01/7"],
        datasets: [
            {
                data: salesData, backgroundColor: "#EBEBFF", categoryPercentage: 0.5,
                barPercentage: 0.50
            }]
    });

    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            chartRef.current = new Chart(ctx, {
                type: "line",
                data: formatData(),
                options: {
                    responsive: true, legend: {
                        position: "bottom", labels: {
                            boxWidth: 12,
                            
                        },display : false   
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            scaleLabel: {
                                display: false,
                            }
                        }]
                    },
                }
            }
            );
        }
    };

    const DurationDataSource: any = [
        {
            value: 'Current Day',
            id: '7 Days',
            days: '1'
        },
        {
            value: 'Previous Day',
            id: '15 Days',
            days: '-1'
        },
        {
            value: 'Custom',
            id: 'Custom'
        }
    ];


    const onChangeDuration = (data: any) => {
        // if (data.id == "Custom") return
        // var date = moment(new Date()).subtract(data.days, 'd').format("MM/DD/YYYY");
        // startDate.current = date;
        // let temp: any = {
        //     Duration: data.id,
        //     StartDate: date,
        //     EndDate: HelperService.getFormatedDateAndTime(new Date())
        // }
        // setDuration(data.id);
        // getInactiveCustomerCount(temp, true)
    }

    return (
        <>
            <div className="col-6 mt-2 dispatch-volume">
                <div className='card'>

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
                                    <div className='d-flex dropdown-divv'>
                                        <p className="name">Dispatch Volume</p>
                                        <div className="form-style ms-2 mt-1 duration-dropdown">
                                            <SawinSelect
                                                options={DurationDataSource}
                                                selected={duration}
                                                onChange={(data: any) => {
                                                    onChangeDuration(data);
                                                }}
                                            />
                                        </div>
                                        <div className="form-style ms-2 mt-1 duration-dropdown">
                                            <SawinSelect
                                                options={DurationDataSource}
                                                selected={duration}
                                                onChange={(data: any) => {
                                                    onChangeDuration(data);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Dropdown className="action-dd mt-2 ">
                                        <Dropdown.Toggle id="dropdown-basic">
                                            <img src={dot} className='dot' />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>
                                                {" "}
                                                Remove
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                {" "}
                                                Details
                                            </Dropdown.Item>
                                            <Dropdown.Item>
                                                {" "}
                                                Schedule Email
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                                <div className="horizontalLine mb-3" />

                                <canvas ref={canvasCallback} width={200} height={60}
                                ></canvas>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        
                                    </div>
                                    <div className="d-flex">
                                        <div className="updated-date me-2">Last Updated - {HelperService.getFormatedDateAndTime(topCustometData?.LastRefreshedDateTime)}</div>
                                        <img onClick={() => getTopCustomerDetail(true)} src={refresh} className='refresh-icon cursor-pointer' />
                                    </div>
                                </div>
                            </>
                    }



                </div>
            </div>
        </>
    )
}

export default DispatchVolume;