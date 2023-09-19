import './CallsByServiceType.scss';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import { useEffect, useRef, useState } from 'react';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import WebService from '../../../../utility/WebService';

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};


const CallsByServiceType = (props: PropData) => {
    const barChartRef = useRef<Chart | null>(null);
    const [showLoader, setShowLoader] = useState(false);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [serviceTypeDetail, setServiceTypeDetail] = useState<any>({});

    useEffect(() => {
        getServiceTypeDetail()
    }, [props.isReload])

    const getServiceTypeDetail = () => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/ServiceCallsCountByServiceTypeFilter`,
        })
            .then((res: any) => {
                setServiceTypeDetail(res)
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const callServiceCanvas = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (barChartRef.current) {
            barChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            barChartRef.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["CIN...", "CPM", "CPU...", "CRP...", "CSV...", "CWA...", "dth", "OFF...", "RIN...", "RPM...", "RRP...", "RSV..."],
                    datasets: [
                        {
                            data: [65, 59, 80, 81, 56, 55, 40, 45, 12, 78, 56, 35],
                            backgroundColor: ["#3EC7E5", "#E8E143", "#F62CCA", "#91F62C", "#2E1F8A", "#EE3B33", "#7BFF8D", "#FFDDA9", "#FF9900", "#2CF695", "#1F8A28", "#0A3FF6"],
                            barThickness: 18,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10,
                            top: 10
                        }
                    },
                    legend: {
                        display: false
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },

                            scaleLabel: {
                                display: false,
                                labelString: "Amount"
                            }
                        }],
                        xAxes: [{
                            gridLines: {
                                display: false
                            },
                        }]
                    },
                }
            }
            );
        }
    };

    return (
        <>
            <div className="col-3 mt-2 calls-by-service-type">
                <div className='card'>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="name">Calls By Service Type</p>
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
                                <Dropdown.Item onClick={() => props.selectOption(serviceTypeDetail, "Details")}>
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
                    <canvas ref={callServiceCanvas} height={260}
                    ></canvas>
                    <div className="d-flex justify-content-between">
                        <div className="d-flex">
                            <img src={calendarIcon} className='calendar-icon' />
                            <div className="date">Dec 17, 22 - Feb 15, 23</div>
                        </div>
                        <div className="d-flex">
                            <div className="updated-date">Last Updated - 02/15/23 12:24 AM</div>
                            <img src={refresh} className='refresh-icon cursor-pointer ms-2' />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CallsByServiceType;