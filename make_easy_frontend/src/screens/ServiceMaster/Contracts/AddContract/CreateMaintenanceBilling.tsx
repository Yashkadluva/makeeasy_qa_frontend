import { useState, useEffect } from "react";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import { useForm, Controller } from "react-hook-form";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { Label } from "../../../../components/Label/Label";
import HelperService from "../../../../utility/HelperService";
import Loader from "../../../../components/Loader/Loader";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import BillingListing from "./BillingListing";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { setDataInRedux, SET_IS_REFRESH} from "../../../../action/CommonAction";



interface PropData {
    isShow: boolean;
    onClose: any;
    data?: any;
}

const CreateMaintenanceBilling = (props: PropData) => {
    const dispatch: Dispatch<any> = useDispatch();
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState("TabCreate");
    const { register, handleSubmit, formState: { errors }, watch, control, reset, setValue, } = useForm();
    const watchAllFields = watch();
    const [scheduleData, setScheduleData] = useState<any>({})
    const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
    const [onSubmitClick, setOnSubmitClick] = useState<any>("")
    const [listData, setListData] = useState(props.data.RegularBillingGridData)

    useEffect(() => {
        if (props.isShow == true) {
            setValue("ScheduleDate", props.data?.Contract?.StartDate)
            setValue("NumberOfBills", 1)
            setValue("Interval", 1)
            setValue("BillMonthlyOrWeekly", "M")
            setValue("BillSeqNum", 1)
            setScheduleData(props.data)
            setOnSubmitClick(false);
            setListData(props.data.RegularBillingGridData)
        }
    }, [props.isShow]);


    const CloseModal = (e: any) => {
        setCurrentTab("TabCreate");
        reset();
        props.onClose(!props.isShow, e);
    };

    const getCurrentKey = (value: any) => {
        setCurrentTab(value);
    };

    const dropdonwOptions: Options[] = [
        { id: "M", value: "Month(s)" },
        { id: 'D', value: "Day(s)" },
    ];

    const onSave = (requestBody: any) => {
        if (currentTab == "TabCreate") {
            requestBody.TotalContractAmount = scheduleData?.Contract?.Amount;
            requestBody.ContractNum = scheduleData?.Contract?.ContractNum;
            requestBody.BillAmount = HelperService.formateDecimal(scheduleData?.Contract?.Amount/requestBody.NumberOfBills);
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
                    setListData(res)
                    setCurrentTab('Tablisting')
                    dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
                    // CloseModal("Add")
                })
                .catch((e) => {
                    setLoading(false);
                    if (e.response.data.ErrorDetails.message) {
                        setAlertModel(!showAlertModel);
                        setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                    }
                });
        }

    }

    const closeStandardModal = (value: any, type: any, data: any) => {
        if (type === "ON_SAVE") {
            const val = watchAllFields?.BillingDescription
                ? watchAllFields?.BillingDescription + " " + data
                : data;

            setValue("BillingDescription", val);
        }
        setShowStatndardDescriptionModel(value);
    };

    return (
        <>
            <StandardDescriptionModal
                isShow={showStatndardDescriptionModel}
                isClose={closeStandardModal}
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


            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-dex-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Create Billing</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <form onSubmit={handleSubmit(onSave)}>
                        <div className="modal-inner-min-h">
                            <div className="tab-style-2 px-3 pt-3">
                                <Tabs activeKey={currentTab} onSelect={getCurrentKey}>
                                    <Tab
                                        eventKey="TabCreate"
                                        title={
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <img
                                                    src={
                                                        require("../../../../assets/images/icon-maintenance-schedule.svg").default
                                                    }
                                                    className="theme-icon-color"
                                                    height={21}
                                                    width={21}
                                                />
                                                <label className="nav-text">Create</label>
                                            </div>
                                        }

                                    >
                                        <Row className="mb-3 mt-3 text-dark">
                                            <Col md={12} className="mt-2 mb-2">
                                                <p className="font-w-bold mb-1">Service Master </p>
                                                <Form.Label className="font-w-medium me-4">Name <span className="ms-1 font-w-regular">{scheduleData?.SMCompanyName}</span></Form.Label>
                                                <Form.Label className="font-w-medium me-4">Customer Master<span className="ms-1 font-w-regular">{scheduleData?.ARCustomerMasterId}</span></Form.Label>
                                                <Form.Label className="font-w-medium me-4">Phone <span className="ms-1 font-w-regular">{scheduleData?.SMWorkPhone && HelperService.getFormattedContact(scheduleData?.SMWorkPhone)}</span></Form.Label>

                                                <Form.Label className="font-w-medium  ">Address <span className="ms-1 font-w-regular">{
                                                    scheduleData?.SMAddress1}</span></Form.Label>
                                            </Col>
                                            <Col md={12} className="mt-3">
                                                <p className="font-w-bold mb-1">Contract</p>
                                                <Form.Label className="font-w-medium me-4">Contract # <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ContractNum}</span></Form.Label>
                                                <Form.Label className="font-w-medium me-4">Start Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.StartDate && HelperService.getFormatedDate(scheduleData?.Contract?.StartDate)}</span></Form.Label>
                                                <Form.Label className="font-w-medium me-4">Expiration Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ExpiryDate && HelperService.getFormatedDate(scheduleData?.Contract?.ExpiryDate)}</span></Form.Label>
                                                <Form.Label className="font-w-medium  ">Contract Amount $ <span className="ms-1 font-w-regular">{
                                                    scheduleData?.Contract?.Amount ? HelperService.getCurrencyFormatter(scheduleData?.Contract?.Amount) : "0.00"}</span></Form.Label>
                                            </Col>
                                        </Row>
                                        <Row className="form-style">

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
                                                <Form.Label>Frequency<span className="text-danger">*</span></Form.Label>
                                                <Controller
                                                    control={control}
                                                    rules={{ required: true }}
                                                    name="BillMonthlyOrWeekly"
                                                    render={({ field }) => (
                                                        <SawinSelect
                                                            options={dropdonwOptions}
                                                            type={"ARROW"}
                                                            selected={"M"}
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
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <Form.Label className="text-dark">Description</Form.Label>
                                                    <Button variant="light" className="btn-brand-light mb-2" style={{ lineHeight: "16px" }}
                                                        onClick={() => setShowStatndardDescriptionModel(true)} >Standard Billing Description</Button>
                                                </div>
                                                <Form.Control  {...register("BillingDescription", { required: false })} as="textarea" rows={3} className="h-auto" />
                                            </Col>

                                        </Row>
                                    </Tab>
                                    <Tab
                                        eventKey="Tablisting"
                                        title={
                                            <div className="d-flex flex-column justify-content-center align-items-center">
                                                <img
                                                    src={
                                                        require("../../../../assets/images/schedule-listing.svg").default
                                                    }
                                                    className="theme-icon-color"
                                                    height={21}
                                                    width={21}
                                                />
                                                <label className="nav-text">Listing</label>
                                            </div>
                                        }
                                    >
                                        <BillingListing onSubmit={onSubmitClick} data={listData} activeTab={currentTab} changeTab={getCurrentKey} onCloseListing={(e: any) => CloseModal("Add")} />
                                    </Tab>
                                </Tabs>

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
                            {
                                currentTab == "TabCreate" &&
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid ms-3"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                            }


                            {
                                currentTab == "Tablisting" &&
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid ms-3"
                                    type="button"
                                    onClick={() => setOnSubmitClick(new Date().getTime())}
                                >
                                    Submit
                                </Button>
                            }

                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>);
};

export default CreateMaintenanceBilling;


