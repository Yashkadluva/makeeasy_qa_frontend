
import { Offcanvas, Button, Col, Row, Form } from "react-bootstrap";
import SawinSelect, { Options } from "../../../components/Select/SawinSelect";
import HelperService from "../../../utility/HelperService";
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from "../../../components/SawinDatePicker/SawinDatePicker";
import { useEffect, useState } from "react";
import { Label } from "../../../components/Label/Label";
import { userInfo } from "os";
import WebService from "../../../utility/WebService";
import { toast } from "react-toastify";
import Loader from "../../../components/Loader/Loader";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import BsButton from "react-bootstrap/Button";
import moment from "moment";

interface PropData {
    isShow: boolean;
    title: any;
    data: any;
    isClose: any;
    companyData: any;
}

const RenewContractModal = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
        watch
    } = useForm();
    const watchAllFields = watch();
    const [startDate, setStartDate] = useState(props.data?.ExpiryDate ? props.data?.StartDate : new Date());
    const [endDate, setEndDate] = useState(props.data?.ExpiryDate ? props.data?.ExpiryDate : new Date());
    const [isLoading, setLoading] = useState(false);
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [contractAmount, setContractAmount] = useState('no');
    const [changeAmount, setChangeAmount] = useState('no');

    const contractAmountOption: Options[] = [
        { id: "no", value: "None" },
        { id: "Inc", value: "Increase" },
        { id: "Desc", value: "Decrease" },
    ];

    const byOption: Options[] = [
        { id: "%", value: "%" },
        { id: "F", value: "Flat $ Amount" },
    ]

    var date1 = moment(props.data?.StartDate)
    var date2 = moment(props.data?.ExpiryDate)
    var days = date1.diff(date2, 'days')

    useEffect(() => {
        props.isShow == true && getRenewContractData()
    }, [props.isShow])

    const getRenewContractData = () => {
        WebService.getAPI({
            action: `SaiSDContract/GetContractDetailsForRenewContract/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data?.ContractNum}/${props.data?.ServiceMasterNum}`,
            body: null
        })
            .then((res: any) => {
                setValue('CreateBillingSchedule', res.Data.CreateBillingSchedule)
                setValue('CreateMaintenanceSchedule', res.Data.CreateMaintenanceSchedule)
                setValue('NewContractNum', res.Data.NewContractName)
                setValue('NewContractAmount', HelperService.formateDecimal(res.Data.NewContractAmount))
                var date:any = moment(props.data?.ExpiryDate).add(1, 'days')
                setStartDate(date)
                setEndDate(moment(props.data?.ExpiryDate).add(Math.abs(days), 'days'))
                setValue('NewContractStartDate', date)
                let ExDate:any = moment(props.data?.ExpiryDate).add(Math.abs(days), 'days')
                setValue('NewContractExpiryDate',(new Date(ExDate) > new Date(date)) ? ExDate : date )
                
            })
            .catch((e) => {

            })
    }

    const onCloseModal = (e?: any) => {
        setContractAmount("no")
        props.isClose(!props.isShow, e);
    };

    const onSubmit = (requestBody: any) => {
        requestBody.AccountId = user_info["AccountId"]
        requestBody.CompanyId = user_info["CompanyId"]
        requestBody.OperatorCode = user_info["OperatorCode"]
        requestBody.OldContractNum = props.data?.ContractNum;
        requestBody.SDServiceMasterId = props.data?.ServiceMasterNum;
        requestBody.RenewType = "RenewContract";
        requestBody.NewContractStartDateToDisplay = HelperService.getFormatedDate(requestBody.NewContractStartDate);
        requestBody.NewContractExpiryDateToDisplay = HelperService.getFormatedDate(requestBody.NewContractExpiryDate);

        // let data =  {
        //     "AccountId":"340",
        //     "CompanyId":"1",
        //     "SDServiceMasterId":"1-1",
        //     "OperatorCode":"6666",
        //     // "IncreaseAmountByPercOrAmountValue":"45417.00",
        //     "NewContractAmount":"169995.00",
        //     "CreateBillingSchedule":"false",
        //     "CreateMaintenanceSchedule":"false",
        //     "NewContractNum":"14154-12",
        //     "OldContractNum":"rah-6-1",
        //     "NewContractStartDateToDisplay":"01/20/23",
        //     "NewContractExpiryDateToDisplay":"06/15/23",
        //     "RenewType":"RenewContract",
        //     // "ContractAmount":"Inc",
        //     // "HideByAmount":"false",
        //     // "IncreaseAmountByPercOrAmount":"F",
        //     "NewContractStartDate":"2023-1-20 0:0:0",
        //     "NewContractExpiryDate":"2023-6-15 23:59:59"
        //   }

        setLoading(true)
        WebService.postAPI({
            action: `SaiSDContractsRenewalListDetail/RenewContract`,
            body: requestBody,
        })
            .then((res: any) => {
                setValue('percentage', '')
                setLoading(false)
                toast.success("Contract Renewed Successfully.")
                onCloseModal("Add")
            })
            .catch((e) => {
                setLoading(false)
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }

            });

    }

    const validateContractNum = (data: any) => {
        setLoading(true)
        WebService.getAPI({
            action: `SaiSDContract/CheckIfContractNumExist/${user_info["AccountId"]}/${user_info["AccountId"]}/${data}`,
            body: null,
        })
            .then((res: any) => {
                setLoading(false)
                if (res == true) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(`Contract Number already exists`)
                }
            })
            .catch((e) => {
                setLoading(false)
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }

            });
    }

    const handleContractAmount = (e: any) => {
        setContractAmount(e);
        if (e == "no") {
            setChangeAmount(e);
        } else if (e == "Inc") {

        } else if (e == "Desc") {

        }
    }

    const handleByAmount = (e: any) => {
        setChangeAmount(e)
    }

    const getCalculateAmmount = () => {
        console.log("watchAllFields.percentage", watchAllFields.percentage)
        var amount = watchAllFields.NewContractAmount
        if (watchAllFields.ContractAmount == 'Inc') {
            if (watchAllFields.IncreaseAmountByPercOrAmount == '%') {
                var value = (amount / 100) * watchAllFields.percentage
                var final_value = Number(amount) + Number(value)
                console.log("amount", amount)
                console.log("value", value)
                console.log("final_value", final_value)
                setValue("NewContractAmount", HelperService.formateDecimal(final_value))
            } else if (watchAllFields.IncreaseAmountByPercOrAmount == 'F') {
                var data = Number(amount) + Number(watchAllFields.percentage)
                setValue("NewContractAmount", HelperService.formateDecimal(data))
            }
        } else if (watchAllFields.ContractAmount == 'Desc') {
            if (watchAllFields.IncreaseAmountByPercOrAmount == '%') {
                var value = (amount / 100) * watchAllFields.percentage
                var data = Number(amount) - Number(value)
                if (data > 0) {
                    setValue("NewContractAmount", HelperService.formateDecimal(data))
                } else {
                    setValue("NewContractAmount", HelperService.formateDecimal(0))
                }
            } else if (watchAllFields.IncreaseAmountByPercOrAmount == 'F') {
                var value = Number(amount) - Number(watchAllFields.percentage)
                if (value > 0) {
                    setValue("NewContractAmount", HelperService.formateDecimal(value))
                } else {
                    setValue("NewContractAmount", HelperService.formateDecimal(0))
                }

            }
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

            <Offcanvas
                show={props.isShow}
                onHide={() => onCloseModal("no")}
                placement={"end"}
                className="offcanvas-ex-large">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{props.title}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="px-0 information-main-view py-0">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body  modal-inner-min-h mb-3 pt-3 form-style">
                            <div className="px-3 border-bottom  pb-3">
                                <div className="row text-dark">
                                    <Col md={4}>
                                        <h4 className="mb-1 font-16 font-w-bold">{props.companyData?.CompanyName}</h4>
                                        <p className="mb-1 font-14 mb-1">{props.companyData?.CompanyName}</p>
                                        <p className="mb-1 font-14 mb-1">{props.companyData?.Address1}</p>
                                        <p className="mb-1 font-14 mb-1">{props.companyData?.City}{" "}{props.companyData?.State}{" "}{props.companyData?.ZipCode}{" "}{props.companyData?.Country} </p>
                                        <p className="mb-1 font-14 mb-0">
                                            <span className="me-3">
                                                {
                                                    props.companyData?.WorkPhone &&
                                                    <>
                                                        <img src={require("../../../assets/images/call.svg").default} alt="call" className="align-baseline theme-icon-color" />{" "} {props.companyData?.WorkPhone && HelperService.getFormattedContact(props.companyData?.WorkPhone)}
                                                    </>
                                                }
                                            </span>
                                            <span>
                                                {
                                                    props.companyData?.HomePhone &&
                                                    <>
                                                        <img src={require("../../../assets/images/phone-black.svg").default} alt="call" className="align-baseline theme-icon-color" />   {HelperService.getFormattedContact(props.companyData?.HomePhone)}</>
                                                }
                                            </span>
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <h4 className="mb-1 font-16">AR #</h4>
                                        <p className="mb-1 font-14 mb-1">{props.companyData?.ARCustomerMasterId}</p>
                                        <p className="mb-1 font-14 mb-1">{props.companyData?.ARName}</p>
                                        {/* <p className="mb-1 font-14 mb-1">Flat Number-02, High Hills Apartment </p> */}
                                        {/* <p className="mb-1 font-14 mb-0">

                                    <span> <img src={require("../../../assets/images/phone-black.svg").default} alt="call" className="align-baseline theme-icon-color" />{" "} (832)-783-0997</span>
                                </p> */}
                                    </Col>
                                    <Col md={4}>
                                        {/* <p className="mb-1 font-14 mb-0">
                                    <span className="me-3"> <img src={require("../../../assets/images/call.svg").default} alt="call" className="align-baseline theme-icon-color" />{" "} (832)-783-0997</span>
                                </p> */}
                                    </Col>
                                </div>
                            </div>
                            <div className="p-3 border-bottom text-dark">
                                <h3 className="font-18">Old Contract</h3>
                                <Row>
                                    <Col>
                                        <label className="font-w-medium">Number</label>
                                        <p className="mb-0">{props.data?.ContractNum}</p>
                                    </Col>
                                    <Col>
                                        <label className="font-w-medium">Amount</label>
                                        <p className="mb-0">{props.data?.Amount && HelperService.getCurrencyFormatter(props.data?.Amount)}</p>
                                    </Col>
                                    <Col>
                                        <label className="font-w-medium">Start Date</label>
                                        <p className="mb-0">{props.data?.StartDate && HelperService.getFormatedDate(props.data?.StartDate)}</p>
                                    </Col>
                                    <Col>
                                        <label className="font-w-medium">End Date</label>
                                        <p className="mb-0">{props.data?.ExpiryDate && HelperService.getFormatedDate(props.data?.ExpiryDate)}</p>
                                    </Col>
                                    <Col>
                                        <label className="font-w-medium">Contract Type</label>
                                        <p className="mb-0">{props.data?.ContractType}</p>
                                    </Col>
                                </Row>
                            </div>
                            <div className="p-3 border-bottom text-dark ">
                                <h3 className="font-18 mb-3">Renew Type</h3>
                                <Row>
                                    <Col md={4}>
                                        <label className="font-w-medium">Create Billing Schedule</label>
                                        <Form.Group className=" " controlId="CreateBilling">
                                            <Form.Check type="checkbox" {...register("CreateBillingSchedule", { required: false })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <label className="font-w-medium">Create Maintenance Schedule</label>
                                        <Form.Group className=" " controlId="CreateMaintenance">
                                            <Form.Check type="checkbox" {...register("CreateMaintenanceSchedule", { required: false })} />
                                        </Form.Group>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col md={3} >
                                        <label className="font-w-medium">Contract Amount</label>
                                        <Form.Group className="form-style" controlId="">
                                            <Controller
                                                control={control}
                                                rules={{ required: false }}
                                                name="ContractAmount"
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={contractAmountOption}
                                                        type={"ARROW"}
                                                        onChange={(data: any) => {
                                                            field.onChange(data.id);
                                                            handleContractAmount(data.id)
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Group>
                                    </Col>
                                    {
                                        contractAmount !== "no" &&
                                        <>
                                            <Col md={3} >
                                                <label className="font-w-medium">By</label>
                                                <Form.Group className=" " controlId="">
                                                    <Controller
                                                        control={control}
                                                        rules={{ required: false }}
                                                        name="IncreaseAmountByPercOrAmount"
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={byOption}
                                                                type={"ARROW"}
                                                                onChange={(data: any) => {
                                                                    field.onChange(data.id);
                                                                    handleByAmount(data.id)
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            {
                                                changeAmount !== "no" &&
                                                <>
                                                    <Col md={3}  >
                                                        <label className="font-w-medium">$</label>
                                                        <Form.Group className=" " controlId="">
                                                            <input type="text" className="form-control"
                                                                {...register("percentage", { required: true })}
                                                                onKeyPress={(e) => HelperService.allowNewDecimalValue(e)}
                                                                onBlur={(e) => {
                                                                    HelperService.formateUptoTwoDecimal(e)
                                                                }}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={3} >
                                                        <Button
                                                            className="btn btn-brand-solid mt-4"
                                                            type="button"
                                                            onClick={() =>
                                                                getCalculateAmmount()
                                                            }
                                                        > Apply</Button>
                                                    </Col>
                                                </>
                                            }

                                        </>
                                    }


                                </Row>
                            </div>
                            <div className="p-3  text-dark">
                                <h3 className="font-18 mb-3">New Contract</h3>
                                <Row>
                                    <Col md={4} className="mb-3">
                                        <label className="font-w-medium">Number <span className="text-danger">*</span></label>
                                        <Form.Group className=" ">
                                            <Form.Control type="text" {...register("NewContractNum", { required: true })} onBlur={(e) => validateContractNum(e.target.value)} />
                                        </Form.Group>
                                        {errors.NewContractNum && (
                                            <Label
                                                title={"Please Enter New Contract#."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <label className="font-w-medium">Amount <span className="text-danger">*</span></label>
                                        <Form.Group className="">
                                            <Form.Control type="text" {...register("NewContractAmount", { required: true })} onBlur={(e) => HelperService.formateUptoTwoDecimal(e)} />
                                        </Form.Group>
                                        {errors.NewContractAmount && (
                                            <Label
                                                title={"Please Enter Amount."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <label className="font-w-medium">Start Date <span className="text-danger">*</span></label>
                                        <div className="form-style">
                                            <Controller
                                                control={control}
                                                rules={{ required: true }}
                                                name="NewContractStartDate"
                                                render={({ field }) => (
                                                    <SawinDatePicker
                                                        selected={startDate}
                                                        onChange={(data: any) => {
                                                            setStartDate(data);
                                                            if (new Date(data) >= new Date(endDate)) {
                                                                setValue("NewContractExpiryDate", data);
                                                                setEndDate(data);
                                                            }
                                                            field.onChange(data)
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.NewContractStartDate && (
                                            <Label
                                                title={"Please Select Start Date."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <label className="font-w-medium">Expiry Date <span className="text-danger">*</span></label>
                                        <div className="form-style">
                                            <Controller
                                                control={control}
                                                name="NewContractExpiryDate"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinDatePicker
                                                        selected={(new Date(endDate) > new Date(startDate)) ? endDate : startDate}
                                                        minData={new Date(startDate)}
                                                        onChange={(data: any) => {
                                                            setEndDate(data);
                                                            field.onChange(data);
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.ExpiryDate && (
                                            <Label
                                                title={"Please Select Expiry Date."}
                                                modeError={true}
                                            />
                                        )}
                                    </Col>

                                </Row>
                            </div>
                        </div>
                        <div className="offcanvas-footer  ">
                            <div className="d-flex justify-content-center">
                                <div>
                                    <Button
                                        className="btn btn-brand-outline me-3"
                                        onClick={() => onCloseModal("no")}
                                        type="button"
                                    > Cancel</Button>
                                    <Button
                                        className="btn btn-brand-solid"
                                        type="submit"
                                    > Save</Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default RenewContractModal;
