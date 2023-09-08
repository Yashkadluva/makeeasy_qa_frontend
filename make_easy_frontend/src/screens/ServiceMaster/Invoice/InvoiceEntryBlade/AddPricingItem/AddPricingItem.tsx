// AddBillingDetail

import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import { useEffect, useRef, useState } from "react";
import { toast } from 'react-toastify';
import WebService from "../../../../../utility/WebService";
import HelperService from "../../../../../utility/HelperService"
import { useSelector } from "react-redux";
import { RootState } from "../../../../../config/Store";
import { WorkOrderIdState, InvoiceState, InviceSDMasterState } from "../../../../../reducer/CommonReducer";
import Loader from "../../../../../components/Loader/Loader";
import { useForm, Controller } from "react-hook-form";
import SawinSelect from "../../../../../components/Select/SawinSelect";
import { Label } from "../../../../../components/Label/Label";
import ToggleButton from "../../../../../components/ToggleButton/ToggleButton";
import DraggableModal from "../../../../../components/DraggableModal/DraggableModal";
import Form from 'react-bootstrap/Form';
import './AddPricingItem.scss';
import PartsAdvanceSearch from "../../../../../components/PartsAdvanceSearch/PartsAdvanceSearch";

interface PropData {
    isShow: boolean;
    title: string;
    isClose: any;
    data: any;
    categoryOption: any;
    isEdit: any;
    sequenceNo?: any;
}


