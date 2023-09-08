import { useState, useEffect, useRef } from "react";
import Editicon from "../../../../assets/images/delete-icon.svg";
import iconPo from "../../../../assets/images/icon-po.svg";
import iconManulEntry from "../../../../assets/images/icon-manual-entry.svg";
import iconQuote from "../../../../assets/images/icon-quote.svg";
import iconSolutionCode from "../../../../assets/images/icon-solution-code.svg";
import iconParts from "../../../../assets/images/icon-parts.svg";
import iconSystem from "../../../../assets/images/icon-system.svg";

import BackComponent from "../../../../components/BackComponent/BackComponent"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import { Envelope, Telephone, Phone, ArrowUpRight, CheckCircleFill, CircleFill } from 'react-bootstrap-icons';
import InvoiceEntryHeader from './InvoiceEntryHeader';
import InvoiceEntryLeftCol from './InvoiceEntryLeftCol';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";

import Grid, {
    GridColumn,
    GridHeader,
    GridRow,
    FilterOption,
    Filter,
} from "../../../../components/Grid/Grid";


import "./InvoiceEntry.scss"
import { FormGroup } from "react-bootstrap";
import WebService from "../../../../utility/WebService";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InviceSDMasterState, InvoiceState } from "../../../../reducer/CommonReducer";
import HelperService from "../../../../utility/HelperService";
import AttachEquipmentModal from "../../../../components/AttachEquipmentModal/AttachEquipmentModal";
import AddEquipmentModal from "../../../../components/AddEquipmentModal/AddEquipmentModal";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";

const InvoiceEntryEquipment = () => {

    const componentKey = "AssociatDepot";
    const headers: GridHeader[] = [
        {
            title: "Manufacturer",
        },
        {
            title: "Model",
        },
        {
            title: "Description",
            class: "text-start description-text",
        },
        {
            title: "Serial #",
        },
        {
            title: "Location",
        },
        {
            title: "System",
        },
        {
            title: "Unit",
        },
    ];

    const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
    const [ShowLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [showAttachEquipmentModal, setshowAttachEquipmentModal] = useState(false)
    const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);
    const editEquipmentData1 = useRef({});
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");

    useEffect(() => {
        getSelectedEquipment()
    }, [])

    let equipId = {
        Id : invoceSDMaster.invoceSDMaster?.SDServiceMasterId,
        ARCustomerMasterId : invoceSDMaster.invoceSDMaster?.ARCustomerMasterId
      }

    const getSelectedEquipment = () => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SDCallMaster/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData.SMNum}/${invoceSDMaster?.invoceSDMaster?.Id}`,
            body: null
        })
            .then((res: any) => {
                getEquipmentList(res.SelectedEquipmentItems)
            })
            .catch((e) => {

            })
    }

    const getEquipmentList = (data: any) => {
        WebService.getAPI({
            action: `SaiSDServiceCallEquipment/GetCallEquipments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}/${invoiceData.invoiceData.SMNum}`,
            body: null
        })
            .then((res: any) => {
                setShowLoader(false);
                let rows: GridRow[] = [];
                var array = [];
                for (var i in res.Data) {
                    for (var j in data) {
                        if (data[j] === res.Data[i].SDEquipmentMasterId) {
                            let columns: GridColumn[] = [];
                            columns.push({ value: res.Data[i].EqpManufacturer });
                            columns.push({ value: res.Data[i].EqpModel });
                            columns.push({ value: showDescription(res.Data[i].Description) });
                            columns.push({ value: res.Data[i].SerialNo });
                            columns.push({ value: res.Data[i].Location });
                            columns.push({ value: res.Data[i].System });
                            columns.push({ value: res.Data[i].Unit });
                            rows.push({ data: columns });
                            array.push(res.Data[i])
                        }
                    }
                }
                setRows(rows);
                setSelectedEquipment(array)
            })
            .catch((e) => {
                setShowLoader(false);
            })
    }
;

    const closeAttachEquipment = (e: any, type: any, data: any) => {
        setshowAttachEquipmentModal(false)
        if (type == "OPEN_EQUIPMENT") {
            setShowAddEquipmentModal(true)
        } else if (type == 'SAVE') {
            getSelectedEquipment()
            onSaveEquipment(data)
        }
    }

    const closeAddEquipment = (value: any) => {
        getSelectedEquipment();
        setShowAddEquipmentModal(value)
        setshowAttachEquipmentModal(true)
    }

    const onSaveEquipment = (data: any) => {
        var requestedBody = {
            SDEquipmentMasters: data
        }
        WebService.putAPI({
            action: `SDInvoice`,
            body: requestedBody
        })
            .then((res) => { })
            .catch((e) => { })
    };

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
            Id={showAttachEquipmentModal ? invoiceData?.invoiceData?.SMNum: null}
            isShowFooter={false}
            SMId={showAttachEquipmentModal ? invoceSDMaster?.invoceSDMaster?.Id: null}
            />
        <AddEquipmentModal
            isShow={showAddEquipmentModal}
            title="Equipment"
            isClose={closeAddEquipment}
            popupData={editEquipmentData1.current}
            equipId={equipId}
        />
        <div className=''>
            <Row>
                <Col md={12} id="wideCol">
                    <BackComponent title={'Equipment'} />
                    <Card className="card-style form-style equipment-card">
                        <Card.Body className=" ">
                            <Row>
                                <Col className="text-end">
                                    <Button variant="light" className="btn-brand-light" onClick={() => { editEquipmentData1.current = {}; setshowAttachEquipmentModal(true) }}>
                                        + Attach Equipment
                                    </Button>
                                </Col>
                            </Row>
                            <Grid headers={gridHeader}
                                rows={rows}
                                ShowLoader={ShowLoader}
                                storeKey={componentKey}
                                errorMessage={'No Data Found'}
                                hoverRow={true} />
                        </Card.Body>

                    </Card>
                </Col>
            </Row>
        </div>

    </>;
};

export default InvoiceEntryEquipment;


