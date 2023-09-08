import { useState, useEffect } from "react";
import Editicon from "../../../../assets/images/delete-icon.svg";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import { Button, Card, Row, Col, Form } from 'react-bootstrap';
import { CheckCircleFill, CreditCard2Back } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import SawinSelect from "../../../../components/Select/SawinSelect";
import Grid, {
  GridColumn,
  GridHeader,
  GridRow,
} from "../../../../components/Grid/Grid";
import { toast } from "react-toastify";
import "./InvoiceEntry.scss"
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InviceSDMasterState, InvoiceState } from "../../../../reducer/CommonReducer";
import { getBusiness, getLocation, getPriceSheet } from "../../../../utility/CommonApiCall";
import WebService from "../../../../utility/WebService";
import HelperService from "../../../../utility/HelperService";
import AddPaymentModal from "../InvoiceEntryBlade/AddPaymentModal";
import { Label } from "../../../../components/Label/Label";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import InvoiceEntryAdditionalModal from "../InvoiceEntryBlade/InvoiceEntryAdditionalModal/InvoiceEntryAdditionalModal";
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";
import { Dispatch } from "redux";

const GenralInfo = () => {
  const [showModal, setShowModal] = useState(false);
  const CloseModal1 = () => setShowModal(false);
  const dispatch: Dispatch<any> = useDispatch();
  const componentKey = "AssociatDepo";
  const headers: GridHeader[] = [

    {
      title: "Date",
      class: "text-center",
    },
    {
      title: "Method",
      class: "text-center",
    },
    {
      title: "Reference",
    },
    {
      title: "Comments",
    },
    {
      title: "Amount",
      class: "text-end",
    },

  ];
  const [rows, setRows] = useState<GridRow[]>([]);
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [ShowLoader, setShowLoader] = useState(false);
  const invoiceData: any = useSelector<RootState, InvoiceState>(
    (state) => state.invoice);
  const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
    (state) => state.invoceSDMaster);
  const [invoiceDate, setInvoiceDate] = useState('');
  const [location, setLocation] = useState<any[]>([]);
  const [business, setBusiness] = useState<any[]>([]);
  const [associateData, setAssociateData] = useState<any[]>([]);
  const [PS, setPS] = useState<any[]>([]);
  const [leadTechnician, setLeadTechnician] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [salesman, setSalesman] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [showAddPaymentModal, setshowAddPaymentModal] = useState(false)
  const [isEditPaymentModal, setIsEditPaymentModal] = useState(false)
  const [leadTechnicianValue, setLeadTechnicianValue] = useState('');
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [newexpandOption, setNewexpandOption] = useState<any[]>([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [deletedData, setDeletedData] = useState<any>({});
  const [showAlertModel, setAlertModel] = useState(false);
  const [sdinvoiceData, setSDInvoiceData] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [materialPSValue, setMaterialPSValue] = useState("");
  const [laborPSValue, setLaborValue] = useState("")
  const [otherPSValue, setOtherPSValue] = useState("")
  const [salesmanValue, setSalesmanValue] = useState("")
  const [contractValue, setContractValue] = useState("")
  const [projectValue, setProjectValue] = useState("")
  const [taskCodeValue, setTaskCodeValue] = useState("")
  const [taxValue, setTaxValue] = useState("")
  const [maintenanceValue, setMaintenanceValue] = useState('')
  const [billingValue, setBillingValue] = useState("")
  const [poValue, setPoValue] = useState("")
  const [ChargedData, setChargedData] = useState('');
  const [ChargedIndexData, setChargedIndexData] = useState("");
  const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
  const [isLoading, setLoading] = useState(false);
  const [taxCode, setTaxCode] = useState("")

  const closeModal = (value: any, data: string) => {
    setshowAddPaymentModal(value);
    setIsEditPaymentModal(false);
    if (data === 'SAVE') {
      getInvoice();
      dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
    }
  };

  useEffect(() => {
    getInvoice()
    getSDInvoice()
    setInvoiceDate(invoiceData?.invoiceData?.InvoiceDate)
    setLeadTechnicianValue(invoiceData?.invoiceData?.LeadTechnician)
    setMaterialPSValue(invoceSDMaster.invoceSDMaster.PriceCodeMat)
    setLaborValue(invoceSDMaster?.invoceSDMaster?.PriceCodeLab)
    setOtherPSValue(invoceSDMaster?.invoceSDMaster?.PriceCodeOther)
    setSalesmanValue(invoiceData.invoiceData.Salesman)
    setContractValue(invoceSDMaster.invoceSDMaster.SDContractMasterId)
    setProjectValue(invoceSDMaster.invoceSDMaster.SDSMProjectId)
    setTaskCodeValue(sdinvoiceData.TaxCode)
    setTaxValue(sdinvoiceData.UseTax)
    setPoValue(invoceSDMaster.invoceSDMaster.CustomerPONum)
    setTaxCode(invoiceData.invoiceData?.TaxCode)
    getLocationValues()
    getBusinessValues()
    getAssociateDeposit()
    getPSValues();
    getLeadTechnician()
    getPaymentMethods()
    getSalesman()
    getAllProjects()
    taskCodeOptions()
    reset(invoceSDMaster.invoceSDMaster)

  }, [])

  const getLocationValues = () => {
    getLocation({ user_info })
      .then((res: any) => {
        var locationarray = [];
        for (var i in res) {
          locationarray.push({ id: res[i].BreakCode, value: res[i].BreakName });
        }
        setLocation(locationarray);
      })
      .catch((e: any) => { });
  };

  const getBusinessValues = () => {
    getBusiness({ user_info })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].BreakName, value: res[i].BreakName });
        }
        setBusiness(array);
      })
      .catch((e) => { });
  };

  const getAssociateDeposit = () => {
    WebService.getAPI({
      action: `SaiSDCreditCardCallPayment/GetAssociateDeposit/${invoiceData?.invoiceData?.InvoiceNum}/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        if (res.length > 0) {
          let rows: GridRow[] = [];
          for (var i in res) {
            let columns: GridColumn[] = [];
            columns.push({
              value: HelperService.getFormatedDateAndTime(res[i].ServiceDate),
            });
            columns.push({
              value: res[i].PaymentType,
            });
            columns.push({
              value: res[i].Reference,
            });
            columns.push({
              value: res[i].Comments,
            });
            columns.push({
              value: HelperService.getCurrencyFormatter(res[i].Amount),
            });
            rows.push({ data: columns });
          }
          setAssociateData(rows)
        }
      })
      .catch((e) => {

      })
  }

  const getPSValues = () => {
    getPriceSheet({ user_info })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].PriceCode, value: res[i].PriceCodesDesc });
        }
        setPS(array);
      })
      .catch(() => { });
  };


  const getLeadTechnician = () => {
    WebService.getAPI({
      action: `SDInvoice/GetAssociatedTechnicians/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].TechNameInternal, value: res[i].TechNameInternal, object: res[i] });
        }
        setLeadTechnician(array);
      })
      .catch((e) => {

      })
  }

  const getPaymentMethods = () => {
    WebService.getAPI({
      action: `SetupSDPaymentMethod/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].PaymentMethod, value: res[i].PaymentDescription, object: res[i] });
        }
        setPaymentMethod(array)
      })
      .catch((e) => {

      })
  }

  const getSalesman = () => {
    WebService.getAPI({
      action: `SetupSMSalesman/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].SalesmanName, value: res[i].SalesmanName, object: res[i] });
        }
        setSalesman(array)
      })
      .catch((e) => {

      })
  }

  const getInvoice = () => {
    WebService.getAPI({
      action: `SDInvoicePaymentInfo/GetByInvoice/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
      body: null
    })
      .then((res: any) => {
        for (var i in res) {
          res[i].Amount = HelperService.getCurrencyFormatter(res[i].Amount);
        }
        setMethods(res)
      })
      .catch((e) => {

      })
  }

  const getAllProjects = () => {
    WebService.getAPI({
      action: `SDSMProjects/GetAllProjectsNumandIdForSM/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.SMNum}`,
      body: null
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].SDSMProjectId, value: res[i].ProjectNum });
        }
        setAllProjects(array)
      })
      .catch((e) => {

      })

  }

  const taskCodeOptions = () => {
    WebService.getAPI({
      action: `SetupSaiTaxCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        const array: any = [];
        for (var i in res) {
          array.push({ id: res[i].TaxCode, value: res[i].TaxCodeDescription, code: res[i].TaxCode })
        }
        setNewexpandOption(array);
      })
      .catch((e) => { });
  };

  const getSDInvoice = () => {
    WebService.getAPI({
      action: `SDInvoice/340/1/1005`,
      body: null
    })
      .then((res: any) => {
        setSDInvoiceData(res)
        setTaskCodeValue(res.TaxCode)
        setTaxValue(res.UseTax)
      })
      .catch((e) => {

      })
  }


  const onSubmit = (requestedBody: any) => {
    requestedBody.Id = invoiceData.invoiceData.InvoiceNum
    requestedBody.InvoiceNum = invoiceData.invoiceData.InvoiceNum
    requestedBody.ARCustomerMasterId = invoceSDMaster.invoceSDMaster.ARCustomerMasterId
    requestedBody.BreakType1 = invoceSDMaster.invoceSDMaster.BreakType1
    requestedBody.BreakType2 = invoceSDMaster.invoceSDMaster.BreakType2
    requestedBody.CompanyId = user_info["CompanyId"]
    requestedBody.AccountId = user_info["AccountId"]
    requestedBody.PriceCodeLab = laborPSValue
    requestedBody.PriceCodeMat = materialPSValue
    requestedBody.PriceCodeOther = otherPSValue

    setLoading(true)
    WebService.putAPI({
      action: `SDInvoice`,
      body: requestedBody
    })
      .then((res: any) => {
        setLoading(false)
        toast.success("General Info updated succesfully.")
      })
      .catch((e: any) => {
        setLoading(false)
      })
  }

  const onAddMethod = () => {
    let emptyCount = 0;
    methods.map((item: any) => {
      item.PaymentMethod == "" && ++emptyCount
    });
    if (emptyCount < 4) {
      let amt: any = invoiceData?.invoiceData?.FormatedAmountDue ? invoiceData?.invoiceData?.FormatedAmountDue : 0.00;
      if (methods[methods.length - 1].PaymentMethod == "CK") {
        let temp1 = invoiceData?.invoiceData?.FormatedAmountDue.replaceAll(",", "")
        let temp2 = methods[methods.length - 1].Amount.replaceAll(",", "")
        amt = temp1 - temp2
      }
      methods.push({ PaymentMethod: '', Amount: amt, Reference: '', TypeOfTerms: '' })
      setMethods([...methods])
    }

  }

  const onSavePaymentMethods = (index: any, data: any) => {
    var method = '';
    var amount = '';
    var reference = '';
    var type = '';
    for (var i in methods) {
      if (i == index) {
        method = methods[i].PaymentMethod
        amount = methods[i].Amount
        reference = methods[i].Reference
        type = methods[i].TypeOfTerms
      }
    }
    if (method) {
      setLoading(true)
      var requestedBody = {
        InvoiceNum: invoiceData.invoiceData.InvoiceNum,
        PaymentMethod: method,
        Reference: reference,
        Amount: amount,
        TypeOfTerms: type,
        IsEdited: true,
        IsSubmitted: true,
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        Id: data.Id ? data.Id : ''
      }
      WebService.postAPI({
        action: `SDInvoicePaymentInfo/UpdateOrCreateInvoicePaymentMethod`,
        body: requestedBody
      })
        .then((res) => {
          setLoading(false)
          toast.success(data.Id ? 'Payment is updated successfully' : 'Payment Method is added successfully')
          getInvoice()
        })
        .catch((e) => {
          setLoading(false)
        })
    } else {
      toast.error("Please Select Method")
    }
  }

  const onDelete = (data: any) => {
    setShowDeleteModal(true);
    setDeletedData(data);
  };

  const onDeletePaymentMethod = () => {
    setShowDeleteModal(false);
    setLoading(true)
    WebService.deleteAPI({
      action: `SDInvoicePaymentInfo/${user_info["AccountId"]}/${user_info["CompanyId"]}/${deletedData?.InvoiceNum}/${deletedData?.Id}`,
      body: null,
      isShowError: false,
    })
      .then((res) => {
        setLoading(false)
        toast.success("Payment Method deleted successfully.");
        getInvoice()
      })
      .catch((e) => {
        setLoading(false)
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  };


  const onCheckPaymentCharge = (data: any, index: any) => {
    setLoading(true)
    WebService.getAPI({
      action: `SDInvoicePaymentInfo/IsValidatToChargePaymentMethod/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData.invoiceData.InvoiceNum}`,
      body: null
    })
      .then((res) => {
        setChargedData(data);
        setChargedIndexData(index);
        setshowAddPaymentModal(!showAddPaymentModal);
        setLoading(false);
      })
      .catch((e) => {
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
        setLoading(false)
      })
  }

  const closeAdditionalModal = (value: any, data: any) => {
    setShowModal(false)
    if (data.CustomerPONum || data.ContractNum || data.PriceCodeMat || data.SalesmanNum || data.PriceCodeLab || data?.PriceCodeOther || data?.ContractNum || data?.CustomerPONum) {
      setLeadTechnicianValue(data?.LeadTechNum1)
      setMaterialPSValue(data?.PriceCodeMat)
      setLaborValue(data?.PriceCodeLab)
      setOtherPSValue(data?.PriceCodeOther)
      setSalesmanValue(data?.SalesmanNum1)
      setContractValue(data?.ContractNum)
      setMaintenanceValue(data?.maintanace)
      setPoValue(data?.CustomerPONum)
      setProjectValue(data?.OperatorCode1)
      setTaxCode(data?.TaxCode);
      setTaxValue(data?.TaxValue)
    }
  }



  return <>
    <Loader show={isLoading} />
    <AddPaymentModal
      isShow={showAddPaymentModal}
      title={'Add Payment '}
      isClose={closeModal}
      data={ChargedData}
      value={ChargedIndexData}
    />
    <DraggableModal
      isOpen={errorMessage != ""}
      onClose={() => setErrorMessage("")}
      title="Alert"
      type="ALERT_MODEL"
      width={600}
      previousData={errorMessage} />

    <DraggableModal
      isOpen={isShoWDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      title="Alert"
      type="DELETE_MODAL"
      width={600}
      delete={onDeletePaymentMethod}
    />
    <InvoiceEntryAdditionalModal
      isShow={showModal}
      isClose={closeAdditionalModal}
      psOption={PS}
      leadTechnicianOption={leadTechnician}
      salesmanOption={salesman}
      projectOption={allProjects}
      taxCodeOption={newexpandOption}
      materialValue={invoceSDMaster.invoceSDMaster.PriceCodeMat}
      labourValue={invoceSDMaster?.invoceSDMaster?.PriceCodeLab}
      otherValue={invoceSDMaster?.invoceSDMaster?.PriceCodeOther}
      poValue={poValue}
      technicianValue={leadTechnicianValue}
      salesmanValue={salesmanValue}
      maintenanceValue={invoceSDMaster.invoceSDMaster.SDContractMasterId}
      maintenanceItem={maintenanceValue}
      billingValue={''}
      projectValue={projectValue}
      taskCodeValue={sdinvoiceData.TaxCode}
      useTaxValue={taxValue}
      contractNum={contractValue}
      taxCode={taxCode}
    />

    <div className='page-content-wraper general-Info'>
      <Row>
        <form onSubmit={handleSubmit(onSubmit)} className="form-style">
          <Col md={12} id="wideCol">
            <BackComponent title={'General Info'} />
            <Card className="card-style form-style">
              <Card.Header className="bg-transparent border-light">
                <Row>
                  <Col lg={4}>
                    <Form.Group className="" controlId="formBasicEmail">
                      <Form.Label>Invoice Date</Form.Label>
                      <Controller
                        control={control}
                        name="InvoiceDate"
                        render={({ field }) => (
                          <SawinDatePicker
                            selected={invoiceDate}
                            onChange={(data: any) => field.onChange(data)}
                          />
                        )}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="" controlId="formBasicEmail">
                      <Form.Label>{invoiceData?.invoiceData?.Break1LabelName} <span className="text-danger">*</span></Form.Label>
                      <Controller
                        control={control}
                        rules={{ required: true }}
                        name="BreakCode1"
                        render={({ field }) => (
                          <SawinSelect
                            options={location}
                            selected={invoiceData?.invoiceData?.Break1Name}
                            type={"ARROW"}
                            onChange={(data: any) => field.onChange(data.id)}
                          />
                        )}
                      />
                      {errors.BreakCode1 && (
                        <Label
                          title={`Please select ${invoiceData?.invoiceData?.Break1LabelName}.`}
                          modeError={true}
                        />
                      )}
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="" controlId="formBasicEmail">
                      <Form.Label>{invoiceData?.invoiceData?.Break2LabelName} <span className="text-danger">*</span></Form.Label>
                      <Controller
                        control={control}
                        rules={{ required: true }}
                        name="BreakCode2"
                        render={({ field }) => (
                          <SawinSelect
                            options={business}
                            selected={invoiceData?.invoiceData?.Break2Name}
                            type={"ARROW"}
                            onChange={(data: any) => field.onChange(data.id)}
                          />
                        )}
                      />
                      {errors.BreakCode2 && (
                        <Label
                          title={`Please select ${invoiceData?.invoiceData?.Break2LabelName}.`}
                          modeError={true}
                        />
                      )}
                    </Form.Group>
                  </Col>

                </Row>
              </Card.Header>
              <Card.Body className="border-bottom border-light">
                <Row className="align-items-center mb-3">
                  <Col><h4 className="mb-0 font-18 text-dark">Additional Information</h4></Col>
                  <Col className="text-end"><Button variant="light" className="btn-brand-light" onClick={() => setShowModal(!showModal)}>+ Additional Information</Button></Col>
                </Row>
                <Form className="form-style">
                  <div className=" ">
                    <Row className="text-dark">
                      {
                        materialPSValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <p className="mb-0 font-w-medium font-14">Material Price Sheet</p>
                            <p className="font-14 mb-0">{materialPSValue}</p>
                            {/* <Controller
                              control={control}
                              name="PriceCodeMat"
                              render={({ field }) => (
                                <SawinSelect
                                  options={PS}
                                  type={"ARROW"}
                                  selected={materialPSValue}
                                  onChange={(data: any) => field.onChange(data.id)}
                                />
                              )}
                            /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        taxCode &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <p className="mb-0 font-w-medium font-14">Tax Code</p>
                            <p className="font-14 mb-0">{taxCode}</p>
                          </Form.Group>
                        </Col>
                      }
                      {
                        laborPSValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <p className="mb-0 font-w-medium font-14">Labor Price Sheet</p>
                            <p className="font-14 mb-0">{laborPSValue}</p>
                            {/* <Form.Label>Labor Price Sheet</Form.Label>
                            <Controller
                              control={control}
                              name="PriceCodeLab"
                              render={({ field }) => (
                                <SawinSelect
                                  options={PS}
                                  type={"ARROW"}
                                  selected={laborPSValue}
                                  onChange={(data: any) => field.onChange(data.id)}
                                />
                              )}
                            /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        otherPSValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <p className="mb-0 font-w-medium font-14">Other Price Sheet</p>
                            <p className="font-14 mb-0">{otherPSValue}</p>
                            {/* <Form.Label>Other Price Sheet</Form.Label>
                            <Controller
                              control={control}
                              name="PriceCodeOther"
                              render={({ field }) => (
                                <SawinSelect
                                  options={PS}
                                  type={"ARROW"}
                                  selected={otherPSValue}
                                  onChange={(data: any) => field.onChange(data.id)}
                                />
                              )}
                            /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        poValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <p className="mb-0 font-w-medium font-14">PO #</p>
                            <p className="font-14 mb-0">{poValue}</p>
                            {/* <Form.Label>PO #</Form.Label>
                          <input
                            className="form-control"
                            placeholder="PO #"
                            type="text"
                            {...register("CustomerPONum")}
                          /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        leadTechnicianValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Lead Technician</p>
                            <p className="font-14 mb-0">{leadTechnicianValue}</p>
                            {/* <Form.Label>Lead Technician</Form.Label>
                            <Controller
                              control={control}
                              name="LeadTechNum"
                              render={({ field }) => (
                                <SawinSelect
                                  options={leadTechnician}
                                  selected={leadTechnicianValue}
                                  type={"ARROW"}
                                  onChange={(data: any) => field.onChange(data.onject.TechNum)}
                                />
                              )}
                            /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        salesmanValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Salesman</p>
                            <p className="font-14 mb-0">{salesmanValue}</p>
                            {/* <Form.Label>Salesman</Form.Label>
                            <Controller
                              control={control}
                              name="SalesmanNum"
                              render={({ field }) => (
                                <SawinSelect
                                  options={salesman}
                                  selected={salesmanValue}
                                  type={"ARROW"}
                                  onChange={(data: any) => field.onChange(data.object.SalesmanNum)}
                                />
                              )}
                            /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        contractValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Contract #</p>
                            <p className="font-14 mb-0">{contractValue}</p>
                            {/* <Form.Label>Contract #</Form.Label>
                            <Form.Control type="text" placeholder="Contract #" value={contractValue} /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        maintenanceValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Maintenance Item #</p>
                            <p className="font-14 mb-0">{maintenanceValue}</p>
                            {/* <Form.Label>Maintenance Item #</Form.Label>
                          <Form.Control type="text" placeholder="Maintenance Item" disabled={true} /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        billingValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Billing Line #</p>
                            <p className="font-14 mb-0"></p>
                            {/* <Form.Label>Billing Line #</Form.Label>
                          <SawinSelect
                            options={[]}
                            type={"ARROW"}
                            onChange={() => console.log("fd")}
                          /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        projectValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Project #</p>
                            <p className="font-14 mb-0">{projectValue}</p>
                            {/* <Form.Label>Project #</Form.Label>
                          <Controller
                            control={control}
                            name="OperatorCode"
                            render={({ field }) => (
                              <SawinSelect
                                options={allProjects}
                                selected={projectValue}
                                type={"ARROW"}
                                onChange={(data: any) => field.onChange(data.id)}
                              />
                            )}
                          /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        taskCodeValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Task Code</p>
                            <p className="font-14 mb-0">{taskCodeValue}</p>
                            {/* <Form.Label>Task Code</Form.Label>
                          <Controller
                            control={control}
                            name="TaxCode"
                            render={({ field }) => (
                              <SawinSelect
                                options={newexpandOption}
                                selected={taskCodeValue}
                                type={"ARROW"}
                                onChange={(data: any) => field.onChange(data.code)}
                              />
                            )}
                          /> */}
                          </Form.Group>
                        </Col>
                      }
                      {
                        taxValue &&
                        <Col md="4">
                          <Form.Group className="mb-3" controlId="">
                            <p className="mb-0 font-w-medium font-14">Use Tax</p>
                            <Form.Group className="" controlId="UseTax">
                              <Form.Check type="checkbox" label=" " checked={taxValue ? true : false} />
                            </Form.Group>
                          </Form.Group>
                        </Col>
                      }
                    </Row>
                  </div>
                </Form>
              </Card.Body>
              {
                associateData.length > 0 &&
                <Card.Body className="border-bottom border-light">
                  <h4 className="mb-0 font-18 text-dark">Associate Deposit</h4>
                  <Grid headers={gridHeader}
                    rows={associateData}
                    ShowLoader={ShowLoader}
                    storeKey={componentKey}

                    errorMessage={'No Data Found'} />
                  {
                    invoiceData?.invoiceData?.InvoiceTotal > 0 &&
                    <div className="total-div">
                      <p className="mb-0 text-dark"><span className="font-w-medium">Total:</span> {HelperService.getCurrencyFormatter(invoiceData?.invoiceData?.InvoiceTotal)} </p>
                    </div>
                  }

                </Card.Body>
              }

              <Card.Body className="border-bottom border-light">
                <Row className="align-items-center mb-2">
                  <Col><h4 className="mb-0 font-18 text-dark">Payment Methods</h4></Col>
                  <Col className="text-end"><Button variant="light" className="btn-brand-light" onClick={() => onAddMethod()} disabled={methods.length >= 4 ? true : false}>+ Add</Button></Col>
                </Row>
                {
                  methods.map((res, index: any) => {
                    return (
                      <Row>
                        <Col lg={3}>
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Method ({index + 1})</Form.Label>
                            <SawinSelect
                              options={paymentMethod}
                              selected={res.PaymentMethod}
                              isDisable={res.PaymentAuthCode ? true : false}
                              type={"ARROW"}
                              onChange={(data: any) => {
                                setMethods(methods.map((option: any, i: number) => {
                                  return i == index ? {
                                    ...option,
                                    TypeOfTerms: data?.object?.TypeOfTerms,
                                    PaymentMethod: data.id
                                  } : {
                                    ...option
                                  };
                                }));
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col>
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Amount ({index + 1})</Form.Label>
                            <Form.Control type="text"
                              placeholder="Amount"
                              value={(res.Amount)}
                              disabled={res.PaymentAuthCode ? true : false}
                              onChange={(e) => {
                                methods[index].Amount = e.target.value;
                                setMethods([...methods]);
                              }}
                              onKeyPress={(e) =>
                                HelperService.allowOnlyNumericValue(e)
                              }
                              onBlur={(e) => {
                                HelperService.currencyFormat(e)

                              }} />
                          </Form.Group>
                        </Col>
                        <Col >
                          <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Reference ({index + 1})</Form.Label>
                            <Form.Control type="text"
                              placeholder="Reference"
                              value={res.Reference}
                              disabled={res.PaymentAuthCode ? true : false}
                              onChange={(e) => {
                                methods[index].Reference = e.target.value;
                                setMethods([...methods]);
                              }}
                            />
                          </Form.Group>
                        </Col>
                        <Col className="align-self-center text-dark">
                          {
                            res.PaymentAuthCode ?
                              <div className="mt-2 font-14 ">{res.PaymentAuthCode}</div>
                              :
                              <Form.Group className="mb-3" controlId="formBasicEmail">
                                {
                                  res.TypeOfTerms != 'CHG' &&
                                  <div>
                                    <Form.Label>Cash Date</Form.Label>
                                    <Controller
                                      control={control}
                                      name="startDate"
                                      render={({ field }) => (
                                        <SawinDatePicker
                                          onChange={(data: any) => field.onChange(data)}
                                        />
                                      )}
                                    />
                                  </div>
                                }

                              </Form.Group>
                          }
                        </Col>
                        <Col className="align-self-center " style={{ maxWidth: "75px" }}>
                          {
                            res.PaymentAuthCode ? ''
                              :
                              <div>
                                {
                                  res.Id && res.TypeOfTerms === 'CHG' ?
                                    <a href="javascript:void(0)" className="text-success me-2" onClick={() => {
                                      setChargedData(res);
                                      setChargedIndexData(index);

                                      onCheckPaymentCharge(res, index)
                                    }}><CreditCard2Back size={18} className="text-brand" title="Charge" /></a>
                                    :
                                    <a href="javascript:void(0)" className="text-success me-2" onClick={() => onSavePaymentMethods(index, res)}> <CheckCircleFill size={20} /> </a>
                                }
                                <a href="javascript:void(0)" onClick={() => onDelete(res)} className=" "> <img src={Editicon} alt="delete" width={18} /> </a>
                              </div>
                          }
                        </Col>
                      </Row>
                    )
                  })
                }
                <div className="d-flex justify-content-center col-12 mt-3">
                  <Button variant="primary" className="btn-brand-solid me-3" type="submit">Save</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </form>
      </Row>
    </div>


  </>;
};

export default GenralInfo;