const AddPricingItem = (props: PropData) => {
    const { register, handleSubmit, reset, formState: { errors }, control, setValue, watch } = useForm();
    const watchAllFields = watch();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const workOrderId: any = useSelector<RootState, WorkOrderIdState>(
        (state) => state.workOrderId);
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [isLoading, setLoading] = useState(false);
    const [isInventory, setIsInventory] = useState(false);
    const [isItemTaxable, setIsItemTaxable] = useState(false);
    const [isItemUsed, setIsItemUsed] = useState(false);
    const [desableUnitCost, setDesableUnitCost] = useState(false);
    const [enablePartField, setEnablePartField] = useState(true);
    const [categoryOption, setCategoryOption] = useState([]);
    const [QtyOrdered, setQtyOrdered] = useState("0.00")
    const [PartCategeory, setPartCategeory] = useState("");
    const [partDetailsData, setPartDetailsData] = useState<any>([])
    const [partDetailsOption, setPartDetailsOption] = useState<any>([])
    const [priceSheetOption, setPriceSheetOption] = useState<any>([])
    const [equipmentLogOption, setEquipmentLogOption] = useState<any>([])
    const [serviceTypeOption, setServiceTypeOption] = useState<any>([])
    const [classOption, setClassOption] = useState<any>([])
    const [LocationOption, setLocationOption] = useState<any>([])
    const [truckOption, setTruckOption] = useState<any>([]);
    const [showFields, setShowFields] = useState("A")
    const [laborClassOption, setLaborClassOption] = useState<any>([]);
    const [vendorOption, setVendorOption] = useState<any>([]);
    const [ps, setPS] = useState<any>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [breakCodeOneValue, setBreakCodeOneValue] = useState('resetsawin');
    const [breakCodeTwoValue, setBreakCodeTwoValue] = useState('resetsawin');
    const [serviceType, setServiceType] = useState('resetsawin');
    const [isCreateAnother, setCreateAnother] = useState(false)
    const [priceSheetValue, setPriceSheetValue] = useState('')
    const [resetDropDown, setResetDropDown] = useState('')
    const [resetTruck, setResetTruck] = useState('')
    const [typeOfLabour, setTypeOfLabour] = useState('R')
    const [classOfLabour, setClassOfLabour] = useState('')
    const [resetPartNum, setresetPartNum] = useState('')
    const [selectedVendor, setSelectedVendor] = useState('')
    const unitCost = useRef<any>('');
    const categoryId = useRef<any>('');

    var labourType = [
        { value: "Regular", id: "R" },
        { value: "Overtime", id: "O" },
        { value: "Doubletime", id: "D" }
    ];

    const onCloseModal = (e: any) => {
        reset({})
        setCreateAnother(false)
        setEnablePartField(true)
        setDesableUnitCost(false)
        props.isClose(!props.isShow, e);
    };

    useEffect(() => {
        setCategoryOption(props.categoryOption)
    }, [props.categoryOption])

    useEffect(() => {
        props.isShow == true && priceSheetOption.length == 0 && getPriceSheetOptions();
        props.isShow == true && equipmentLogOption.length == 0 && getEquipmentLogOptions();
        props.isShow == true && serviceTypeOption.length == 0 && getServiceTypeOption();
        props.isShow == true && classOption.length == 0 && getClassOption();
        props.isShow == true && LocationOption.length == 0 && getLocationOption();
        props.isShow == true && truckOption.length == 0 && getTruckOptions();
        props.isShow == true && partDetailsOption.length == 0 && getPartDetails();
        props.isShow == true && laborClassOption.length == 0 && getLaborClassOption();
        props.isShow == true && vendorOption.length == 0 && getVendorOption();
        if (props.isEdit == false) {
            setServiceType(invoiceData.invoiceData.ServiceTypeId)
            setValue('ServiceType', invoiceData.invoiceData.ServiceTypeId)
            setBreakCodeOneValue(invoiceData.invoiceData.Break1Name)
            setValue('BreakCode1', invoiceData.invoiceData.Break1Name)
            setBreakCodeTwoValue(invoiceData.invoiceData.Break2Name)
            setValue('BreakCode2', invoiceData.invoiceData.Break2Name)
            setIsItemTaxable(invoceSDMaster.invoceSDMaster && invoceSDMaster?.invoceSDMaster?.SDCallMaster?.SDServiceMaster?.IsTaxable)
            props.isShow == true && setValue("Quantity", "1.00")
        } else if (props.isEdit == true) {
            console.log(props.data);
            unitCost.current = props.data?.UnitCost ? HelperService.formateDecimal(props.data?.UnitCost) : "0.00"
            reset(props.data);
            setValue("Quantity", props.data?.Quantity ? HelperService.formateDecimal(props.data?.Quantity) : "0.00")
            setValue('UnitCost', props.data?.UnitCost ? HelperService.formateDecimal(props.data?.UnitCost) : "0.00")
            setValue('RetailPrice', props.data?.RetailPrice ? HelperService.formateDecimal(props.data?.RetailPrice) : "0.00")
            setValue('Discount', props.data?.Discount ? HelperService.formateDecimal(props.data?.Discount) : "0.00")
            setResetDropDown(props.data?.ItemCategory);
            var BillingCodeType: any = "";
            for (let i in props.categoryOption) {
                if (props.categoryOption[i].id.trim() == props.data?.ItemCategory.trim()) {
                    BillingCodeType = props.categoryOption[i].object.BillingCodeType
                }
            }
            handleCategory({ id: props.data?.CategoryId, object: { BillingCodeType: BillingCodeType } });
            setServiceType(props.data?.ServiceType)
            setValue('ServiceType', props.data?.ServiceType)
            setBreakCodeOneValue(props.data?.BreakCode1)
            setValue('BreakCode1', props.data?.BreakCode1)
            setBreakCodeTwoValue(props.data?.BreakCode2)
            setValue('BreakCode2', props.data?.BreakCode2)
            setIsItemTaxable(props.data?.ItemTaxable)
            setIsItemUsed(props.data?.ItemUsed);
            setResetTruck(props.data?.Warehouse);
            setPriceSheetValue(props.data?.PriceSheetUsed)
            setTypeOfLabour(props.data?.LaborType)
            setClassOfLabour(props.data?.SetupSDTechLevelId)
            setValue("PartNum", props.data?.ItemCategory)
            BillingCodeType == "C" && setValue("hrs", props.data?.Quantity)
            BillingCodeType == "C" && setValue("PartNum", props.data?.LaborType)
            BillingCodeType == "C" && setValue("LaborClass", props.data?.SetupSDTechLevelId)
            BillingCodeType == "D" && setValue("Vendor", props.data?.CategoryId)
            setresetPartNum(props.data?.CategoryId);
            BillingCodeType == "D" && setSelectedVendor(props.data?.CategoryId);
            setValue("ItemCategory", props.data?.ItemCategory)
        }
    }, [props.isShow]);

    const getPreviousData = () => {
        WebService.getAPI({
            action: `SaiSDCallPart/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
            body: null,
        })
            .then((res: any) => {
                setQtyOrdered(res.QtyOrdered);
                setIsInventory(res.IsInventory);
                reset(res);

            })
            .catch((e) => { setLoading(false) });
    }

    const handleCategory = (data: any) => {
        setPartCategeory(data.id)
        setValue("ItemCategory", data.id)
        if (data.id && data.object.BillingCodeType == "A") {
            setShowFields(data.object.BillingCodeType)
            setIsInventory(true)
            setIsItemUsed(true)
            setEnablePartField(false)
            if (invoceSDMaster.invoceSDMaster.PriceCodeMat) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeMat)
            } else {
                setPriceSheetValue('STD')
            }
        } else if (data.id && data.object.BillingCodeType == "B") {
            setValue("PartNum", data.id)
            setShowFields(data.object.BillingCodeType)
            setIsInventory(false)
            setIsItemUsed(false)
            setEnablePartField(true)
            if (invoceSDMaster.invoceSDMaster.PriceCodeMat) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeMat)
            } else {
                setPriceSheetValue('STD')
            }
        } else if (data.id && data.object.BillingCodeType == "C") {
            setValue('hrs', '1.00')
            setShowFields(data.object.BillingCodeType)
            setIsInventory(false)
            setIsItemUsed(false)
            if (invoceSDMaster.invoceSDMaster.PriceCodeLab) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeLab)
            } else {
                setPriceSheetValue('STD')
            }
            setShowFields('C')
            onGetCalulatedAmount("1", "C")
        } else if (data.id && data.object.BillingCodeType == "D") {
            setEnablePartField(true)
            setShowFields(data.object.BillingCodeType)
            setIsItemUsed(false)
            setIsInventory(false)
            if (invoceSDMaster.invoceSDMaster.PriceCodeOther) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeOther)
            } else {
                setPriceSheetValue('STD')
            }
        } else if (data.id && data.object.BillingCodeType == "E") {
            setShowFields(data.object.BillingCodeType)
            setValue("CategoryId", data.id)
            setValue("CategoryDescription", data.id)
            setIsInventory(false)
            setIsItemUsed(false)
            if (invoceSDMaster.invoceSDMaster.PriceCodeOther) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeOther)
            } else {
                setPriceSheetValue('STD')
            }
        } else if (data.id && data.object.BillingCodeType == "F") {
            setShowFields(data.object.BillingCodeType)
            categoryId.current = data.id
            setValue("CategoryId", data.id)
            setValue("CategoryDescription", data.id)
            setIsInventory(false)
            setIsItemUsed(false)
            if (invoceSDMaster.invoceSDMaster.PriceCodeOther) {
                setPriceSheetValue(invoceSDMaster.invoceSDMaster.PriceCodeOther)
            } else {
                setPriceSheetValue('STD')
            }
        } else {
            setIsInventory(false)
            setIsItemUsed(false)
            setEnablePartField(true)
        }
    }

    const handleForm = (requestBody: any) => {
        setLoading(true)
        requestBody.AccountId = user_info["AccountId"];
        requestBody.CompanyId = user_info["CompanyId"];
        requestBody.IsInventory = isInventory;
        requestBody.ItemTaxable = isInventory;
        requestBody.ItemUsed = isInventory;
        requestBody.ServiceMasterId = workOrderId.workOrderId.SMId;
        requestBody.CallNum = invoiceData?.invoiceData?.InvoiceNum
        requestBody.UserID = user_info["userID"];
        requestBody.CategoryId = categoryId.current;
        requestBody.IsNoChargePaymentMethodAdded = false;
        requestBody.InvoiceNum = invoiceData.invoiceData.InvoiceNum;
        requestBody.UseTax = false;
        if (props.isEdit) {
            requestBody.Id = props.data?.Id
            requestBody.AllBillingItemsSeqNum = props.sequenceNo;
            requestBody.LaborPS = requestBody.PriceSheetUsed
        }
        WebService[props.isEdit ? "putAPI" : "postAPI"]({
            action: props.isEdit ? `SDInvoiceDetail` : `SDInvoiceDetail/SaveBillingDetails/`,
            body: requestBody,
        })
            .then((res: any) => {
                reset({})
                setValue('PartNum', '')
                setValue('CategoryDescription', '')
                setValue('Warehouse', '')
                setValue('UnitCost', '')
                setValue('RetailPrice', '')
                setValue('Discount', '')
                setResetDropDown('resetsawin')
                setResetTruck('resetsawin')
                setresetPartNum('resetsawin')
                setLoading(false)
                props.isEdit ? toast.success("Pricing Item Updated Successfully") : toast.success("Pricing Item Created Successfully")
                isCreateAnother == false && onCloseModal("Added")
            })
            .catch((e) => {
                setLoading(false)
                if (
                    e &&
                    e.response &&
                    e.response.data &&
                    e.response.data.ErrorDetails.message
                ) {
                    isCreateAnother == true && onCloseModal("Added")
                    setErrorMessage(e.response.data.ErrorDetails.message);
                } else {
                    setErrorMessage('An unkown exception has occur. Please Contact administrator');
                }
            });
    };

    const getPartDetails = () => {
        WebService.getAPI({
            action: "SaiPIPartMaster/GetParts/" + user_info['AccountId'] + "/" + user_info['CompanyId'] + "/true",
            body: null,
        })
            .then((res: any) => {
                setPartDetailsData(res)
                setPartDetailsOption(
                    res.map((item: any, index: any) => {
                        return { value: item.PartNum, id: item.PartNum, object: item };
                    })
                );
            })
            .catch((e) => { });
    };

    const onSelectPart = (e: any) => {
        let data = e.id ? e.id : e
        let SelectedPartData: any = partDetailsData.filter((item: any) => {
            return item.PartNum == data
        });
        if (SelectedPartData.length > 0) {
            // reset(SelectedPartData[0]);
            setValue("ItemCategory", PartCategeory);
            setValue("UnitCost", SelectedPartData[0]?.PurchaseCost);
            setValue("CategoryDescription", SelectedPartData[0]?.PurchaseDescription);
            unitCost.current = SelectedPartData[0]?.PurchaseCost
            onGetCalulatedAmount(1, showFields)
        } else {
            setValue("PartNum", data);
        }
    }

    const getTruckOptions = () => {
        WebService.getAPI({
            action: `SetupSDTruckWarehouse/${user_info["AccountId"]}/${user_info["CompanyId"]}/true`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        code: res[i].TruckWarehouseNum,
                        value: res[i].Name,
                        id: res[i].TruckWarehouseNum,
                    });
                }
                setTruckOption(temp);
            })
            .catch((e) => { });
    };

    const getLocationOption = () => {
        WebService.getAPI({
            action: `SetupGLBreak/${user_info["AccountId"]}/${user_info["CompanyId"]}/1`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        value: res[i].BreakName,
                        id: res[i].BreakCode,
                    });
                }
                setLocationOption(temp);
            })
            .catch((e) => { });
    };

    const getClassOption = () => {
        WebService.getAPI({
            action: `SetupGLBreak/${user_info["AccountId"]}/${user_info["CompanyId"]}/2`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        value: res[i].BreakName,
                        id: res[i].BreakName,
                    });
                }
                setClassOption(temp);
            })
            .catch((e) => { });
    };

    const getServiceTypeOption = () => {
        WebService.getAPI({
            action: `SetupSDServiceType/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        code: res[i].ServiceType,
                        value: res[i].ServiceTypeDescription,
                        id: res[i].ServiceType,
                    });
                }
                setServiceTypeOption(temp);
            })
            .catch((e) => { });
    };

    const getEquipmentLogOptions = () => {
        WebService.getAPI({
            action: `SDEquipmentMaster/GetServiceMasterEquipments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${workOrderId?.workOrderId?.SMId}`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        code: res[i].EqpManufacturer,
                        value: res[i].EqpModel,
                        id: res[i].SDEquipmentMasterId,
                        value2: res[i].SerialNo,
                    });
                }

                setEquipmentLogOption(temp);
            })
            .catch((e) => { });
    };

    const getPriceSheetOptions = () => {
        WebService.getAPI({
            action: `SetupSDPriceSheet/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}/true`,
            body: null,
        })
            .then((res: any) => {
                setPS(res)
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        code: res[i].PriceCode,
                        value: res[i].PriceCodesDesc,
                        id: res[i].PriceCode,
                    });
                }
                setPriceSheetOption(temp);
            })
            .catch((e) => { });
    };

    const getLaborClassOption = () => {
        WebService.getAPI({
            action: `SetupSDTechLevel/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res.Data) {
                    temp.push({
                        value: res.Data[i].Description,
                        id: res.Data[i].TechLevel,
                    });
                }
                setLaborClassOption(temp);
            })
            .catch((e) => { });
    };

    const getVendorOption = () => {
        WebService.getAPI({
            action: `SaiAPVendorMaster/GetVendors/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                let temp: any = [];
                for (let i in res) {
                    temp.push({
                        value: res[i].Name,
                        id: res[i].VendorId,
                    });
                }
                setVendorOption(temp);
            })
            .catch((e) => { });
    };

    const onGetCalulatedAmount = (qty: any, fields: any, extCost?: any) => {
        var code = ''
        if (fields == 'A' || fields == 'B') {
            if (invoceSDMaster.invoceSDMaster.PriceCodeMat) {
                code = invoceSDMaster.invoceSDMaster.PriceCodeMat
            } else {
                code = 'STD'
            }
        } else if (fields == 'C') {
            if (invoceSDMaster.invoceSDMaster.PriceCodeLab) {
                code = invoceSDMaster.invoceSDMaster.PriceCodeLab
            } else {
                code = 'STD'
            }
        } else if (fields == 'D' || fields == 'E' || fields == 'F') {
            if (invoceSDMaster.invoceSDMaster.PriceCodeOther) {
                code = invoceSDMaster.invoceSDMaster.PriceCodeOther
            } else {
                code = 'STD'
            }
        }
        var requestedBody = {
            BillingCodeType: fields,
            PriceCode: props.isEdit == true ? '' : code,
            TaxCode: invoiceData.invoiceData.TaxCode,
            LaborType: typeOfLabour,
            UseTax: false,
            UnitCost: extCost ? extCost : unitCost.current.toString(),
            tempUnitCost: '0',
            Quantity: qty,
            IsTaxable: isItemTaxable,
            ServiceType: invoiceData.invoiceData.ServiceTypeId,
            InvoiceNum: invoiceData.invoiceData.InvoiceNum,
            CategoryId: categoryId.current,
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            ItemEntrySource: 'S'
        }
        WebService.postAPI({
            action: `SDInvoice/GetCalculatedCharges`,
            body: requestedBody
        })
            .then((res: any) => {
                setValue('Quantity', res.Data.Quantity && HelperService.formateDecimal(res.Data.Quantity))
                setValue('UnitCost', res.Data.UnitCost && HelperService.formateDecimal(res.Data.UnitCost))
                res.Data.RetailPrice &&  setValue('RetailPrice', HelperService.formateDecimal(res.Data.RetailPrice))
                if (res.Data.Discount && res.Data.Discount != 0 ) {
                    setValue('Discount', HelperService.formateDecimal(res.Data.Discount))
                }
            })
            .catch((e) => {

            })
    }
    var isShowPriceSheet = true;
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
                onHide={() => onCloseModal("not added")}
                placement={"end"}
                className="offcanvas-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{!props.isEdit ? "Add Billing Detail" : "Edit Billing Detail"}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
                    {
                        priceSheetValue &&
                        ps.map((res: any) => {
                            if (priceSheetValue == res.PriceCode) {
                                isShowPriceSheet = false
                            }
                        })
                    }
                    {
                        (isShowPriceSheet && priceSheetValue && priceSheetValue != 'STD') ?
                            <div className="pricesheetMessage">
                                <p className="pricesheetMessageText">Pricesheet Standard is not active</p>
                            </div>
                            :
                            <div>
                                {
                                    priceSheetValue === 'STD' &&
                                    <div className="pricesheetMessage">
                                        <p className="pricesheetMessageText">Pricesheet is not configured</p>
                                    </div>
                                }
                            </div>
                    }
                    <form onSubmit={handleSubmit(handleForm)}>
                        <div className="modal-body px-3 employee-mater-model">

                            <div className=" service-address">
                                <div className="service-location-form form-style">
                                    <div className="row mt-3 mb-5 pb-5">
                                        <div className="col-6 form-group">
                                            <Label title="Category" showStar={true} />
                                            <Controller
                                                control={control}
                                                name="ItemCategory"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={categoryOption}
                                                        selected={resetDropDown}
                                                        isDisable={props.isEdit}
                                                        onChange={(data: any) => {
                                                            {
                                                                reset({})
                                                                setValue('CategoryDescription', '')
                                                                setValue('UnitCost', '')
                                                                setValue('PartNum', '')
                                                                setValue('RetailPrice', '')
                                                                setValue('Discount', '')
                                                                field.onChange(data)
                                                                handleCategory(data);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.ItemCategory && (
                                                <Label
                                                    title={"Please Select Item Category."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group align-self-end mb-3">
                                            <div className=" ">
                                                <ToggleButton
                                                    isChecked={isInventory}
                                                    isDisable={true}
                                                    title="Is Inventory"
                                                    label_id=""
                                                    onChange={(data: any) => setIsInventory(data)}
                                                />
                                            </div>
                                        </div>
                                        {showFields == "A" &&
                                            <div className="col-6 form-group">
                                                <Label title="Part #" showStar={true} />
                                                <div className="d-flex action-btns action-ele">
                                                    {/* <Controller
                                                        control={control}
                                                        name="PartNum"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={partDetailsOption}
                                                                selected={resetPartNum}
                                                                isDisable={(watchAllFields.ItemCategory ? false : true) || props.isEdit}
                                                                isHideArrow={true}
                                                                isCustomInput={true}
                                                                isSearchable={true}
                                                                type={"ARROW"}
                                                                onChange={(data: any) => {
                                                                    categoryId.current = data.id ? data.id : data
                                                                    { field.onChange(data.id ? data.id : data); onSelectPart(data ? data.id : data) }
                                                                }}
                                                            />
                                                        )}
                                                    /> */}
                                                    <Controller
                                                        control={control}
                                                        name="PartNum"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <PartsAdvanceSearch
                                                                isInventory={true}
                                                                selected={resetPartNum}
                                                                onChange={(data: any) => {
                                                                    categoryId.current = data.id
                                                                    field.onChange(data.id); onSelectPart(data)
                                                                }} />
                                                        )}
                                                    />
                                                </div>
                                                {errors.PartNum && (
                                                    <Label
                                                        title={"Please Enter Part #."}
                                                        modeError={true}
                                                    />
                                                )}
                                            </div>
                                        }
                                        {showFields == "B" &&
                                            <div className="col-6 form-group">
                                                <Label title="Part #" showStar={true} />
                                                <div className="d-flex action-btns action-ele">
                                                    <input
                                                        className="form-control input"
                                                        type="text"
                                                        disabled={enablePartField || props.isEdit}
                                                        {...register("PartNum")}
                                                    ></input>
                                                </div>
                                                {errors.PartNum && (
                                                    <Label
                                                        title={"Please Enter Part #."}
                                                        modeError={true}
                                                    />
                                                )}
                                            </div>
                                        }
                                        {showFields == "C" && <>
                                            <div className="col-6 form-group">
                                                <Label title="Type" showStar={true} />
                                                <div className="d-flex action-btns action-ele">
                                                    <Controller
                                                        control={control}
                                                        name="PartNum"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={labourType}
                                                                selected={typeOfLabour}
                                                                isDisable={props.isEdit}
                                                                onChange={(data: any) => {
                                                                    {
                                                                        field.onChange(data.id)
                                                                        setValue("CategoryDescription", data.value)
                                                                    }
                                                                }
                                                                }
                                                            />
                                                        )}
                                                    />

                                                </div>
                                                {errors.Type && (
                                                    <Label
                                                        title={"Please Select Type."}
                                                        modeError={true}
                                                    />
                                                )}
                                            </div>
                                            <div className="col-6 form-group">
                                                <Label title="Class" />
                                                <div className="d-flex action-btns action-ele">
                                                    <Controller
                                                        control={control}
                                                        name="LaborClass"
                                                        rules={{ required: false }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={laborClassOption}
                                                                selected={classOfLabour}
                                                                onChange={(data: any) => {
                                                                    { field.onChange(data.id) }
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                        }
                                        {showFields == "D" &&
                                            <>
                                                <div className="col-6 form-group">
                                                    <Label title="Vendor" showStar={true} />
                                                    <div className="d-flex action-btns action-ele">
                                                        <Controller
                                                            control={control}
                                                            name="Vendor"
                                                            rules={{ required: true }}
                                                            render={({ field }) => (
                                                                <SawinSelect
                                                                    options={vendorOption}
                                                                    isDisable={!enablePartField}
                                                                    isHideArrow={true}
                                                                    isCustomInput={true}
                                                                    isSearchable={true}
                                                                    selected={selectedVendor}
                                                                    onChange={(data: any) => {
                                                                        { data.id && field.onChange(data.id); data.value && setValue("CategoryDescription", data.value) }
                                                                    }}
                                                                />
                                                            )}
                                                        />

                                                    </div>
                                                    {errors.Vendor && (
                                                        <Label
                                                            title={"Please Select Vendor."}
                                                            modeError={true}
                                                        />
                                                    )}
                                                </div>
                                                <div className="col-6 form-group">
                                                    <Label title="Name" showStar={true} />
                                                    <div className="d-flex action-btns action-ele">
                                                        <input
                                                            className="form-control input"
                                                            type="text"
                                                            {...register("CategoryDescription", { required: true })}
                                                        ></input>
                                                    </div>
                                                    {errors.VendorName && (
                                                        <Label
                                                            title={"Please Enter Vendor Name."}
                                                            modeError={true}
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        }
                                        {showFields == "E" &&
                                            <div className="col-6 form-group">
                                                <Label title="Category Id" showStar={true} />
                                                <div className="d-flex action-btns action-ele">
                                                    <input
                                                        className="form-control input"
                                                        type="text"
                                                        disabled={true}
                                                        {...register("CategoryId", { required: true })}
                                                    ></input>
                                                </div>
                                            </div>
                                        }
                                        {showFields == "F" &&
                                            <div className="col-6 form-group">
                                                <Label title="Category Id" showStar={true} />
                                                <div className="d-flex action-btns action-ele">
                                                    <input
                                                        className="form-control input"
                                                        type="text"
                                                        disabled={true}
                                                        {...register("CategoryId", { required: true })}
                                                    ></input>
                                                </div>
                                            </div>
                                        }
                                        {
                                            showFields !== "D" &&
                                            <div className="col-12 form-group">
                                                <Label title="Description" showStar={true} />
                                                <textarea
                                                    rows={3}
                                                    disabled={watchAllFields.ItemCategory ? false : true}
                                                    className="form-control form-control-textarea h-auto"
                                                    {...register("CategoryDescription", { required: true })}
                                                />
                                                {errors.CategoryDescription && (
                                                    <Label
                                                        title={"Please Enter Description."}
                                                        modeError={true}
                                                    />
                                                )}
                                            </div>
                                        }
                                        {
                                            showFields == "C" &&
                                            <div className="col-6 form-group">
                                                <Label title="Hours" />
                                                <input
                                                    className="form-control input"
                                                    type="text"
                                                    {...register("hrs", { required: false })}
                                                    onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                                                    onBlur={(e) => onGetCalulatedAmount(e.target.value, showFields)}
                                                ></input>
                                            </div>
                                        }
                                        {
                                            showFields != "C" &&
                                            <div className="col-6 form-group">
                                                <Label title="QTY" />
                                                <input
                                                    className="form-control input"
                                                    type="text"
                                                    disabled={watchAllFields.ItemCategory ? false : true}
                                                    {...register("Quantity", { required: false })}
                                                    onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                                                    onBlur={(e) => onGetCalulatedAmount(e.target.value, showFields)}
                                                ></input>
                                            </div>
                                        }
                                        {
                                            showFields == "B" &&
                                            <div className="col-6 form-group">
                                                <Label title="Unit Cost" />
                                                <input
                                                    className="form-control input"
                                                    type="text"
                                                    {...register("cost", { required: false })}
                                                    onKeyPress={(e) =>
                                                        HelperService.allowNewDecimalValue(e)
                                                    }
                                                    onBlur={(e) => {
                                                        onGetCalulatedAmount(1, showFields, (e.target as HTMLInputElement).value)
                                                        HelperService.currencyFormat(e)
                                                    }}
                                                ></input>
                                            </div>
                                        }
                                        <div className="col-6 form-group">
                                            <Label title="Ext. Cost" showStar={true} />
                                            <input
                                                className="form-control input"
                                                type="text"
                                                disabled={watchAllFields.ItemCategory && showFields == 'F' ? false : true}
                                                placeholder='0.00'
                                                {...register("UnitCost", { required: true })}
                                                onKeyPress={(e) =>
                                                    HelperService.allowNewDecimalValue(e)
                                                }
                                                onBlur={(e) => {
                                                    onGetCalulatedAmount(1, showFields, (e.target as HTMLInputElement).value)
                                                    HelperService.currencyFormat(e)
                                                }}
                                            ></input>
                                            {errors.UnitCost && (
                                                <Label
                                                    title={"Please Enter Ext. Cost."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Sales Amount" />
                                            <input
                                                className="form-control input"
                                                type="text"
                                                placeholder='0.00'
                                                disabled={watchAllFields.ItemCategory ? false : true}
                                                {...register("RetailPrice", { required: false })}
                                                onKeyPress={(e) =>
                                                    HelperService.allowNewDecimalValue(e)
                                                }
                                                onBlur={(e) => HelperService.currencyFormat(e)}
                                            ></input>
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Discount" />
                                            <input
                                                className="form-control input"
                                                type="text"
                                                placeholder='0.00'
                                                disabled={watchAllFields.ItemCategory ? false : true}
                                                {...register("Discount", { required: false })}
                                                onKeyPress={(e) =>
                                                    HelperService.allowNewDecimalValue(e)
                                                }
                                                onBlur={(e) => HelperService.currencyFormat(e)}
                                            ></input>
                                        </div>
                                        <div className="col-6 form-group align-self-end mt-2">

                                            <ToggleButton
                                                isChecked={isItemTaxable}
                                                title="Taxable"
                                                label_id=""
                                                isDisable={watchAllFields.ItemCategory ? false : true}
                                                onChange={(data: any) => setIsItemTaxable(data)}
                                            />
                                        </div>
                                        <div className="col-6 form-group align-self-end mt-2">

                                            <ToggleButton
                                                isChecked={isItemUsed}
                                                title="Item Used"
                                                label_id=""
                                                isDisable={watchAllFields.ItemCategory ? false : true}
                                                onChange={(data: any) => setIsItemUsed(data)}
                                            />
                                        </div>
                                        {/* <hr/> */}
                                        <div className="col-6 form-group">
                                            <Label title="Service Type" showStar={true} />
                                            <Controller
                                                control={control}
                                                name="ServiceType"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={serviceTypeOption}
                                                        selected={serviceType}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.ServiceType && (
                                                <Label
                                                    title={"Please Select Service Type."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Solution Code" />
                                            <Controller
                                                control={control}
                                                name=""
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={[]}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title={invoiceData.invoiceData.Break1LabelName} showStar={true} />
                                            <Controller
                                                control={control}
                                                name="BreakCode1"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={LocationOption}
                                                        selected={breakCodeOneValue}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.BreakCode1 && (
                                                <Label
                                                    title={"Please Select Location."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Equipment Log" />
                                            <Controller
                                                control={control}
                                                name="ServiceType"
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={equipmentLogOption}
                                                        column={3}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        selected={""}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title={invoiceData.invoiceData.Break2LabelName} showStar={true} />
                                            <Controller
                                                control={control}
                                                name="BreakCode2"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={classOption}
                                                        selected={breakCodeTwoValue}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.BreakCode2 && (
                                                <Label
                                                    title={`Please Select ${invoiceData.invoiceData.Break2LabelName}.`}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Price Sheet" />
                                            <Controller
                                                control={control}
                                                name="PriceSheetUsed"
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={priceSheetOption}
                                                        selected={priceSheetValue}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id);

                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="col-6 form-group">
                                            {
                                                isInventory == true ? <Label title="Truck/Warehouse" showStar={true} /> : <Label title="Truck/Warehouse" />
                                            }

                                            <Controller
                                                control={control}
                                                name="Warehouse"
                                                rules={{ required: isInventory }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={truckOption}
                                                        selected={resetTruck}
                                                        isDisable={watchAllFields.ItemCategory ? false : true}
                                                        onChange={(data: any) => {
                                                            field.onChange(data.id)
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.Warehouse && (
                                                <Label
                                                    title={"Please Select Truck/Warehouse."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="offcanvas-footer position-absolute d-flex justify-content-center">
                            {!props.isEdit && <div className="d-flex align-center mx-3 mt-1 font-w-medium">
                                <Form.Check
                                    className="mx-2"
                                    type="checkbox"
                                    checked={isCreateAnother}
                                    label="Create another"
                                    onChange={() => setCreateAnother(!isCreateAnother)}
                                />

                            </div>}
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
                                onClick={() => onCloseModal("not added")}
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

export default AddPricingItem;
