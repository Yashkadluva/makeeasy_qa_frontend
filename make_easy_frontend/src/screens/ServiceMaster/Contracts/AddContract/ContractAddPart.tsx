import { useState, useEffect } from "react";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import { useNavigate } from "react-router-dom";
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import { useForm, Controller } from "react-hook-form";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { Label } from "../../../../components/Label/Label";
import HelperService from "../../../../utility/HelperService";
import Loader from "../../../../components/Loader/Loader";
import CreateBilling from "../ContractDetails/CreateBilling";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import AttachEquipmentModal from "../../../../components/AttachEquipmentModal/AttachEquipmentModal";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import PartsAdvanceSearch from "../../../../components/PartsAdvanceSearch/PartsAdvanceSearch";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";




interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
}

const ContractAddPart = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, watch, control, reset, setValue, } = useForm();
    const watchAllFields = watch();
    const [scheduleData, setScheduleData] = useState<any>({})
    const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
    const [isInventory, setIsInventory] = useState(false);
    const [partDetailsData, setPartDetailsData] = useState<any>([]);

    useEffect(() => {
        if (props.isShow == true) {
            partDetailsData.length == 0 && getPartDetails()
            setValue("ScheduleDate", props.data?.Contract?.StartDate)
            setValue("NumberOfBills", 1)
            setValue("Interval", 1)
            setValue("BillMonthlyOrWeekly", "M")
            setValue("BillSeqNum", 1)
            setScheduleData(props.data)
        }
    }, [props.isShow]);

    const CloseModal = (e: any) => {
        reset()
        props.isClose(!props.isShow, e);
    };

    const onSave = (requestBody: any) => {
        requestBody.TotalContractAmount = scheduleData?.Contract?.Amount;
        requestBody.ContractNum = scheduleData?.Contract?.ContractNum;
        requestBody.BillAmount = scheduleData?.Contract?.Amount;
        requestBody.AccountId = user_info["AccountId"];
        requestBody.CompanyId = user_info["CompanyId"];
        requestBody.NormalOrReserve = "N"
        let data: any = [requestBody]
        setLoading(true);
        WebService.postAPI({
            action: `SaiSDContractBilling`,
            body: data,
        })
            .then((res) => {
                setLoading(false);
                toast.success("Contract Billing created successfully");
                reset();
                CloseModal("Add")
            })
            .catch((e) => {
                setLoading(false);
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel);
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                }
            });
    };

    const closeModal = (value: any, type: any, data: any) => {
        if (type === "ON_SAVE") {
            const val = watchAllFields?.BillingDescription
                ? watchAllFields?.BillingDescription + " " + data
                : data;

            setValue("BillingDescription", val);
        }
        setShowStatndardDescriptionModel(value);
    };

    const getPartDetails = () => {
        WebService.getAPI({
            action: "SaiPIPartMaster/GetParts/" + user_info['AccountId'] + "/" + user_info['CompanyId'] + "/true",
            body: null,
        })
            .then((res: any) => {
                setPartDetailsData(res);
            })
            .catch((e) => { });
    };

    const onSelectPart = (e: any) => {
        let data = e.id ? e.id : e;
        let SelectedPartData: any = partDetailsData.filter((item: any) => {
            return item.PartNum == data
        });
        if (SelectedPartData.length > 0) {
            reset(SelectedPartData[0]);
            // setValue("UnitCost", SelectedPartData[0]?.PurchaseCost);
        } else {
            setValue("PartNum", data);
        }
    };


    return (
        <>
            <StandardDescriptionModal
                isShow={showStatndardDescriptionModel}
                isClose={closeModal}
                title="Standard Descriptions"
                billing={true}
            />

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />

            <Loader show={isLoading} />

            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-ex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Add Part</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <form onSubmit={handleSubmit(onSave)}>
                        <div className="modal-inner-min-h">
                            <div className="tab-style-2 px-3 pt-3">
                                <Row className="mb-3 mt-3">
                                    <Col md={12} className="mt-3">
                                        <p className="font-w-bold">Contract</p>
                                        <Form.Label className="font-w-medium me-4">Contract # <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ContractNum}</span></Form.Label>
                                        <Form.Label className="font-w-medium me-4">Start Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.StartDate && HelperService.getFormatedDate(scheduleData?.Contract?.StartDate)}</span></Form.Label>
                                        <Form.Label className="font-w-medium me-4">Expiration Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ExpiryDate && HelperService.getFormatedDate(scheduleData?.Contract?.ExpiryDate)}</span></Form.Label>
                                        <Form.Label className="font-w-medium  ">Contract Amount $ <span className="ms-1 font-w-regular">{
                                            scheduleData?.Contract?.Amount ? HelperService.getCurrencyFormatter(scheduleData?.Contract?.Amount) : "0.00"}</span></Form.Label>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Part Number<span className="text-danger">*</span></Form.Label>
                                        <Controller
                                            control={control}
                                            name="PartNum"
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <PartsAdvanceSearch
                                                isInventory={false}
                                                    onChange={(data: any) => {
                                                        field.onChange(data.id); onSelectPart(data)
                                                    }} />
                                            )}
                                        />
                                        {errors.PartNum && (
                                            <Label
                                                title={"Please Enter # Of Bills."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <div className="mt-4">
                                            <ToggleButton
                                                isChecked={isInventory}
                                                title="Is Inventory"
                                                label_id=""
                                                onChange={(data: any) => setIsInventory(data)}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={6} className="mb-3">
                                        <Form.Label>Quantity<span className="text-danger">*</span></Form.Label>
                                        <Form.Control type="text"  {...register("Quantity", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                                        {errors.Interval && (
                                            <Label
                                                title={"Please Enter Quantity."}
                                                modeError={true}
                                            />
                                        )}

                                    </Col>
                                    <Col md={12} className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control  {...register("Description", { required: true })} as="textarea" rows={3} className="h-auto" />
                                        {errors.Description && (
                                            <Label
                                                title={"Please Enter Description."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>
                                </Row>



                                {/* scheduleData?.SaiSDContractMaintenanceScheduleParts.length > 0 */}

                            </div>
                        </div>
                        <div className="offcanvas-footer mt-4">
                            <Button
                                variant="primary"
                                className="btn-brand-outline"
                                type="button"
                                onClick={() => CloseModal("no")}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-solid ms-3"
                                type="submit"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>);
};

export default ContractAddPart;


