import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Grid, {GridColumn,GridHeader,GridRow,} from "../../../../components/Grid/Grid";
import WebService from "../../../../utility/WebService";
import { getPreference } from "../../../../utility/CommonApiCall";
import HelperService from "../../../../utility/HelperService";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import AttachEquipmentModal from "../../../../components/AttachEquipmentModal/AttachEquipmentModal";
import {  useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
const componentKey = "EntityGeneralInfoEquipments";


interface PropData {
    data: any;
    activeTab: any;
}

const ContractEquipments = (props: PropData) => {

    const headers: GridHeader[] = [
        {
            title: "Model",
        },
        {
            title: "Manufacturer",
        },
        {
            title: "Description",
            class: "text-start description-text",
        },
        {
            title: "Serial #",
        },
        {
            title: "System",
        },  
        {
            title: "Location",
        },
        {
            title: "Unit",
        },
        {
            title: "Part Warr. Date",
            class : "text-center"
        },
        {
            title: "Labor Warr. Date",
            class : "text-center"
        }, 
    ];
    const dispatch: Dispatch<any> = useDispatch();
    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [ShowLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showAttachEquipmentModal, setshowAttachEquipmentModal] = useState(false)
    const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");



    useEffect(() => {
        if (props.data && props?.activeTab == "TabEquipment") {
            props.data?.EquipmentGridData.length > 0 && rows.length == 0 && listEquipments(props.data?.EquipmentGridData)
            props.data?.EquipmentGridData.length > 0 && rows.length !== 0 && getEquipmentList()
        getUserPreference();
        }
    }, [props.data, props.activeTab]);

    const getUserPreference = () => {
        getPreference({ key: componentKey, user_info })
            .then((res: any) => {
                if (res.value && res.value.length > 10) {
                    let temp: GridHeader[] = JSON.parse(res.value);
                    if (temp.length > 1) {
                        setHeader(temp);
                    }
                }
            })
            .catch((e: any) => { });
    };

    const listEquipments = (res:any) => {
        let rows: GridRow[] = [];
        var array = [];
        console.log(res)
        for (var i in res) {
            let columns: GridColumn[] = [];
            columns.push({ value: res[i].EqpModel });
            columns.push({ value: res[i].EqpManufacturer });
            columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
            columns.push({ value: res[i].SerialNo });
            columns.push({ value: res[i].System });
            columns.push({ value: res[i].Location });
            columns.push({ value: res[i].Unit });
            columns.push({ value: res[i].PartWarrantyDate && HelperService.getFormatedDate(res[i].PartWarrantyDate) });
            columns.push({ value: res[i].LaborWarrantyDate && HelperService.getFormatedDate(res[i].LaborWarrantyDate)});
            rows.push({ data: columns });
            array.push(res[i])
        }
        setRows(rows);
        setSelectedEquipment(array)
    }

    const getEquipmentList = () => {
        setShowLoader(true);
        WebService.getAPI({
            action: `SaiSDContractEquipment/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.data?.Contract?.ContractNum}/${props?.data?.Contract?.ServiceMasterNum}`,
            body: null
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: GridRow[] = [];
                var array = [];
                for (var i in res) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: res[i].EqpModel });
                    columns.push({ value: res[i].EqpManufacturer });
                    columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
                    columns.push({ value: res[i].SerialNo });
                    columns.push({ value: res[i].System });
                    columns.push({ value: res[i].Location });
                    columns.push({ value: res[i].Unit });
                    columns.push({ value: res[i].PartWarrantyDate && HelperService.getFormatedDate(res[i].PartWarrantyDate) });
                    columns.push({ value: res[i].LaborWarrantyDate && HelperService.getFormatedDate(res[i].LaborWarrantyDate)});
                    rows.push({ data: columns });
                    array.push(res[i])
                }
                setRows(rows);
                setSelectedEquipment(array)
            })
            .catch((e) => {
                setShowLoader(false);
            })
    }

    const closeAttachEquipment = (e: any, type: any, data: any, hasChange: boolean) => {
        setshowAttachEquipmentModal(false);
        if (type == 'SAVE') {
            dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
        }
    }

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a
                    className="
    grid-hypper-link"
                    onClick={() => viewFullDescription(e)}
                >
                    {e}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    const closeDescription = (value: any) => {
        setIsShowDescription(value);
    };

    return <>
        <DescriptionModal
            isShow={isShowDescription}
            title="Description"
            isClose={closeDescription}
            data={descriptionData}
        />
        <AttachEquipmentModal
            isShow={showAttachEquipmentModal}
            title="Attach EquipmentModal"
            isClose={closeAttachEquipment}
            selectedData={selectedEquipment}
            Id={showAttachEquipmentModal ? props?.data?.Contract?.ServiceMasterNum : null}
            isShowFooter={true}
            isContractEquipment={true}
            contractEqipmentData={props?.data}
            isHideAddEquipment={true}
        />

        <div className=''>
            <Row>
                <Col md={12} id="wideCol">
                    <div className="text-end mt-2">
                        <Button variant="light" className="btn-brand-light" onClick={() => { setshowAttachEquipmentModal(true) }}>
                            + Attach Equipment
                        </Button>
                    </div>
                    <div className="equipment-grid">
                        <Grid
                            headers={gridHeader}
                            rows={rows}
                            ShowLoader={ShowLoader}
                            storeKey={componentKey}
                            // isColumn={true}
                            errorMessage={'No Equipments Found'}
                            hoverRow={false} />
                    </div>

                </Col>
            </Row>
        </div>

    </>;
};

export default ContractEquipments;



