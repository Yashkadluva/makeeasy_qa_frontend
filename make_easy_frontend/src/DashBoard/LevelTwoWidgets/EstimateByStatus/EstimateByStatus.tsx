import './EstimateByStatus.scss';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import { useRef, useState } from 'react';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import SawinSelect from '../../../../components/Select/SawinSelect';

const EstimateByStatus = () => {
    const barChartRef = useRef<Chart | null>(null);
    const barChartRef1 = useRef<Chart | null>(null);
    const [duration, setDuration] = useState<any>("");

    const horizontalCanvas = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (barChartRef.current) {
            barChartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            barChartRef.current = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ['Sold', 'Quoted'],
                    datasets: [
                        {
                            data: [20, 80],
                            backgroundColor: ["#4AC125", "#FFBE00"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                        }
                    },
                    cutoutPercentage: 65,
                    legend: {
                        display: false
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                display: false
                            },
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: false,
                                labelString: "Amount"
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                display: false
                            },
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

    const horizontalCanvas1 = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (barChartRef1.current) {
            barChartRef1.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            barChartRef1.current = new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels: ['Contract With Customer', 'Contract Without Customer'],
                    datasets: [
                        {
                            data: [2478, 0],
                            backgroundColor: ["#FFBE00", "#D0DBFF"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                        }
                    },
                    cutoutPercentage: 65,
                    legend: {
                        display: false
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                display: false
                            },
                            gridLines: {
                                display: false
                            },
                            scaleLabel: {
                                display: false,
                                labelString: "Amount"
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                display: false
                            },
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

    const DurationDataSource: any = [
        {
            value: 'Last 7 Days',
            id: '7 Days',
            days: '7'
        },
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
            <div className="col-12 mt-2 estimate-by-status">
                <div className='card'>
                    <div className="d-flex justify-content-between">
                        <div className='d-flex  dropdown-div'>
                            <p className="name">Estimate By Status</p>
                            <div className="form-style ms-2 mt-1 duration-dropdown-div">
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

                    <div className="horizontalLine" />

                    <div className='row'>
                        <div className='col-md-2 p-4'>
                            <div className="d-flex">
                                <div className="vertical-line-div-green"></div>
                                <div>
                                    <div className='font-15'>Total Quotes</div>
                                    <div className='text-green'> 14</div>
                                </div>
                            </div>
                            <div className="mt-3 row">
                                <div className="d-flex col-6" >
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#4AC125" }}></div>
                                    <div>
                                        <div className=''>Sold</div>
                                        <div className='count-text' style={{ color: "#4AC125" }}> 5</div>
                                    </div>
                                </div>
                                <div className="d-flex col-6">
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#FFBE00" }}></div>
                                    <div>
                                        <div className=''>Quoted</div>
                                        <div className='count-text' style={{ color: "#FFBE00" }}> 5</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 row">
                                <div className="d-flex col-6" >
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#2395FF" }}></div>
                                    <div>
                                        <div className=''>Expired</div>
                                        <div className='count-text' style={{ color: "#2395FF" }}> 1</div>
                                    </div>
                                </div>
                                <div className="d-flex col-6">
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#EE3B33" }}></div>
                                    <div>
                                        <div className=''>Rejected</div>
                                        <div className='count-text' style={{ color: "#EE3B33" }}> 1</div>
                                    </div>
                                </div>
                            </div>



                        </div>
                        <div className='col-md-2 d-flex align-center mt-4 p-0'>
                            <canvas ref={horizontalCanvas} height={180} width={180}
                            ></canvas>
                        </div>
                        <div className='col-md-2 p-4'>
                            <div className="d-flex">
                                <div className="vertical-line-div-green"></div>
                                <div>
                                    <div className='font-15'>Total Amount</div>
                                    <div className='text-green'>$ 40.50</div>
                                </div>
                            </div>
                            <div className="mt-3 row">
                                <div className="d-flex col-6" >
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#4AC125" }}></div>
                                    <div>
                                        <div className=''>Sold</div>
                                        <div className='count-text' style={{ color: "#4AC125" }}> $ 0.00</div>
                                    </div>
                                </div>
                                <div className="d-flex col-6">
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#FFBE00" }}></div>
                                    <div>
                                        <div className=''>Quoted</div>
                                        <div className='count-text' style={{ color: "#FFBE00" }}> $ 4.50</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 row">
                                <div className="d-flex col-6" >
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#2395FF" }}></div>
                                    <div>
                                        <div className=''>Expired</div>
                                        <div className='count-text' style={{ color: "#2395FF" }}> $ 0.00</div>
                                    </div>
                                </div>
                                <div className="d-flex col-6">
                                    <div className="vertical-line-div-black" style={{ backgroundColor: "#EE3B33" }}></div>
                                    <div>
                                        <div className=''>Rejected</div>
                                        <div className='count-text' style={{ color: "#EE3B33" }}> $ 0.00</div>
                                    </div>
                                </div>
                            </div>



                        </div>
                        <div className='col-md-2 d-flex align-center mt-4 p-0'>
                            <canvas ref={horizontalCanvas1} height={180} width={180}
                            ></canvas>
                        </div>
                        <div className='col-md-4 p-4 final-quote-count-div' >
                            <div className="">
                                <div className='text-green text-center'> $ 0.00%</div>
                                <span className='text-black text-center'> Convorsion Rate (<span className='count-text' style={{ color: "#EE3B33" }}>0.00%</span>)</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between">
                        <div className="d-flex ms-3">
                            <img src={calendarIcon} width={18} />
                            <div className="date">Dec 17, 22 - Feb 15, 23</div>
                        </div>
                        <div className="d-flex">
                            <div className="updated-date">Last Updated - 02/15/23 12:24 AM  <img src={refresh} className='refresh-icon cursor-pointer ms-2' /></div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default EstimateByStatus;