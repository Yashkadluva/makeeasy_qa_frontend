import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import { Button, Row, Col } from 'react-bootstrap';
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import Grid, { GridRow, GridHeader, GridColumn } from "../../../../components/Grid/Grid";
import Chart from "chart.js";

interface PropData {
    data: any;
    activeTab: any;
}

const headers = [
    {
        title: "",
        isSorting: false,
    },
    {
        title: "Material",
        class: "text-end",
    },
    {
        title: "Labor",
        class: "text-end",
    },
    {
        title: "Miscellaneous",
        class: "text-end",
    },
    {
        title: "Total",
        class: "text-end",
    },
];


const ContractProfitability = (props: PropData) => {
    const chartRef = useRef<Chart | null>(null);
    const [ShowLoader, setShowLoader] = useState(false);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [rows, setRows] = useState<GridRow[]>([]);
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);

    useEffect(() => {
        if (props.data && props?.activeTab == "TabProfitability") {
            getProfitability()
        }
    }, [props.data, props.activeTab]);

    const [costData, setCostData] = useState([]);
    const [salesData, setSalesData] = useState([]);

    const formatData = (): Chart.ChartData => ({
        labels: ["Material", "Labor", "Miscellaneous", "Total"],
        datasets: [
            {
                data: salesData, backgroundColor: "#EE3B33", label: "Sales", categoryPercentage: 0.4,
                barPercentage: 0.60
            }, {
                data: costData, backgroundColor: "#33C046", label: "Cost", categoryPercentage: 0.4,
                barPercentage: 0.60
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
                type: "bar",
                data: formatData(),
                options: {
                    responsive: true, legend: {
                        position: "bottom", labels: {
                            boxWidth: 12
                        }
                    }, scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: "Amount"
                            }
                        }]
                    },
                }
            }
            );
        }
    };

    const getProfitability = () => {
        setShowLoader(true);
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            SDServiceMasterId: props?.data?.Contract?.ServiceMasterNum,
            ContractNum: props?.data?.Contract?.ContractNum
        }
        WebService.postAPI({
            action: `SaiSDContract/GetContractProfitability`,
            body: requestBody
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: GridRow[] = [];
                let columns: GridColumn[] = [];
                let costArray: any = []
                let salesArray: any = []
                costArray.push(res?.Cost?.Material)
                costArray.push(res?.Cost?.Labor)
                costArray.push(res?.Cost?.OtherAmount)
                costArray.push(res?.Cost?.Total);
                setCostData(costArray)
                salesArray.push(res?.Sales?.Material)
                salesArray.push(res?.Sales?.Labor)
                salesArray.push(res?.Sales?.OtherAmount)
                salesArray.push(res?.Sales?.Total);
                setSalesData(salesArray)

                columns.push({ value: "Cost" })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Cost?.Material) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Cost?.Labor) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Cost?.OtherAmount) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Cost?.Total) });
                rows.push({ data: columns });
                columns = [];
                columns.push({ value: "Sales" })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Sales?.Material) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Sales?.Labor) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Sales?.OtherAmount) })
                columns.push({ value: HelperService.getCurrencyFormatter(res?.Sales?.Total) });
                rows.push({ data: columns });
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false);
            })
    }

    return <>
        <div className='mb-4'>
            <Row>
                <Col md={12} id="wideCol">
                    <div className=" mt-3">
                        <canvas ref={canvasCallback}
            height="100"></canvas>
                    </div>
                    <div className="equipment-grid mt-2">
                        <Grid
                            headers={gridHeader}
                            rows={rows}
                            ShowLoader={ShowLoader}
                            // storeKey={componentKey}
                            // isColumn={true}
                            errorMessage={'No Profitability Found'}
                            hoverRow={true} />
                    </div>
                </Col>
            </Row>
        </div>

    </>;
};

export default ContractProfitability;



