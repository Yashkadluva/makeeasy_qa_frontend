
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Button, InputGroup, Offcanvas, Form } from "react-bootstrap";
import { CreditCard2Back, WindowPlus } from "react-bootstrap-icons"
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import HelperService from "../../../../utility/HelperService";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import ToggleButton from "../../../../components/ToggleButton/ToggleButton";
import WebService from "../../../../utility/WebService";
import { Label } from "../../../../components/Label/Label";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InviceSDMasterState, InvoiceState } from "../../../../reducer/CommonReducer";
import moment from "moment";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import cardTypeImg from '../../../../assets/images/card-type.svg';
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import { Dispatch } from "redux";
import visaIcon from '../../../../assets/images/visa.svg';
import mastercardIcon from '../../../../assets/images/mastercard.svg';
import americanExpressIcon from '../../../../assets/images/amex.svg';
import discoverIcon from '../../../../assets/images/discover.svg';


interface PropData {
    isShow: boolean;
    title: string;
    isClose: any;
    data: any;
    value: any;

}

const AddPaymentModal = (props: PropData) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
    } = useForm();
    const dispatch: Dispatch<any> = useDispatch();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [bladeTitle, setBladeTitle] = useState(" Payment");
    const [month, setMonth] = useState<any>();
    const [year, setYear] = useState<any>();
    const [selectedCreditType, setSelectedCreditType] = useState('STORED_CARD')
    const [isDefault, setIsDefault] = useState(false)
    const [amount, setAmount] = useState('')
    const [isLoading, setLoading] = useState(false);
    const [CreditCards, setCreditCard] = useState<Options[]>([]);
    const [ZCSCountrys, setZCSCountry] = useState<Options[]>([]);
    const [zipCodeList, setZipCodeList] = useState<any[]>([]);
    const [stateList, setStateList] = useState<any[]>([]);
    const [cityList, setCityList] = useState<any[]>([]);
    const [stateValue, setStateValue] = useState("");
    const [zoneValue, setZoneValue] = useState("");
    const [cityValue, setCityValue] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const [paymentData, setPaymentData] = useState<any>({});
    const [cardType, setCardType] = useState('')
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (props.isShow == true) {
            setAmount(HelperService.getCurrencyFormatter(props.data.Amount));
            getCreditCardOption()
        }
        getZipCode()
        getState()

    }, [props.isShow])


    const onDefault = (e: any) => {
        setIsDefault(e)
    }

    const onCloseModal = () => {
        setSelectedCreditType('STORED_CARD')
        reset({})
        props.isClose(!props.isShow);
    };


    const handleForm = (data: any) => {
        setLoading(true)
        var oldCardDetail = {
            Id: paymentData.Id,
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            ARCustomerMasterId: paymentData.ARCustomerMasterId,
            Last4Digits: paymentData.Last4Digits,
            CardHolderName: paymentData.CardHolderName,
            CardType: paymentData.CardType
        }
        var newCardDetail = {
            ARCustomerMasterId: invoceSDMaster.invoceSDMaster.ARCustomerMasterId,
            CardNumber: data.CardNumberNewCard ? data.CardNumberNewCard.replaceAll("-", "") : '',
            CardType: cardType,
            CardExpiryMonth: month && moment(month).format('MM'),
            CardExpiryYear: year && moment(year).format('YYYY'),
            CardCompanyName: data.CardCompanyName,
            AddressLine1: data.Address,
            ZipCode: data.ZipCode,
            CardCVV: data.Cvv,
            CardHolderName: data.CardholderName,
            EmailAddressToSendReceipt: data.Email,
            CardLabel: data.CardLabel,
            Notes: data.Notes,
            SaveCardInfoForFutureUse: isDefault,
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            City: data.City,
            State: data.State
        }
        var requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            CallNum: invoiceData.invoiceData.InvoiceNum,
            InvoiceNum: invoiceData.invoiceData.InvoiceNum,
            ARCustomerMasterId: invoceSDMaster.invoceSDMaster.ARCustomerMasterId,
            ServiceMasterId: invoceSDMaster.invoceSDMaster.SDServiceMasterId,
            Amount: amount,
            PaymentType: 'CreditCard',
            InvoiceInfoSeqNum: props.data.Id,
            CreditCardDetail: selectedCreditType === 'NEW_CARD' ? newCardDetail : oldCardDetail
        }
        WebService.postAPI({
            action: `SaiSDCreditCardCallPayment/PayInvoicePaymentMethods`,
            body: requestBody
        })
            .then((res) => {
                setMonth('')
                setYear('')
                setLoading(false)
                dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
                props.isClose(!props.isShow, "SAVE")
            })
            .catch((e) => {
                setMonth('')
                setYear('')
                setLoading(false)
                onCloseModal()
                if (
                    e &&
                    e.response &&
                    e.response.data &&
                    e.response.data.ErrorDetails.message
                ) {
                    setErrorMessage(e.response.data.ErrorDetails.message);
                } else {
                    setErrorMessage('An unkown exception has occur. Please Contact administrator');
                }
            })
    };

    const onSelectZipCode = (data: any) => {
        setValue("State", data.object.State);
        setValue("City", data.object.City);
        setStateValue(data.object.State);
        setCityValue(data.object.City);
        setStateValue(data.object.State);
    };

    const getCreditCardOption = () => {
        setLoading(true);
        WebService.getAPI({
            action: `ARCustomerCreditCardSetup/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoceSDMaster.invoceSDMaster?.ARCustomerMasterId}`,
            body: null,
        })
            .then((res: any) => {
                var array = [];
                for (var i in res.Data) {
                    array.push({ id: res.Data[i].Last4Digits, value: res.Data[i].Last4Digits, code: res.Data[i].CardLabel, object: res.Data[i] });
                    if (res.Data[i].IsPrimaryCreditCard === true) {
                        setValue('CardNumber', res.Data[i].Last4Digits)
                        setCardNumber(res.Data[i].Last4Digits)
                        setPaymentData(res.Data[i])
                    }
                }
                setCreditCard(array);
                setLoading(false);
            })
            .catch((e) => {
                setLoading(false);
            });
    };
    const getZipCode = () => {
        WebService.getAPI({
            action: `SetupSDZipCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                var array = [];
                for (var i in res) {
                    array.push({
                        id: res[i].ZipCode,
                        value: res[i].ZipCode,
                        object: res[i],
                    });
                }
                var cityArray = [];
                for (var j in res) {
                    if (res[j].City != null) {
                        cityArray.push({
                            id: res[j].City,
                            value: res[j].City,
                            object: res[j],
                        });
                    }
                }
                setCityList(cityArray);
                setZipCodeList(array);
            })
            .catch((e) => { });
    };

    const getState = () => {
        WebService.getAPI({
            action: `SaiSetupState/GetAll/${"en-US"}`,
            body: null,
        })
            .then((res: any) => {
                var array = [];
                for (var i in res) {
                    array.push({ id: res[i].Code, value: res[i].Name });
                }
                setStateList(array);
            })
            .catch((e) => { });
    };

    const handleNewCard = () => {
        setSelectedCreditType('NEW_CARD')
        let Name = `${invoceSDMaster.invoceSDMaster?.SDServiceMaster?.FirstName} ${invoceSDMaster.invoceSDMaster?.SDServiceMaster?.LastName}`
        let Email = invoceSDMaster.invoceSDMaster?.SDServiceMaster?.Email
        let Address = invoceSDMaster.invoceSDMaster?.SDServiceMaster?.Address1
        setValue("CardholderName", Name);
        setValue("Email", Email);
        setValue("Address", Address);
        setValue("Notes", Address);
    }

    return (

        <>
            <Loader show={isLoading} />
            <DraggableModal
                isOpen={errorMessage != ""}
                onClose={() => setErrorMessage("")}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage} />
            <Offcanvas
                show={props.isShow}
                onHide={onCloseModal}
                placement={"end"}
                className="offcanvas-large">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className=" p-0 ">
                    <form onSubmit={handleSubmit(handleForm)}>
                        <div className="modal-inner-min-h px-3 pt-3 mb-4">
                            <div className="service-location-form form-style">
                                <div className="row">
                                    <div className="col-md-4 ">
                                        <div className="form-group">
                                            <Label title="Payment Method" />
                                            <input
                                                disabled={true}
                                                value={`Payment Method ${props.value + 1}`}
                                                className="form-control"
                                                type="text"
                                                placeholder="Payment Method"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-4 mt-4">
                                        <div className="form-group ">
                                            <input
                                                disabled={true}
                                                value={props.data.PaymentMethod}
                                                className="form-control"
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="form-group ">
                                            <Label title="Payment Amount" />
                                            <input
                                                disabled={true}
                                                value={amount}
                                                className="form-control"
                                                type="text"
                                                placeholder="Payment Amount"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <Label title="Credit Card" classNames="font-w-medium mb-2" showStar={true} />
                                        <div className="form-group">
                                            <div className="d-flex">
                                                <Button

                                                    variant="light"
                                                    style={{ minWidth: 100, fontSize: "15px" }}
                                                    className={'me-3 ' + (selectedCreditType === 'STORED_CARD' ? 'btn-brand-solid font-w-medium' : 'btn-brand-light font-w-medium ')}
                                                    onClick={() => setSelectedCreditType('STORED_CARD')}
                                                >
                                                    <CreditCard2Back size={20} className="me-2 align-text-bottom" /> Stored Card
                                                </Button>
                                                <div className="col-4">
                                                    <Button
                                                        variant="light"
                                                        style={{ minWidth: 100, fontSize: "15px" }}
                                                        className={selectedCreditType === 'NEW_CARD' ? 'btn-brand-solid font-w-medium' : 'btn-brand-light font-w-medium '}
                                                        onClick={() => handleNewCard()}
                                                    >
                                                        <WindowPlus size={20} className="me-2 align-text-bottom" />
                                                        New Card
                                                    </Button>
                                                </div>
                                            </div>
                                            {errors.CreditCard && (
                                                <small className="text-danger">
                                                    Credit Card is required
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {
                                        selectedCreditType === 'STORED_CARD' &&
                                        <div className="col-12">
                                            <div className="col-4 ">
                                                <div className="form-group">
                                                    <Label title="Card Number" />
                                                    <Controller
                                                        control={control}
                                                        name="CardNumber"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={CreditCards}
                                                                selected={cardNumber}
                                                                onChange={(data: any) => {
                                                                    field.onChange(data.id)
                                                                    setPaymentData(data.object)
                                                                }}
                                                                type={"ARROW"}
                                                            />
                                                        )}
                                                    />

                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {
                                        selectedCreditType === 'NEW_CARD' &&
                                        <div className="col-12">
                                            <div className="row">

                                                <div className="col-4">
                                                    <div className="form-group ">
                                                        <Label title="Card Number" showStar={true} />
                                                        {/* <input
                                                            className="form-control"
                                                            type="text"
                                                            {...register("CardNumberNewCard", { required: true })}
                                                            placeholder="Card Number"
                                                            onBlur={(e: any) => {
                                                                setCardType(HelperService.validCreditCard(e.target.value))
                                                            }}
                                                            onKeyUp={(e) => HelperService.formatCreditCard(e)}
                                                        /> */}
                                                        <InputGroup>
                                                            <Form.Control
                                                                placeholder="0000-0000-0000-0000"
                                                                {...register("CardNumberNewCard", { required: true, minLength: 19 })}
                                                                onBlur={(e: any) => {
                                                                    setCardType(HelperService.validCreditCard(e.target.value))
                                                                }}
                                                                onKeyUp={(e) => HelperService.formatCreditCard(e)}
                                                            />

                                                            <InputGroup.Text className="mt-0 bg-transparent px-2">  <img src={cardType == 'VISA' ? visaIcon : cardType == 'MASTERCARD' ? mastercardIcon : cardType == 'AMERICANEXPRESS' ? americanExpressIcon : cardType == 'DISCOVERCARD' ? discoverIcon : cardTypeImg} width={25} /> </InputGroup.Text>

                                                        </InputGroup>
                                                        {errors.CardNumberNewCard && (
                                                            <small className="text-danger">
                                                                Card Number is required
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-4">
                                                    <div className="form-group ">
                                                        <Label title="Cardholder Name" showStar={true} />
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            {...register("CardholderName", { required: true })}
                                                            placeholder="Cardholder Name"
                                                        />
                                                        {errors.CardholderName && (
                                                            <small className="text-danger">
                                                                Cardholder Name is required
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-4">
                                                    <div className="form-group ">
                                                        <Label title="Company Name" />
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Company Name"
                                                            {...register("CardCompanyName", { required: false })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-4">
                                                    <div className="form-group">
                                                        <div className=" rounded-pill">
                                                            <Label title="Expiration Date" showStar={true} />
                                                            <Controller
                                                                control={control}
                                                                name="CardExpiryMonth"
                                                                rules={{ required: true }}
                                                                render={({ field }) => (
                                                                    <SawinDatePicker
                                                                        selected={month}
                                                                        type={'MONTH'}
                                                                        placeholderText="Month"
                                                                        onChange={(data: any) => {
                                                                            setMonth(data);
                                                                            field.onChange(data);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.CardExpiryMonth && (
                                                                <Label
                                                                    title={"Please select month."}
                                                                    modeError={true}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-4 mt-4">
                                                    <div className="form-group">
                                                        <div className=" rounded-pill">
                                                            <Controller
                                                                control={control}
                                                                name="CardExpiryYear"
                                                                rules={{ required: true }}
                                                                render={({ field }) => (
                                                                    <SawinDatePicker
                                                                        selected={year}
                                                                        placeholderText="Year"
                                                                        type={'YEAR'}
                                                                        onChange={(data: any) => {
                                                                            setYear(data);
                                                                            field.onChange(data);
                                                                        }}
                                                                    />
                                                                )}
                                                            />
                                                            {errors.CardExpiryYear && (
                                                                <Label
                                                                    title={"Please select year."}
                                                                    modeError={true}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="col-4">
                                                    <div className="form-group ">
                                                        <Label title="CVV" showStar={true} />
                                                        <input
                                                            className="form-control"
                                                            type="password"
                                                            {...register("Cvv", { required: true, minLength: 3 })}
                                                            maxLength={5}
                                                            placeholder="Cvv"
                                                        />
                                                        {errors.Cvv && (
                                                            <small className="text-danger">
                                                                Cvv is required
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-group ">
                                                        <Label title="Label" />
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            placeholder="Label"
                                                            {...register("CardLabel", { required: false })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-12">
                                                    <div className="form-group ">
                                                        <Label title="Address" showStar={true} />
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            {...register("Address", { required: true })}
                                                            placeholder="Address"
                                                        />
                                                        {errors.Address && (
                                                            <small className="text-danger">
                                                                Address is required
                                                            </small>
                                                        )}
                                                    </div>
                                                </div>


                                                <div className="col-4 form-group">
                                                    <Label title="Zip Code" showStar={true} />
                                                    <Controller
                                                        control={control}
                                                        rules={{ required: true }}
                                                        name="ZipCode"
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={zipCodeList}
                                                                isHideArrow={true}
                                                                isCustomInput={true}
                                                                max={9}
                                                                isSearchable={true}
                                                                selected={zoneValue}
                                                                onChange={(data: any) => {
                                                                    field.onChange(data.id ? data.id : data);
                                                                    onSelectZipCode(data);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.ZipCode && (
                                                        <Label
                                                            title={"Please select zipcode."}
                                                            modeError={true}
                                                        />
                                                    )}
                                                </div>
                                                <div className="col-4 form-group">
                                                    <Label title="City" />
                                                    <Controller
                                                        control={control}
                                                        name="City"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={cityList}
                                                                isHideArrow={true}
                                                                isCustomInput={true}
                                                                isSearchable={true}
                                                                selected={cityValue}
                                                                onChange={(data: any) => {
                                                                    field.onChange(data.id ? data.id : data);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {errors.City && (
                                                        <Label
                                                            title={"Please enter city."}
                                                            modeError={true}
                                                        />
                                                    )}
                                                </div>
                                                <div className="col-4 form-group">
                                                    <Label title="State" />
                                                    <Controller
                                                        control={control}
                                                        name="State"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={stateList}
                                                                selected={stateValue}
                                                                onChange={(data: any) => field.onChange(data.id)}
                                                            />
                                                        )}
                                                    />
                                                    {errors.State && (
                                                        <Label
                                                            title={"Please enter state."}
                                                            modeError={true}
                                                        />
                                                    )}
                                                </div>


                                                <div className="col-12">
                                                    <div className="form-group ">
                                                        <Label title="Email" />
                                                        <input
                                                            className="form-control"
                                                            type="Email"
                                                            placeholder="Email"
                                                            {...register("Email", { required: false })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-12 form-group mb-3">
                                                    <Label title="Notes"></Label>
                                                    <textarea
                                                        className="form-control form-control-textarea h-auto"
                                                        {...register(`Notes`)}
                                                        placeholder="Notes" rows={2} />
                                                </div>
                                                <div className="col-md-5">
                                                    <ToggleButton isChecked={isDefault} title="Save In Vault" label_id="default" onChange={onDefault} />
                                                </div>

                                            </div>
                                        </div>
                                    }

                                </div>
                            </div>

                        </div>

                        <div className="offcanvas-footer">

                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                {
                                    isDefault == true ? "Save & Pay" : "Pay"
                                }
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-outline"
                                onClick={onCloseModal}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>

                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
};

export default AddPaymentModal;
