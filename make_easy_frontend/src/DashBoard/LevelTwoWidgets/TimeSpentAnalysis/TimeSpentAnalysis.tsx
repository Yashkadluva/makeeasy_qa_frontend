import { useState, useRef } from 'react';
import './TimeSpentAnalysis.scss';
import loader from "../../../../assets/images/loader.gif";
import SawinSelect from '../../../../components/Select/SawinSelect';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';

const DurationDataSource: any = [
    {
        value: 'Last 15 Days',
        id: '15 Days',
        days: '15'
    },
    {
        value: 'Last 30 Days',
        id: '30 Days',
        days: '30'
    },
    {
        value: 'Last 45 Days',
        id: '45 Days',
        days: '45'
    },
    {
        value: 'Last 60 Days',
        id: '60 Days',
        days: '60'
    },
    {
        value: 'Last 90 Days',
        id: '90 Days',
        days: '90'
    },
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

const TimeSpentAnalysis = () => {
    const [showLoader, setShowLoader] = useState(false);
    const [duration, setDuration] = useState<any>("");
    const chartRef = useRef<Chart | null>(null);

    const onChangeDuration = (data: any) => { }

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
                    labels: ['Haycraft Claudia', 'Hornsby Carl', 'Sanders Farrell', 'Stewart Guy', 'Han Mike'],
                    datasets: [{
                        label: 'Washing and cleaning',
                        data: [0, 5],
                        backgroundColor: '#D81253',
                        barThickness: 15,
                    }, {
                        label: 'Traffic tickets',
                        data: [0, 2],
                        backgroundColor: '#F07928',
                        barThickness: 15,
                    }, {
                        label: 'Tolls',
                        data: [0, 1],
                        backgroundColor: '#3B5AAF',
                        barThickness: 15,
                    },]

                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10,
                            right: 20
                        }
                    },
                    legend: {
                        display: false
                    },
                    scales: {
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
                            stacked: true,

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
                            stacked: true,

                        }]
                    },
                }
            }
            );
        }
    };

    return (
        <>
            <div className="col-6 mt-2 time-spent-analysis">
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
                                        <p className="name">Time Spent Analysis</p>
                                        <div className="form-style ms-2 mt-1 duration-dropdown">
                                            <SawinSelect
                                                options={DurationDataSource}
                                                selected={duration}
                                                onChange={(data: any) => {
                                                    onChangeDuration(data);
                                                }}
                                            />
                                        </div>
                                        <div className='d-flex'>
                                            <div className='work-hour-view' style={{ backgroundColor: '#D81253' }} />
                                            <div className='ms-3 mt-2 me-4 label-text'>Work Hours</div>
                                            <div className='work-hour-view' style={{ backgroundColor: '#F07928' }} />
                                            <div className='ms-4 mt-2 me-4 label-text'>Wait Hours</div>
                                            <div className='work-hour-view' style={{ backgroundColor: '#3B5AAF' }} />
                                            <div className='ms-4 mt-2 me-4 label-text'>Drive Hours</div>
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
                                <div className="horizontalLine" />

                                <canvas ref={canvasCallback} width={200} height={60}
                                ></canvas>
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex ms-3">
                                        <img src={calendarIcon} width={18} className='mt-2' />
                                        <div className="date">Dec 17, 22 - Feb 15, 23</div>
                                    </div>
                                    <div className="d-flex">
                                        <div className="updated-date me-2">Last Updated - 02/15/23 12:24 AM</div>
                                        <img src={refresh} className='refresh-icon cursor-pointer mt-2' />
                                    </div>
                                </div>
                            </>
                    }
                </div>
            </div>
        </>
    )
}

export default TimeSpentAnalysis;