

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Form from "react-bootstrap/Form";
import { toast } from 'react-toastify';
import Grid, { GridColumn, GridHeader, GridRow } from "../../../../components/Grid/Grid";
import { RootState } from "../../../../config/Store";
import { InvoiceState, SDMaster, WorkOrderIdState } from "../../../../reducer/CommonReducer";
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";

interface PropData {
    isShow: boolean;
    title: any;
    isClose: any;
    selectedData: any;
    data: any;
}

const headers: GridHeader[] = [
    {
        title: "Select",
        class: "text-center",
    },
    {
        title: "",
        isSorting: false,
        class: "text-center",
    },
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

const ContractAttachEquipment = (props: PropData) => {
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const workOrderId: any = useSelector<RootState, WorkOrderIdState>(
        (state) => state.workOrderId);
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
    const [selectedEquipment, setselectedEquipment] = useState<any[]>(props.selectedData);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [rows, setRows] = useState<GridRow[]>([]);
    const [ShowLoader, setShowLoader] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const { handleSubmit } = useForm();
    const [showAlertModel, setAlertModel] = useState(false);
    const [confirmAlertModel, setConfirmAlertModel] = useState(false);
    const [removeEquipment, setRemoveEquipment] = useState<any>({});
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [clickCount, setClickCount] = useState<any>(0);
    const [hasChange, setHasChange] = useState(false);
    let rowCompute = useRef<GridRow[]>([]);

    useEffect(() => {
        setselectedEquipment(props.selectedData);
    }, [props.selectedData])

    useEffect(() => {
        if (props.isShow) {
            getEquipment(props.data);
            setClickCount(0)
        }
    }, [props.isShow]);

    const getEquipment = (res: any) => {
        setShowLoader(true);
        let rows: GridRow[] = [];
        for (var i in res) {
            var isSeleccted: boolean = false;
            if (selectedEquipment.length > 0) {
                selectedEquipment.filter((item: any) => {
                    if (item.SDEquipmentMasterId == res[i].SDEquipmentMasterId) {
                        isSeleccted = true
                    }
                });
            }
            res[i].isSelected = isSeleccted;
            let columns: GridColumn[] = [];
            columns.push({ value: checkBox(res[i], Number(i)), originalValue: res[i] });
            columns.push({ value: box(res[i].Covered) });
            columns.push({ value: res[i].EqpManufacturer });
            columns.push({ value: res[i].EqpModel });
            columns.push({ value: showDescription(res[i].Description) });
            columns.push({ value: res[i].SerialNo });
            columns.push({ value: res[i].Location });
            columns.push({ value: res[i].System });
            columns.push({ value: res[i].Unit });
            rows.push({ data: columns });
        }
        rowCompute.current = rows;
        setRows(rows);
        setShowLoader(false);
    };

    const box = (covered: any) => {
        return (
            <div className="cover-box">
                <div
                    className={
                        "box-size " +
                        (covered === "Yes" ? "box-background-color" : "box-color")
                    }
                >
                    {" "}
                </div>
            </div>
        );
    };

    const checkBox = (value: any, index: number) => {
        return (
            <div className="d-flex justify-content-center">
                <Form.Group>
                    <Form.Check
                        type="checkbox"
                        label=""
                        checked={value.isSelected}
                        onClick={() => click(index, value)}
                    />
                </Form.Group>
            </div>
        )
    };

    const click = (index: number, data: any) => {
        setClickCount(index + 1)
        let hasData: boolean = false;
        for (var i in selectedEquipment) {
            if (selectedEquipment[i].Id == data.Id) {
                hasData = true;
                data.deleteIndex = i;
            }
        }
        setHasChange(true); 
        if (hasData) {
            selectedEquipment.splice(data.deleteIndex, 1);
        } else {
            selectedEquipment.push(data);
        }
        setselectedEquipment([...selectedEquipment]);

        rowCompute.current[index].data[0].originalValue.isSelected = !rowCompute.current[index].data[0].originalValue.isSelected;
        rowCompute.current[index].data[0].value = checkBox(rowCompute.current[index].data[0].originalValue, index);
        let rows: GridRow[] = [...rowCompute.current];
        setRows(rows);
    };

    const onSubmit = (requestBody: any) => {
            requestBody.selectedEquipment = selectedEquipment;
            props.isClose(!props.isShow, "SAVE", selectedEquipment);
        
    };

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a
                    className="grid-hypper-link"
                    onClick={() => viewFullDescription(e)}
                >
                    {HelperService.removeHtml(e)}
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

    const onCloseModal = () => {
        setRows([]);
        props.isClose(!props.isShow, clickCount !== 0 ? "SAVE" : "", selectedEquipment, hasChange);
    };

    return (
        <>


            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={closeDescription}
                data={descriptionData}
            />

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />

            <Offcanvas
                show={props.isShow}
                onHide={onCloseModal}
                placement={"end"}
                className="offcanvas-dex-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Attach Equipment</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="form-style mt-3">
                        <div className="modal-body px-3 add-equip-modal-body">
                            <div className="d-flex  justify-content-between align-items-center  ">
                                <div className="d-flex">
                                    <div className="d-flex">
                                        <div className="green-box"></div>
                                        <span className="small text-dark">Covered</span>
                                    </div>
                                    <div className="d-flex mx-2">
                                        <div className="red-box"></div>
                                        <span className="small text-dark">Not Covered</span>
                                    </div>
                                    <div>
                                        <p className=" font-w-medium small text-dark"> Attached Equipment : {selectedEquipment.length}</p>
                                    </div>
                                </div>
                                <div>

                                   
                                </div>
                            </div>

                            <div className="table-attach-Equipment">
                                <Grid
                                    headers={headers}
                                    rows={rows}
                                    ShowLoader={ShowLoader}
                                    errorMessage={"No Attach Equipment Found"}
                                />
                            </div>
                        </div>

                        <div className="offcanvas-footer mt-4 position-absolute">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                Submit
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-outline"
                                type="button"
                                onClick={onCloseModal}
                            >
                                Cancel
                            </Button>
                        </div>

                    </form>
                </Offcanvas.Body>
            </Offcanvas>
            <Loader show={isLoading} />
        </>
    );
};

export default ContractAttachEquipment;
