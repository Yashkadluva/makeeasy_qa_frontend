import './PortalSetupVsLogged.scss';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import { useRef, useState } from 'react';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';
import SawinSelect from '../../../../components/Select/SawinSelect';

const PortalSetupVsLogged = () => {
    const barChartRef = useRef<Chart | null>(null);
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
                    labels: ['Contract With Customer', 'Contract Without Customer'],
                    datasets: [
                        {
                            data: [2478, 0],
                            backgroundColor: ["#4AC125", "#D0DBFF"],
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
            <div className="col-3 mt-2 customer-with-contract">
                <div className='card'>
                    <div className="d-flex justify-content-between">
                        <div className='d-flex dropdown-div'>
                            <p className="name">Customer With Contract</p>
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
                    <div className="horizontalLine" />
                    <div className='row p-4'>
                        <div className='col-md-6 p-0'>
                            <div className="d-flex">
                                <div className="vertical-line-div-green"></div>
                                <div>
                                    <div className='small'>Portal Logged In</div>
                                    <div className='text-green'> 1</div>
                                </div>
                            </div>
                            <div className="d-flex mt-4">
                                <div className="vertical-line-div-black"></div>
                                <div>
                                    <div className='small'>Customers Setup</div>
                                    <div className='text-black'> 1</div>
                                </div>
                            </div>
                            <div className='d-flex ms-2'>
                                <div className='round-circle' />
                                <div className='active-contract-text'>Portal Logged In</div>
                            </div>


                        </div>
                        <div className='col-md-6 d-flex align-center mt-3 p-0'>
                            <canvas ref={horizontalCanvas} height={180} width={180}
                            ></canvas>
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

export default PortalSetupVsLogged;