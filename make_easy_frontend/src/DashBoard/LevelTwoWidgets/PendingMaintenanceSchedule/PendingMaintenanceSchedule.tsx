import { useState, useRef } from 'react';
import './PendingMaintenanceSchedule.scss';
import loader from "../../../../assets/images/loader.gif";
import { Dropdown } from "react-bootstrap";
import dot from '../../../../assets/images/dot-icon.svg';
import Chart from "chart.js";
import calendarIcon from '../../../../assets/images/calendar.svg';
import refresh from '../../../../assets/images/dashboard-refresh.svg';

interface PropData {
    selectOption: any;
    isReload: any;
    WidgetCode: any;
};

const PendingMaintenanceSchedule = (props: PropData) => {
    const [showLoader, setShowLoader] = useState(false);
    const chartRef = useRef<Chart | null>(null);
    const [costData, setCostData] = useState([20,30,50,20,75]);
    const [salesData, setSalesData] = useState([65,58,12,20,45]);

    const formatData = (): Chart.ChartData => ({
        labels: ["March", "April", "May"],
        datasets: [
            {
                data: salesData, backgroundColor: "#8FE53E", label: "Sales", categoryPercentage: 0.5,
                barPercentage: 0.80
            }, {
                data: costData, backgroundColor: "#E8CD43", label: "Cost", categoryPercentage: 0.5,
                barPercentage: 0.80
            }, {
                data: costData, backgroundColor: "#2CF630", label: "Cost", categoryPercentage: 0.5,
                barPercentage: 0.80
            }, {
                data: costData, backgroundColor: "#2CF695", label: "Cost", categoryPercentage: 0.5,
                barPercentage: 0.80
            }, {
                data: costData, backgroundColor: "#1F8A28", label: "Cost", categoryPercentage: 0.5,
                barPercentage: 0.80
            }
        ]
    });

    const data: any = {
        "AccountId": "340",
        "CompanyId": "1",
        "userID": "58",
        "WidgetCode": "PendingMaintenanceSchedulDetail",
        "UserName": "baseuser@mailinator.com",
        "RefreshData": "true"
    }
    

    const canvasCallback = (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return;
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        const ctx = canvas.getContext("2d");
        if (ctx) {
            chartRef.current = new Chart(ctx, {
                type: "bar",
                data: formatData(),
                options: {
                    responsive: true, legend: {
                        position: "bottom", labels: {
                            boxWidth: 15
                        },display:false
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            scaleLabel: {
                                display: true,
                            }
                        }]
                    },
                    layout: {
                        padding: 0
                    }
                }
            }
            );
        }
    };

    return (
        <>
            <div className="col-6 mt-2 pending-maintenance-schedule">
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
                                        <p className="name">Pending maintenance Schedule</p>
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
                                    <div className='d-flex'>
                                        <div className='count'>45</div>
                                        <div className='month'>Mar</div>
                                    </div>
                                    <div className='d-flex'>
                                        <div className='count'>46</div>
                                        <div className='month'>Apr</div>
                                    </div>
                                    <div className='d-flex'>
                                        <div className='count'>49</div>
                                        <div className='month'>May</div>
                                    </div>
                                </div>
                                <div className='d-flex'>
                                    <div className='w-75'>
                                        <canvas ref={canvasCallback} width={200} height={63}
                                        ></canvas>
                                    </div>
                                    <div className='ms-4'>
                                        <div className='d-flex mt-2'>
                                            <div className='box' style={{ backgroundColor: '#8FE53E' }} />
                                            <div className='label-text'>Commercial PM</div>
                                        </div>
                                        <div className='d-flex mt-2'>
                                            <div className='box' style={{ backgroundColor: '#E8CD43' }} />
                                            <div className='label-text'>Residential Service</div>
                                        </div>
                                        <div className='d-flex mt-2'>
                                            <div className='box' style={{ backgroundColor: '#2CF630' }} />
                                            <div className='label-text'>Commercial Reserve Pm</div>
                                        </div>
                                        <div className='d-flex mt-2'>
                                            <div className='box' style={{ backgroundColor: '#2CF695' }} />
                                            <div className='label-text'>Residental Pm</div>
                                        </div>
                                        <div className='d-flex mt-2'>
                                            <div className='box' style={{ backgroundColor: '#1F8A28' }} />
                                            <div className='label-text'>Residential Reserve Pm</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                    <div className="d-flex">
                                        <div className="updated-date me-1 mt-2">Last Updated - 02/15/23 12:24 AM</div>
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

export default PendingMaintenanceSchedule;