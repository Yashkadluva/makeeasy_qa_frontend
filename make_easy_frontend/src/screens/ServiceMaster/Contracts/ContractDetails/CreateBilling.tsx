import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../../components/Grid/Grid";
import HelperService from "../../../../utility/HelperService";
import AttachEquipmentModal from "../../../../components/AttachEquipmentModal/AttachEquipmentModal";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import { Label } from "../../../../components/Label/Label";
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";

const componentKey = "MaintenanceSchEntry";


interface PropData {
    data: any;
    activeTab: any;
    changeTab: any;
}

const CreateBilling = (props: PropData) => {
    const { register, handleSubmit, formState: { errors }, watch, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const watchAllFields = watch();
    const [scheduleData, setScheduleData] = useState<any>({})
    const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    useEffect(() => {
        if (props.activeTab == "TabCreate") {
            setValue("ScheduleDate", props.data?.Contract?.StartDate)
            setScheduleData(props.data)
        }
    }, [props.activeTab]);

    const dropdonwOptions: Options[] = [
        { id: "M", value: "Month(s)" },
        { id: 'D', value: "Day(s)" },
    ];


    const onSave = (requestBody: any) => {
        requestBody.TotalContractAmount = scheduleData?.Contract?.Amount;
        requestBody.ContractNum = scheduleData?.Contract?.ContractNum;
        requestBody.BillAmount = scheduleData?.Contract?.Amount;
        requestBody.AccountId = user_info["AccountId"];
        requestBody.CompanyId = user_info["CompanyId"];
        setLoading(true);
        WebService.postAPI({
            action: `SaiSDContractBilling`,
            body: requestBody,
        })
            .then((res) => {
                setLoading(false);
                toast.success("Contract Billing created successfully");
                reset()
                props.changeTab("Tablisting")
            })
            .catch((e) => {
                setLoading(false);
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel);
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                }
            });
    }

    const closeModal = (value: any, type: any, data: any) => {
        if (type === "ON_SAVE") {
            const val = watchAllFields?.MaintenanceDescription
                ? watchAllFields?.MaintenanceDescription + " " + data
                : data;

            setValue("MaintenanceDescription", val);
        }
        setShowStatndardDescriptionModel(value);
    };

    return <>
        {
            showAlertModel &&
            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
        }

        <StandardDescriptionModal
            isShow={showStatndardDescriptionModel}
            isClose={closeModal}
            title="Standard Descriptions"
            billing={true}
        />

        <div className="form-style">
            <form onSubmit={handleSubmit(onSave)}>
                <Row className="mb-3 mt-3">
                    <Col md={12} className="mt-2">
                        <p className="font-w-bold">Service Master </p>
                        <Form.Label className="font-w-medium me-4">Name <span className="ms-1 font-w-regular">{scheduleData?.SMCompanyName}</span></Form.Label>
                        <Form.Label className="font-w-medium me-4">Customer Master<span className="ms-1 font-w-regular">{scheduleData?.ARCustomerMasterId}</span></Form.Label>
                        <Form.Label className="font-w-medium me-4">Phone <span className="ms-1 font-w-regular">{scheduleData?.SMWorkPhone}</span></Form.Label>

                        <Form.Label className="font-w-medium  ">Address <span className="ms-1 font-w-regular">{
                            scheduleData?.SMAddress1}</span></Form.Label>
                    </Col>
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

                    <Col md={3} className="mb-3">
                        <Form.Label># Of Bills<span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text"  {...register("NumberOfBills", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                        {errors.NumberOfBills && (
                            <Label
                                title={"Please Enter # Of Bills."}
                                modeError={true}
                            />
                        )}
                    </Col>

                    <Col md={3} className="mb-3">
                        <Form.Label>First Bill Date <span className="text-danger">*</span></Form.Label>
                        <Controller
                            control={control}
                            rules={{ required: true }}
                            name="ScheduleDate"
                            render={({ field }) => (
                                <SawinDatePicker
                                    minData={new Date(scheduleData?.Contract?.StartDate)}
                                    maxData={new Date(scheduleData?.Contract?.ExpiryDate)}
                                    selected={scheduleData?.Contract?.StartDate}
                                    onChange={(data: any) => field.onChange(data)}
                                />
                            )}
                        />
                        {errors.ScheduleDate && (
                            <Label
                                title={"Please Select First Bill Date."}
                                modeError={true}
                            />
                        )}
                    </Col>

                    <Col md={3} className="mb-3">
                        <Form.Label>Bill Every<span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text"  {...register("Interval", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                        {errors.Interval && (
                            <Label
                                title={"Please Enter Bill Every."}
                                modeError={true}
                            />
                        )}

                    </Col>
                    <Col md={3} className="mb-3 form-style">
                        <Form.Label>Month</Form.Label>
                        <Controller
                            control={control}
                            rules={{ required: true }}
                            name="BillMonthlyOrWeekly"
                            render={({ field }) => (
                                <SawinSelect
                                    options={dropdonwOptions}
                                    type={"ARROW"}
                                    onChange={(data: any) => field.onChange(data.id)}
                                />
                            )}
                        />
                        {errors.BillMonthlyOrWeekly && (
                            <Label
                                title={"Please Select Weekly Or Monthly."}
                                modeError={true}
                            />
                        )}
                    </Col>



                    <Col md={3} className="mb-3">
                        <Form.Label>Detail Line #<span className="text-danger">*</span></Form.Label>
                        <Form.Control type="text"  {...register("BillSeqNum", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                        {errors.BillSeqNum && (
                            <Label
                                title={"Please Enter Detail Line #."}
                                modeError={true}
                            />
                        )}
                    </Col>

                    <Col md={12} className="mb-3 form-style text-dark">
                        <div className="d-flex justify-content-between">
                            <Form.Label >Description</Form.Label>
                            <Button variant="light" className="btn-brand-light btn-small mb-2"
                                onClick={() => setShowStatndardDescriptionModel(true)} >Standard Billing Description</Button>
                        </div>
                        <Form.Control  {...register("BillingDescription", { required: false })} as="textarea" rows={3} className="h-auto" />
                    </Col>
                   
                </Row>  
            </form>
        </div>
     
        <Loader show={isLoading} />
    </>;
};

export default CreateBilling;


