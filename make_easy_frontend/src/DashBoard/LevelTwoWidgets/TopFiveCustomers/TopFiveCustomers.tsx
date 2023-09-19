import './TopFiveCustomers.scss';
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
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const TopFiveCustomers = (props: PropData) => {
    const chartRef = useRef<Chart | null>(null);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [topCustometDetail, setTopCustometDetail] = useState<any>({});
    const [topCustometData, setTopCustometData] = useState<any>({});
    const [lables, setLables] = useState<any[]>([]);
    const [amount, setAmount] = useState<any[]>([]);
    const [duration, setDuration] = useState<any>("");
    const startDate = useRef<any>()

    useEffect(() => {
        getTopCustomerDetail()
    }, [props.isReload]);

    const getTopCustomerDetail = (e?: any) => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/TopFiveRevenueMakingCustomersFilter`,
        })
            .then((res: any) => {
                console.log("5res", res);
                let temp: any = JSON.parse(res.value);
                startDate.current = temp?.value?.StartDate
                setDuration(temp.Duration)
                res.value = temp;
                setTopCustometDetail(res)
                getInactiveCustomerCount(temp, e)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const getInactiveCustomerCount = (data: any, e?: boolean) => {
        WebService.postAPI({
            action: `SaiUserWidget/GetTopFiveRevenueCustomersWidgetData`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                userID: user_info["userID"],
                WidgetCode: 'TopFiveCustomersWithMaxArBalance',
                UserName: user_info["userName"],
                RefreshData: 'true',
                Filter: {
                    Duration: data.Duration,
                    FromDate: `${moment(data.StartDate, 'MM/DD/YYYY').format('YYYY-M-D')} 0:0:0`,
                    ToDate: `${moment(data.EndDate, 'MM/DD/YYYY').format('YYYY-M-D')} 23:59:59`,
                }
            }
        })
            .then((res: any) => {
                setShowLoader(false);

                setTopCustometData(res)
                if (res.Data.length > 0) {
                    let labelTemp: any = [];
                    let ammTemp: any = [];
                    res.Data.map((item: any) => {
                        labelTemp.push(item.Name)
                        ammTemp.push(item.TotalSale)
                    });
                    setLables(labelTemp);
                    setAmount(ammTemp);
                }
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            chartRef.current = new Chart(ctx, {
                type: "horizontalBar",
                data: {
                    labels: lables,
                    datasets: [
                        {
                            data: amount,
                            backgroundColor: ["#8CEAA3", "#8CEAA3", "#8CEAA3", "#8CEAA3", "#8CEAA3"],
                            barThickness: 15,
                            borderCapStyle: "round",
                            radius: 15

                        },

                    ],

                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10
                        }
                    },
                    legend: {
                        display: false
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: false,
                                labelString: "Amount"
                            },
                        }],
                        xAxes: [{
                            scaleLabel: {
                                display: false
                            },
                            gridLines: {
                                display: true,
                                drawBorder: true,
                                borderDash: [5]
                            },

                        }]
                    },
                }
            }
            );
        }
    };

    const DurationDataSource: any = [
        {
            value: 'Last 120 Days',
            id: '120 Days',
            days: '120'
        },
        {
            value: 'Last 1 Year',
            id: '1 Year',
            days: '365'
        },
        {
            value: 'Custom',
            id: 'Custom'
        }
    ];


    const onChangeDuration = (data: any) => {
        if (data.id == "Custom") return
        var date = moment(new Date()).subtract(data.days, 'd').format("MM/DD/YYYY");
        startDate.current = date;
        let temp: any = {
            Duration: data.id,
            StartDate: date,
            EndDate: HelperService.getFormatedDateAndTime(new Date())
        }
        setDuration(data.id);
        getInactiveCustomerCount(temp, true)
    }

    return (
        <>
            <div className="col-6 mt-2 top-five-customers">
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
                                    <div className='d-flex justify-content-between dropdown-div'>
                                        <p className="name">Top 5 Customers</p>
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
                                            <Dropdown.Item onClick={()=>props.selectOption(topCustometDetail,"Details")}>
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
                                <div className="horizontalLine" />

                                <canvas ref={canvasCallback} width={200} height={60}
                                ></canvas>
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex ms-3">
                                        <img src={calendarIcon} width={18} />
                                        <div className="date">{topCustometData?.Filter && moment(topCustometData?.Filter?.FromDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')} - {topCustometData?.Filter && moment(topCustometData?.Filter?.ToDate, 'YYYY-MM-DD hh:mm:ss').format('MMM DD,YY')}</div>
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

export default TopFiveCustomers;