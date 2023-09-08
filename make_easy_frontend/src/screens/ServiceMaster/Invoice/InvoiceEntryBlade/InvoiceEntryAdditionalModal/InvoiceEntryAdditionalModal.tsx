import { Button, Row, Col, Form, Offcanvas } from 'react-bootstrap';
import SawinSelect from "../../../../../components/Select/SawinSelect";
import { useForm, Controller } from "react-hook-form";
import InputGroup from "react-bootstrap/InputGroup";
import BsButton from "react-bootstrap/Button";
import { Search } from "react-bootstrap-icons";
import ContractInvoiceBlade from '../ContractInvoiceBlade/ContractInvoiceBlade';
import { useEffect, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import HelperService from '../../../../../utility/HelperService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InviceSDMasterState, InvoiceState } from '../../../../../reducer/CommonReducer';
import detachIcon from "../../../../../assets/images/detachIcon.png"
import Loader from '../../../../../components/Loader/Loader';

interface PropData {
    isShow: boolean;
    isClose: any;
    psOption: any;
    leadTechnicianOption: any;
    salesmanOption: any;
    projectOption: any;
    taxCodeOption: any;
    materialValue: any;
    labourValue: any;
    otherValue: any;
    poValue: any;
    technicianValue: any;
    salesmanValue: any;
    maintenanceValue: any;
    billingValue: any;
    projectValue: any;
    taskCodeValue: any;
    useTaxValue: any;
    maintenanceItem:any;
    contractNum:any;
    taxCode:any;
}

const InvoiceEntryAdditionalModal = (props: PropData) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
    } = useForm();
    const [showContractModal, setShowContractModal] = useState(false)
    const [billingLine, setBillingLine] = useState<any[]>([]);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>((state) => state.invoceSDMaster);
    const invoiceData: any = useSelector<RootState, InvoiceState>((state) => state.invoice);
    const [isDetach, setIsDetach] = useState(false)
    const [DetachData, setDetach] = useState<any>({});
    const [isLoading, setLoading] = useState(false);
    const [leadTechnician,setLeadTechnician] = useState("")
    const [salesman,setSalesman] = useState("")
    const [projectValue, setProjectValue] = useState("");
    const [taxValue, setTaxValue] = useState(false)


    useEffect(() => {
        if (props.isShow == true) {
            let requestedData = {
                PriceCodeMat: props?.materialValue,
                PriceCodeLab: props?.labourValue,
                PriceCodeOther: props?.otherValue,
                CustomerPONum: props?.poValue,
                LeadTechNum: props?.technicianValue,
                SalesmanNum: props?.salesmanValue,
                // ContractNum :props?.salesmanValue,
                ContractNum: props?.contractNum,
                billingLine: props?.billingValue,
                OperatorCode: props?.projectValue,
                UseTax: props?.useTaxValue,
                maintanace:props?.maintenanceItem,
                TaxCode:props?.taxCode,
            }
            reset(requestedData)
            if (props?.maintenanceValue) {
                setIsDetach(true)
                setDetach({ ContractNum: props?.maintenanceValue, billingLine: props?.billingValue, })
            }
            setTaxValue(props.useTaxValue ? true : false)
        }
    }, [props.isShow])

    const CloseModal = (e: any) => {
        props.isClose(!props.isShow, e);
    }

    const closeContractModal = (value: any, data: any) => {
        setShowContractModal(false)
        if (data) {
            setIsDetach(true)
            setValue('maintanace', data.second.data[0].value)
            setValue('ContractNum', data.first.ContractNum)
            getBillingLine(data.first.ContractNum)
            setDetach({ ContractNum: data.first.ContractNum, maintanace: data.second.data[0].value, })
        }

    }

    const getBillingLine = (id: any) => {
        WebService.getAPI({
            action: `SaiSDContract/GetContractRegularBilling/${user_info["AccountId"]}/${user_info["CompanyId"]}/${id}/${invoceSDMaster.invoceSDMaster.Id}`,
            body: null
        })
            .then((res: any) => {
                var array = [];
                for (var i in res.Data) {
                    array.push({ id: res.Data[i].SeqNum, value: res.Data[i].ScheduleDate && HelperService.getFormatedDate(res.Data[i].ScheduleDate), code: res.Data[i].BillingSeqNumber });
                }
                setBillingLine(array)
            })
            .catch((e) => { })
    }

    const onSubmit = (data: any) => {
        data.LeadTechNum1 = leadTechnician !== "" ? leadTechnician : data.LeadTechNum;
        data.SalesmanNum1 = salesman !== "" ? salesman : data.SalesmanNum
        data.OperatorCode1 = projectValue !== "" ? projectValue : data.OperatorCode
        data.TaxValue = taxValue
        CloseModal(data)
    }

    const detachContract = () => {
        setLoading(true)
        WebService.getAPI({
            action: `SDInvoice/DetachContractFromInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${DetachData?.ContractNum}/${invoiceData.invoiceData.InvoiceNum}`,
            body: null
        })
            .then((res: any) => {
                setLoading(false)
                setIsDetach(false)
                setValue('maintanace', '')
                setValue('ContractNum', "")
            })
            .catch((e) => { setLoading(false) })
    }


    return (
        <>
            <ContractInvoiceBlade
                isShow={showContractModal}
                isClose={closeContractModal}
            />
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={() => CloseModal({})} placement={'end'} className="offcanvas-large" >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>General Info - Additional Info</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className=" px-0 pb-0">
                    <form onSubmit={handleSubmit(onSubmit)} className="form-style">
                        <div className="px-4 pb-3  modal-inner-min-h">
                            <Row>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Material Price Sheet</Form.Label>
                                        <Controller
                                            control={control}
                                            name="PriceCodeMat"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.psOption}
                                                    type={"ARROW"}
                                                    selected={props.materialValue}
                                                    onChange={(data: any) => { field.onChange(data.id) }}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Labor Price Sheet</Form.Label>
                                        <Controller
                                            control={control}
                                            name="PriceCodeLab"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.psOption}
                                                    type={"ARROW"}
                                                    selected={props.labourValue}
                                                    onChange={(data: any) => field.onChange(data.id)}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>Other Price Sheet</Form.Label>
                                        <Controller
                                            control={control}
                                            name="PriceCodeOther"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.psOption}
                                                    type={"ARROW"}
                                                    selected={props.otherValue}
                                                    onChange={(data: any) => field.onChange(data.id)}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="formBasicEmail">
                                        <Form.Label>PO #</Form.Label>
                                        <input
                                            className="form-control"
                                            placeholder="PO #"
                                            type="text"
                                            {...register("CustomerPONum")}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Lead Technician</Form.Label>
                                        <Controller
                                            control={control}
                                            name="LeadTechNum"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.leadTechnicianOption}
                                                    selected={props.technicianValue}
                                                    type={"ARROW"}
                                                    onChange={(data: any) => {setLeadTechnician(data.id);field.onChange(data.object.TechNum)}}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Salesman</Form.Label>
                                        <Controller
                                            control={control}
                                            name="SalesmanNum"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.salesmanOption}
                                                    selected={props.salesmanValue}
                                                    type={"ARROW"}
                                                    onChange={(data: any) => {setSalesman(data.id); field.onChange(data.object.SalesmanNum)}}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <div className="d-flex">
                                        <Form.Group className="mb-3" controlId="">
                                            <Form.Label>Contract #</Form.Label>
                                            <InputGroup className="">
                                                <input
                                                    type="text"
                                                    disabled={true}
                                                    className="form-control input"
                                                    {...register("ContractNum")}
                                                />
                                                <BsButton
                                                    variant="outline-secondary"
                                                    id="button-addon2"
                                                    onClick={() =>
                                                        setShowContractModal(!showContractModal)
                                                    }
                                                >
                                                    <Search size={17} className="icon" />
                                                </BsButton>


                                            </InputGroup>

                                        </Form.Group>
                                        {
                                            isDetach == true &&

                                            <a className='mt-4 mx-1' onClick={() => detachContract()}><img src={detachIcon} /></a>
                                        }
                                    </div>

                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Maintenance Item #</Form.Label>
                                        <input
                                            className="form-control"
                                            placeholder="Maintenance Item #"
                                            type="text"
                                            disabled={true}
                                            {...register("maintanace")}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Billing Line #</Form.Label>
                                        <SawinSelect
                                            options={billingLine}
                                            type={"ARROW"}
                                            onChange={() => console.log("fd")}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Project #</Form.Label>
                                        <Controller
                                            control={control}
                                            name="OperatorCode"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.projectOption}
                                                    selected={props.projectValue}
                                                    isCustomInput={true}
                                                    isSearchable={true}
                                                    isHideArrow={true}
                                                    type={"ARROW"}
                                                    onChange={(data: any) => {setProjectValue(data.value); field.onChange(data.id)}}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Tax Code</Form.Label>
                                        <Controller
                                            control={control}
                                            name="TaxCode"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={props.taxCodeOption}
                                                    selected={props?.taxCode}
                                                    type={"ARROW"}
                                                    onChange={(data: any) => {field.onChange(data.code)}}
                                                />
                                            )}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md="4">
                                    <Form.Group className="mb-3" controlId="">
                                        <Form.Label>Use Tax</Form.Label>
                                        <Form.Group className="" controlId="UseTax">
                                            <Form.Check type="checkbox" label=" " checked={taxValue} onClick={()=>setTaxValue(!taxValue)} />
                                        </Form.Group>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>
                        <div className="offcanvas-footer">
                            <Button variant="primary" className="btn-brand-solid me-3" type="submit">Submit</Button>
                            <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => CloseModal({})}>Cancel</Button>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default InvoiceEntryAdditionalModal;