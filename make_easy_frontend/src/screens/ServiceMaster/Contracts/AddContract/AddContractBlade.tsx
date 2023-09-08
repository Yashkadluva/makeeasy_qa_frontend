

import { useState, useEffect } from "react";
import { Row, Col, Offcanvas, Form, Button } from 'react-bootstrap';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { Label } from "../../../../components/Label/Label";
import HelperService from "../../../../utility/HelperService";
import Loader from "../../../../components/Loader/Loader";
import { useSelector } from "react-redux";
import { RootState } from "../../../../config/Store";
import { getDefaultsState } from "../../../../reducer/CommonReducer";

interface PropData {
    isShow: boolean;
    isClose: any;
    data?: any;
    isEdit: boolean;
    classOptions: any;
    locationOptions: any;
    contractTypeOptions: any;
    ServiceMasterNum?: any;
}

const AddContractBlade = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const Defaults: any = useSelector<RootState, getDefaultsState>(
        (state) => state.getDefaults?.Defaults
    );
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState(props.isEdit ? props.data?.Contract?.StartDate : new Date());
    const [endDate, setEndDate] = useState(props.isEdit ? props.data?.Contract?.ExpiryDate : new Date());
    const [salesmanOption, setSalesmanOption] = useState<any[]>([]);
    const [location, setLocation] = useState<any>("")
    const [class1,setClass1] = useState<any>("")

    console.log(Defaults)

    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
    } = useForm();

    useEffect(() => {
        props.isShow == true && setValue("OperatorCode", user_info["OperatorCode"])
        props.isShow == true && salesmanOption.length == 0 && getSalesman();
        props.isShow == true && setValue("StartDate", new Date())
        props.isShow == true && setValue("ExpiryDate", new Date())
        props.isShow == true && setValue("IsApproved", true)
        props.isShow == true && setValue("RegularAccounting", true)

        if (props.isShow == true && props.isEdit == true) {
            var temp: any = props.data?.Contract;
            if (props.data?.EquipmentGridData.length > 0) {
                temp.AssociatedEquipmentIds = props.data?.EquipmentGridData.map((item: any) => {
                    return item.Id
                })
            }
            reset(temp);
            setValue("Amount", HelperService.formateDecimal(props.data?.Contract?.Amount))
        }
    }, [props.isShow]);

    useEffect(() => {
        if (Defaults) {
            setValue("BreakCode1", Defaults?.BreakCode1)
            setValue("BreakCode2", Defaults?.BreakCode2)
            setLocation(Defaults?.BreakCode1);
            setClass1(Defaults?.BreakCode2);

        }
    }, [Defaults])

    const getSalesman = () => {
        WebService.getAPI({
            action: `SetupSMSalesman/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                let columns: any[] = [];
                for (var i in res) {
                    columns.push({ value: res[i].InternalName, id: res[i].SalesmanNum });
                }
                setSalesmanOption(columns)
            })
            .catch((e) => { });
    }

    const CloseModal = (e: any) => {
        reset()
        props.isClose(!props.isShow, e);
    };

    const onSubmit = (requestBody: any) => {
        setLoading(true)
        if (props.isEdit) {
            editContract(requestBody)
        } else {
            requestBody.BreakType1 = "1";
            requestBody.BreakType2 = "2";
            requestBody.AccountId = user_info["AccountId"];
            requestBody.CompanyId = user_info["CompanyId"];
            requestBody.ServiceMasterNum = props.ServiceMasterNum;
            requestBody.StartDateString = HelperService.getFormatedDate(requestBody.StartDate)
            requestBody.ExpiryDateString = HelperService.getFormatedDate(requestBody.ExpiryDate)
            addContract(requestBody);
        }

    }

    const editContract = (data: any) => {
        setLoading(true)
        WebService.putAPI({
            action: `SaiSDContract/UpdateContract`,
            body: data,
        })
            .then((res: any) => {
                setLoading(false)
                toast.success("Contract Updated Successfully.")
                CloseModal("Add")
            })
            .catch((e) => {
                setLoading(false)
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }
            });
    }

    const addContract = (data: any) => {
        setLoading(true)
        WebService.postAPI({
            action: `SaiSDContract/SaveContract`,
            body: data,
        })
            .then((res: any) => {
                setLoading(false)
                toast.success("Contract Created Successfully.")
                CloseModal("Add")
            })
            .catch((e) => {
                setLoading(false)
                setAlertModel(!showAlertModel)
                setErrorMessage("There is already a contract number with this ID. Choose a different number.")

            });
    }

    const showAlertMessage = () => {
        if (props.data?.RegularBillingGridData.length) {
            setErrorMessage("Contract already has Regular Billing lines attached, can not uncheck this Option. To disable Regular Billing on this contract you will have to remove Regular Billing lines first.")
            setAlertModel(true)
        }
    }

    return (
        <>

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />

            <Loader show={isLoading} />


            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{props.isEdit ? "Edit General Information" : "Add Contract"}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="px-0">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body px-3 employee-mater-model form-style">
                            <Row>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Contract# <span className="text-danger">*</span></Form.Label>
                                    <Form.Control disabled={props.isEdit ? props.isEdit : false} {...register("ContractNum", { required: true })} type="text" />
                                    {errors.ContractNum && (
                                        <Label
                                            title={"Please Enter Contract#."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        control={control}
                                        rules={{ required: true }}
                                        name="StartDate"
                                        render={({ field }) => (
                                            <SawinDatePicker
                                                selected={startDate}
                                                onChange={(data: any) => {
                                                    setStartDate(data);
                                                    if (new Date(data) >= new Date(endDate)) {
                                                        setValue("ExpiryDate", data);
                                                        setEndDate(data);
                                                    }
                                                    field.onChange(data);
                                                    field.onChange(data)
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.StartDate && (
                                        <Label
                                            title={"Please Select Start Date."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        control={control}
                                        name="ExpiryDate"
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <SawinDatePicker
                                                selected={endDate}
                                                minData={new Date(startDate)}
                                                onChange={(data: any) => {
                                                    setEndDate(data);
                                                    field.onChange(data);
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.ExpiryDate && (
                                        <Label
                                            title={"Please Select End Date."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Amount </Form.Label>
                                    <Form.Control type="text" {...register("Amount")} onBlur={(e) => HelperService.formateUptoTwoDecimal(e)} />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Contract Type <span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        control={control}
                                        rules={{ required: true }}
                                        name="ContractType"
                                        render={({ field }) => (
                                            <SawinSelect
                                                selected={props.isEdit ? props.data?.Contract?.ContractType : ""}
                                                options={props.contractTypeOptions}
                                                type={"ARROW"}
                                                onChange={(data: any) => {
                                                    field.onChange(data.id);

                                                    if (data?.object?.MaintenanceOptions?.ReserveAccount) {
                                                        setValue("ReserveAccounting", true)
                                                    } else {
                                                        setValue("ReserveAccounting", false)
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.ContractType && (
                                        <Label
                                            title={"Please Select Contract Type."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        control={control}
                                        rules={{ required: true }}
                                        name="BreakCode1"
                                        render={({ field }) => (
                                            <SawinSelect
                                                selected={props.isEdit ? props.data?.Contract?.BreakCode1 : location}
                                                options={props.locationOptions}
                                                type={"ARROW"}
                                                onChange={(data: any) => field.onChange(data.id)}
                                            />
                                        )}
                                    />
                                    {errors.BreakCode1 && (
                                        <Label
                                            title={"Please Select Location."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Class <span className="text-danger">*</span></Form.Label>
                                    <Controller
                                        control={control}
                                        rules={{ required: true }}
                                        name="BreakCode2"
                                        render={({ field }) => (
                                            <SawinSelect
                                                selected={props.isEdit ? props.data?.Contract?.BreakCode2 : class1}
                                                options={props.classOptions}
                                                type={"ARROW"}
                                                onChange={(data: any) => field.onChange(data.id)}
                                            />
                                        )}
                                    />
                                    {errors.BreakCode2 && (
                                        <Label
                                            title={"Please Select Class."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label># Of Systems </Form.Label>
                                    <Form.Control type="text" {...register("NumberOfSystem")} />
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Salesman</Form.Label>
                                    <Controller
                                        control={control}
                                        name="SalesmanNum"
                                        render={({ field }) => (
                                            <SawinSelect
                                                selected={props.isEdit ? props.data?.Contract?.SalesmanNum : ""}
                                                options={salesmanOption}
                                                type={"ARROW"}
                                                onChange={(data: any) => field.onChange(data.id)}
                                            />
                                        )}
                                    />
                                    {errors.SalesmanNum && (
                                        <Label
                                            title={"Please Select Salesman."}
                                            modeError={true}
                                        />
                                    )}
                                </Col>
                                <Col md={4} className="mb-3">
                                    <Form.Label>Customer PO # </Form.Label>
                                    <Form.Control type="text"  {...register("CustomerPONum")} />
                                </Col>
                                <Col md={12}></Col>
                                <Col md={4} className=""  >
                                    <Form.Label>Contract Billing</Form.Label>
                                    <Form.Group className="" controlId="ContractBilling">
                                        <Form.Check type="checkbox" label=" "  {...register("RegularAccounting")} onClick={() => showAlertMessage()} />
                                    </Form.Group>
                                </Col>
                                <Col md={4} className="">
                                    <Form.Label>Reserve Accounting</Form.Label>
                                    <Form.Group className=" " controlId="ReserveAccounting">
                                        <Form.Check disabled={true} type="checkbox" label=" " {...register("ReserveAccounting")} />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Label>Is Approved</Form.Label>
                                    <Form.Group className=" " controlId="IsApproved">
                                        <Form.Check disabled={props.isEdit ? props.isEdit : false} type="checkbox" label=" " {...register("IsApproved")} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="offcanvas-footer position-absolute d-flex justify-content-center">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                Save
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-outline"
                                type="button"
                                onClick={() => CloseModal({})}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>);
};

export default AddContractBlade;


