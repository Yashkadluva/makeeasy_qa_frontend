import './CustomerWithContract.scss';
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import { useEffect, useRef } from 'react';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const CustomerWithContract = (props: PropData) => {
    const barChartRef = useRef<Chart | null>(null);


    useEffect(() => {
        // getTopCustomerDetail()
    }, [props.isReload]);


    const data: any = {
        "AccountId": "340",
        "CompanyId": "1",
        "userID": "58",
        "WidgetCode": "CustomerWithContractDetail",
        "UserName": "baseuser@mailinator.com",
        "RefreshData": "true"
    }

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
                            data: [41, 2478],
                            backgroundColor: ["#435BAA", "#D0DBFF"],
                        },
                    ],
                },
                options: {
                    responsive: true,
                    layout: {
                        padding: {
                            left: 10,
                            top: 10
                        }
                    },
                    cutoutPercentage: 75,
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
    }
    return (
        <>
            <div className="col-3 mt-2 customer-with-contract">
                <div className='card'>
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="name">Customer With Contract</p>
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
                                <Dropdown.Item onClick={() => props.selectOption(data, "Details")}>
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
                    <div className='d-flex'>
                        <div>
                            <div className='active-customer-count'>2221</div>
                            <div className='total-customer-title'>Total Customers</div>

                            <div className='d-flex ms-2'>
                                <div className='round-circle' />
                                <div className='active-contract-text'>Active Contracts</div>
                            </div>
                        </div>
                        <div>
                            <canvas ref={horizontalCanvas} height={260}
                            ></canvas>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end">
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

export default CustomerWithContract;