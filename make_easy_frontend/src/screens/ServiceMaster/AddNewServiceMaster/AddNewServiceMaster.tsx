import { useState, useEffect } from "react";
import "./AddNewServiceMaster.scss";
import { Label } from "../../../components/Label/Label";
import { Button } from "../../../components/Button/Button";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import {
  AddressState,
  SDMaster,
  getDictionaryState,
  SDBilling,
} from "../../../reducer/CommonReducer";
import {
  setDataInRedux,
  SET_ACTIVE_TAB,
  SEARCH_RESULT,
} from "../../../action/CommonAction";

import WebService from "../../../utility/WebService";
import Loader from "../../../components/Loader/Loader";
import { useForm, Controller } from "react-hook-form";
import SawinSelect from "../../../components/Select/SawinSelect";
import HelperService from "../../../utility/HelperService";
import BackComponent from "../../../components/BackComponent/BackComponent";
import Card from "react-bootstrap/Card";
import BsButton from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import EditAddressModal from "../../../components/EditAddressModal/EditAddressModal";
import GoogleAddressModal from "../../../components/GoogleAddressModal/GoogleAddressModal";
import { toast } from "react-toastify";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const AddNewServiceMaster = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm();
  const watchAllFields = watch();
  const dispatch: Dispatch<any> = useDispatch();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [isShowGoogleModel, setShowGoogleModel] = useState(false);
  const addAddress: any = useSelector<RootState, AddressState>(
    (state) => state.addressData
  );
  const masterData: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );

  const billingData: any = useSelector<RootState, SDBilling>(
    (state) => state.sdBilling
  );
  const [isShowEditModel, setShowEditModel] = useState(false);
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary
  );
  const [isLoading, setLoading] = useState(false);
  const [termsList, setTermsList] = useState<any>([]);
  const [zoneList, setZoneList] = useState<any>([]);
  const [taxCodeList, setTaxCode] = useState<any[]>([]);
  const [address, setAddress] = useState<any>({});
  const [creditData, setCreditData] = useState<any>({});
  const [addressModalData, setAddressModalData] = useState();
  const [defaultsValue, setDefaultsValue] = useState<any>({});
  const [isTaxable, setIsTaxable] = useState(false);
  const [taxCodeValue, setTaxCodeValue] = useState("");
  const [zoneValue, setZoneValue] = useState("");
  let history = useNavigate();

  useEffect(() => {
    if (addAddress.addressData.type === "SERVICE_LOCATION") {
      setAddress(addAddress.addressData.ARCustomerMaster);
    } else {
      // setAddress(addAddress.addressData)
    }
    getTermsList();
    getZoneList();
    getCreditLimit();
    getTaxCode();
  }, [addAddress]);

  useEffect(() => {
    if (window.location.pathname != "/add-service-master") {
      console.log(billingData);
      setValue(
        "ARCustomerMasterCompanyName",
        billingData?.billing?.CompanyName
      );
      setValue("ARCustomerMasterFirstName", billingData?.billing?.FirstName);
      setValue("ARCustomerMasterLastName", billingData?.billing?.LastName);
      setValue(
        "ARCustomerMasterPhoneNumber",
        HelperService.getFormattedContact(billingData?.billing?.PhoneNumber)
      );
      setValue("ARCustomerMasterEmail", billingData?.billing?.Email);
      setValue(
        "ARCustomerMasterCreditLimit",
        billingData?.billing?.CreditLimit
      );
      var defaultAddress = {
        Address1: billingData?.billing?.Address1,
        Address2: billingData?.billing?.Address2,
        City: billingData?.billing?.City,
        ZipCode: billingData?.billing?.ZipCode,
        State: billingData?.billing?.State,
      };
      setAddress({ ARCustomerMaster: defaultAddress });
      setZoneValue(address.Zone);
    }
  }, []);

  useEffect(() => {
    getDefaultsValue();
  }, []);

  const goBack = () => {
    window.history.back();
  };

  const getTermsList = () => {
    setLoading(true);
    WebService.getAPI({
      action: `SetupARPaymentTerms/GetActive/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].TermCode, value: res[i].TermDescription });
        }
        setTermsList(array);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };
  const getZoneList = () => {
    setLoading(true);
    WebService.getAPI({
      action: `SetupSDZone/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].Zone, value: res[i].ZoneDescr });
        }
        setZoneList(array);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getCreditLimit = () => {
    setLoading(true);
    WebService.getAPI({
      action: `SetupARCompany/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        setCreditData(res[0]);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getDefaultsValue = () => {
    setLoading(true);
    WebService.getAPI({
      action: `SetupSDServiceMasterDefault/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        console.log(res[0]);
        setDefaultsValue(res[0]);
        if (res[0] && res[0].PaymentTerms) {
          setValue("TermDescription", res[0].PaymentTerms);
          setIsTaxable(res[0].IsTaxable);
          setValue("TaxCode", res[0].TaxCode);
          setTaxCodeValue(res[0].TaxCode);
          setZoneValue(res[0].Zone);
          setValue("Zone", res[0].Zone);
        }

        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const getTaxCode = () => {
    WebService.getAPI({
      action: `SetupSaiTaxCode/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({
            id: res[i].TaxCode,
            value: res[i].TaxCodeDescription,
          });
        }
        setTaxCode(array);
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
      });
  };

  const closeAddressModel = (showGoogleModal: any, data: any) => {
    setShowEditModel(false);
    if (showGoogleModal === "ON_SAVE") {
      setShowGoogleModel(true);
      setAddressModalData(data);
    }
  };

  const closeGoogleModel = (showGoogleModal: any, data: any) => {
    setShowGoogleModel(false);
    if (showGoogleModal === "SERVICE_LOCATION") {
      address.Address1 = data.Address1;
      address.Address2 = data.Address2;
      address.City = data.City;
      address.State = data.State;
      address.ZipCode = data.ZipCode;
      address.IsCustomerVerified = data.googleVerified === false ? true : false;
      address.IsGoogleVerified = data.googleVerified === true ? true : false;
      if (
        watchAllFields?.ARCustomerMaster?.DefaultBillToFromServiceLocation ===
        true
      ) {
        address.ARCustomerMaster = {
          Address1: data.Address1,
          Address2: data.Address2,
          City: data.City,
          State: data.State,
          ZipCode: data.ZipCode,
          IsCustomerVerified: data.googleVerified === false ? true : false,
          IsGoogleVerified: data.googleVerified === true ? true : false,
        };
      }
    } else if (showGoogleModal === "BILL_INFO") {
      address.ARCustomerMaster = {
        Address1: data.Address1,
        Address2: data.Address2,
        City: data.City,
        State: data.State,
        ZipCode: data.ZipCode,
        IsCustomerVerified: data.googleVerified === false ? true : false,
        IsGoogleVerified: data.googleVerified === true ? true : false,
      };
    }
  };

  const onSubmit = (editData: any) => {
    if (
      watchAllFields?.ARCustomerMaster?.DefaultBillToFromServiceLocation ===
      true
    ) {
      if (address.Address1 || address.Address2) {
        setLoading(true);
        const requestBody = {
          ServiceCompanyName: editData.CompanyName,
          ServiceFirstName: editData.FirstName,
          ServiceLastName: editData.LastName,
          ServiceEmail: editData.Email,
          ServiceWorkPhone: editData.PhoneNumber
            ? editData.PhoneNumber.replaceAll("-", "")
            : "",
          ServiceHomePhone: editData.HomePhone
            ? editData.HomePhone.replaceAll("-", "")
            : "",
          TermCode: editData.TermDescription,
          CreditLimit: editData.ARCustomerMasterCreditLimit,
          ARStatus: "CustomerWithSM",
          ServiceAddress1: address.Address1,
          ServiceAddress2: address.Address2,
          ServiceCity: address.City,
          ServiceState: address.State,
          ServiceZipCode: address.ZipCode,
          AccountId: user_info.AccountId,
          CompanyId: user_info.CompanyId,
          IsGoogleVerified: address.IsGoogleVerified,
          IsCustomerVerified: address.IsCustomerVerified,
          IsTaxable: isTaxable,
          Zone: editData.Zone,
          TaxCode: editData.TaxCode,
          CompanyName: editData.ARCustomerMasterCompanyName,
          FirstName: editData.ARCustomerMasterFirstName,
          LastName: editData.ARCustomerMasterLastName,
          Email: editData.ARCustomerMasterEmail,
          PhoneNumber: editData.ARCustomerMasterPhoneNumber
            ? editData.ARCustomerMasterPhoneNumber.replaceAll("-", "")
            : "",
          Phone: editData.HomePhone
            ? editData.HomePhone.replaceAll("-", "")
            : "",
          ServicePhoneNumber: editData.PhoneNumber
            ? editData.PhoneNumber.replaceAll("-", "")
            : "",
          Address1: address.ARCustomerMaster.Address1,
          Address2: address.ARCustomerMaster.Address2,
          City: address.ARCustomerMaster.City,
          State: address.ARCustomerMaster.State,
          ZipCode: address.ARCustomerMaster.ZipCode,
        };
        WebService.postAPI({
          action: `ARCustomerMasterV2`,
          body: requestBody,
          isFormData: false,
        })
          .then((res: any) => {
            // setLoading(false);
            //    saveServiceData(editData, res);
            dispatch(
              setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" })
            );
            toast.success("Services master created successfully.");
            history("/service-master");
            dispatch(setDataInRedux({ type: SEARCH_RESULT, value: res }));
            
            setLoading(false);
            // goBack();
          })
          .catch((e) => {
            setLoading(false);
          });
      } else {
        toast.error("Please add address");
      }
    } else {
      if (
        (address?.ARCustomerMaster?.Address1 != undefined ||
          address?.ARCustomerMaster?.Address2 != undefined) &&
        (address.Address1 != undefined || address.Address1 != undefined)
      ) {
        setLoading(true);
        const requestBody = {
          Id:
            window.location.pathname == "/add-new-same-customer-master"
              ? masterData.sd_master.ARCustomerMasterId
              : "",
          CompanyName: editData.ARCustomerMasterCompanyName,
          FirstName: editData.ARCustomerMasterFirstName,
          LastName: editData.ARCustomerMasterLastName,
          Email: editData.ARCustomerMasterEmail,
          PhoneNumber: editData.ARCustomerMasterPhoneNumber
            ? editData.ARCustomerMasterPhoneNumber.replaceAll("-", "")
            : "",
          Phone: editData.HomePhone
            ? editData.HomePhone.replaceAll("-", "")
            : "",
          ServicePhoneNumber: editData.PhoneNumber
            ? editData.PhoneNumber.replaceAll("-", "")
            : "",
          TermCode: editData.TermDescription,
          CreditLimit: editData.ARCustomerMasterCreditLimit,
          ARStatus: "CustomerWithSM",
          Address1: address.ARCustomerMaster.Address1,
          Address2: address.ARCustomerMaster.Address2,
          City: address.ARCustomerMaster.City,
          State: address.ARCustomerMaster.State,
          ZipCode: address.ARCustomerMaster.ZipCode,
          Zone: editData.Zone,
          AccountId: user_info.AccountId,
          CompanyId: user_info.CompanyId,
          IsGoogleVerified: address.ARCustomerMaster.IsGoogleVerified,
          IsCustomerVerified: address.ARCustomerMaster.IsCustomerVerified,
          IsTaxable: isTaxable,
          TaxCode: editData.TaxCode,

          ServiceCompanyName: editData.CompanyName,
          ServiceFirstName: editData.FirstName,
          ServiceLastName: editData.LastName,
          ServiceEmail: editData.Email,
          ServiceWorkPhone: editData.PhoneNumber
            ? editData.PhoneNumber.replaceAll("-", "")
            : "",
          ServiceHomePhone: editData.HomePhone
            ? editData.HomePhone.replaceAll("-", "")
            : "",
          ServiceAddress1: address.Address1,
          ServiceAddress2: address.Address2,
          ServiceCity: address.City,
          ServiceState: address.State,
          ServiceZipCode: address.ZipCode,
        };
        WebService.postAPI({
          action: `ARCustomerMasterV2`,
          body: requestBody,
          isFormData: false,
        })
          .then((res: any) => {
            // // setLoading(false);
            // saveServiceData(editData, res);

            dispatch(
              setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" })
            );
            toast.success("Services master created successfully.");
            dispatch(setDataInRedux({ type: SEARCH_RESULT, value: res }));
            setLoading(false);
            goBack();
          })
          .catch((e) => {
            setLoading(false);
          });
      } else {
        toast.error("Please add address");
      }
    }
  };

  const saveServiceData = (data: any, response: any) => {
    // var requestedData = {
    //   ...defaultsValue,
    //   CompanyName: data.CompanyName,
    //   FirstName: data.FirstName,
    //   LastName: data.LastName,
    //   WorkPhone: data.PhoneNumber,
    //   HomePhone: data.HomePhone,
    //   Email: data.Email,
    //   Zone: data.Zone,
    //   TermDescription: data.ARCustomerMaster.TermDescription,
    //   ARCustomerMasterId:
    //     window.location.pathname != "/add-service-master"
    //       ? masterData.sd_master.ARCustomerMasterId
    //       : response.ARCustomerMasterId,
    //   Address1: address.Address1,
    //   Address2: address.Address2,
    //   City: address.City,
    //   State: address.State,
    //   ZipCode: address.ZipCode,
    //   AccountId: user_info.AccountId,
    //   CompanyId: user_info.CompanyId,
    //   IsGoogleVerified: address.IsGoogleVerified,
    //   IsCustomerVerified: address.IsCustomerVerified,
    //   IsTaxable: isTaxable,
    //   TaxCode: data.TaxCode,
    //   IsActive: true,
    //   CustomFields: {
    //     AccountId: user_info.AccountId,
    //     CompanyId: user_info.CompanyId,
    //     EntityType: "1",
    //     Field1: "",
    //     Field2: "",
    //     Field3: "",
    //     Field4: "",
    //   },
    // };
    // requestedData.PriceCodeLab = requestedData.MaterialPriceSheet;
    // requestedData.PriceCodeMat = requestedData.LaborPriceSheet;
    // requestedData.PriceCodeOther = requestedData.OtherPriceSheet;
    // requestedData.SAllowed = requestedData.SmsAllowed;
    // requestedData.SendSurvey = requestedData.OptInForSurvey;
    // requestedData.EmailAllowed = requestedData.EmailAllowed;
    // requestedData.SendNotifications = requestedData.SendNotification;
    // requestedData.UseInvoicePricing = requestedData.UseInventoryPricing;
    // requestedData.OverrideCreditLimit = requestedData.OverrideCreditLimit;
    // requestedData.Code = requestedData.CustomerSource;
    // requestedData.BreakCode1 = requestedData.Break1Code;
    // requestedData.BreakCode2 = requestedData.Break2Code;
    // requestedData.Id = "";
    // requestedData.BreakType1 = 1;
    // requestedData.BreakType2 = 2;
    // requestedData.Id = "";
    // WebService.postAPI({
    //   action: `SDServiceMaster/${user_info.AccountId}_${user_info.CompanyId}`,
    //   body: requestedData,
    // })
    //   .then((res: any) => {
    //     dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));
    //     toast.success("Services master created successfully.");
    //     dispatch(setDataInRedux({ type: SEARCH_RESULT, value: res }));
    //     setLoading(false);
    //     goBack();
    //   })
    //   .catch((e) => {
    //     setLoading(false);
    //   });
  };

  const onAddAddress = (type: string) => {
    localStorage.setItem("MODAL_TYPE", type);
    setShowEditModel(!isShowEditModel);
  };

  const setServiceValue = (value: boolean) => {
    setValue("ARCustomerMasterCompanyName", watchAllFields.CompanyName);
    setValue("ARCustomerMasterFirstName", watchAllFields.FirstName);
    setValue("ARCustomerMasterLastName", watchAllFields.LastName);
    setValue("ARCustomerMasterPhoneNumber", watchAllFields.PhoneNumber);
    setValue("ARCustomerMasterEmail", watchAllFields.Email);
    setValue("ARCustomerMaster.DefaultBillToFromServiceLocation", value);
    address.ARCustomerMaster = {
      Address1: address.Address1,
      Address2: address.Address2,
      City: address.City,
      State: address.State,
      ZipCode: address.ZipCode,
    };
    clearErrors("ARCustomerMasterCompanyName");
    clearErrors("ARCustomerMasterFirstName");
    clearErrors("ARCustomerMasterLastName");
    clearErrors("ARCustomerMasterPhoneNumber");
    clearErrors("ARCustomerMasterEmail");
  };

  return (
    <>
      <Loader show={isLoading} />
      <div className="edit-address">
        <EditAddressModal
          isShow={isShowEditModel}
          isClose={closeAddressModel}
          data={
            localStorage.getItem("MODAL_TYPE") === "SERVICE_LOCATION"
              ? address
              : address.ARCustomerMaster
          }
        />
        <GoogleAddressModal
          isOpen={addressModalData ? isShowGoogleModel : false}
          close={closeGoogleModel}
          data={addressModalData}
        />
        <div className="page-content-wraper">
          <div className="back-arrow">
            <BackComponent
              title={
                window.location.pathname != "/add-service-master"
                  ? `Add Service For Same Customer Master (${masterData.sd_master.ARCustomerMasterId})`
                  : `Add ${dictionary.db_ServiceMaster}`
              }
            />
          </div>
          <Card className="content-card card-shadow p-0">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card.Body>
                <div className="row">
                  {/* SERVICE LOCATION INFO */}
                  <div className="col-lg-6 mb-lg-0 mb-4">
                    <div className="service-location-info mb-2">
                      Service Location Info
                    </div>

                    <div className="service-location-form form-style">
                      <div className="row">
                        <div className="col-12 form-group">
                          <Label
                            title="Company"
                            showStar={
                              watchAllFields.FirstName &&
                              watchAllFields.LastName
                                ? false
                                : true
                            }
                          />
                          <input
                            className="form-control input"
                            type="text"
                            {...register("CompanyName", {
                              required:
                                watchAllFields.FirstName &&
                                watchAllFields.LastName
                                  ? false
                                  : true,
                            })}
                            onKeyUp={(e) => {
                              if (
                                watchAllFields?.ARCustomerMaster
                                  ?.DefaultBillToFromServiceLocation === true
                              ) {
                                setValue(
                                  "ARCustomerMasterCompanyName",
                                  e.currentTarget.value
                                );
                              }

                              if (watchAllFields.CompanyName) {
                                setValue(
                                  "ARCustomerMasterCreditLimit",
                                  HelperService.getCurrencyFormatter(
                                    creditData.DefaultCreditBalanceCommercial
                                  )
                                );
                              } else if (
                                !watchAllFields.CompanyName &&
                                watchAllFields.FirstName &&
                                watchAllFields.LastName
                              ) {
                                setValue(
                                  "ARCustomerMasterCreditLimit",
                                  HelperService.getCurrencyFormatter(
                                    creditData.DefaultCreditBalanceResidential
                                  )
                                );
                              } else if (
                                !watchAllFields.CompanyName &&
                                (!watchAllFields.FirstName ||
                                  !watchAllFields.LastName)
                              ) {
                                setValue("ARCustomerMasterCreditLimit", "");
                              }
                            }}
                            placeholder="Company Name"
                          />
                          {(!watchAllFields.FirstName ||
                            !watchAllFields.LastName) &&
                            errors.CompanyName && (
                              <Label
                                title={"Please enter company name."}
                                modeError={true}
                              />
                            )}
                        </div>
                      </div>
                      <Label
                        title="Name"
                        showStar={watchAllFields.CompanyName ? false : true}
                      />
                      <div className="row">
                        <div className="col-6 form-group">
                          <input
                            className="form-control input"
                            type="text"
                            {...register("FirstName", {
                              required: watchAllFields.CompanyName
                                ? false
                                : true,
                            })}
                            onKeyUp={(e) => {
                              if (
                                watchAllFields?.ARCustomerMaster
                                  ?.DefaultBillToFromServiceLocation === true
                              ) {
                                setValue(
                                  "ARCustomerMasterFirstName",
                                  e.currentTarget.value
                                );
                              }
                              if (
                                !watchAllFields.CompanyName &&
                                watchAllFields.FirstName &&
                                watchAllFields.LastName
                              ) {
                                setValue(
                                  "ARCustomerMasterCreditLimit",
                                  HelperService.getCurrencyFormatter(
                                    creditData.DefaultCreditBalanceResidential
                                  )
                                );
                              }
                              if (
                                !watchAllFields.CompanyName &&
                                !watchAllFields.FirstName
                              ) {
                                setValue("ARCustomerMasterCreditLimit", "");
                              }
                            }}
                            placeholder="First Name"
                          />
                          {!watchAllFields.CompanyName && errors.FirstName && (
                            <Label
                              title={"Please enter first name."}
                              modeError={true}
                            />
                          )}
                        </div>
                        <div className="col-6 form-group">
                          <input
                            className="form-control input"
                            type="text"
                            {...register("LastName", {
                              required: watchAllFields.CompanyName
                                ? false
                                : true,
                            })}
                            onKeyUp={(e) => {
                              if (
                                watchAllFields?.ARCustomerMaster
                                  ?.DefaultBillToFromServiceLocation === true
                              ) {
                                setValue(
                                  "ARCustomerMasterLastName",
                                  e.currentTarget.value
                                );
                              }
                              if (!watchAllFields.CompanyName) {
                                setValue(
                                  "ARCustomerMasterCreditLimit",
                                  HelperService.getCurrencyFormatter(
                                    creditData.DefaultCreditBalanceResidential
                                  )
                                );
                              }
                              if (
                                !watchAllFields.CompanyName &&
                                !watchAllFields.LastName
                              ) {
                                setValue("ARCustomerMasterCreditLimit", "");
                              }
                            }}
                            placeholder="Last Name"
                          />
                          {!watchAllFields.CompanyName && errors.LastName && (
                            <Label
                              title={"Please enter last name."}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                      <div className="horizontal-line" />
                      <div
                        className="d-flex align-items-center"
                        style={{ minHeight: 32 }}
                      >
                        <div className="col-6">
                          <Label title="Address" showStar={true} />
                        </div>
                        {address?.Address1 || address?.Address2 ? null : (
                          <div className="col-6 d-flex justify-content-end add-button-view">
                            <BsButton
                              variant="light"
                              className="btn-brand-light btn-small"
                              onClick={() => onAddAddress("SERVICE_LOCATION")}
                            >
                              + Add
                            </BsButton>
                          </div>
                        )}
                        {(address?.Address1 || address?.Address2) && (
                          <div className="col-md-6 text-end">
                            <BsButton
                              className="btn-brand-light btn-small"
                              type="button"
                              onClick={() => onAddAddress("SERVICE_LOCATION")}
                            >
                              Edit
                            </BsButton>
                          </div>
                        )}
                      </div>
                      <div className="form-group">
                        {(address?.Address1 || address?.Address2) && (
                          <div className="service-location-address col-12 p-2 font-14 d-flex">
                            <div className="col-12 p-0">
                              <div className="address-text">
                                {address?.Address1} {address.Address2}
                              </div>
                              <div className="address-text">
                                {address.City}, {address.ZipCode},{" "}
                                {address.State}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div></div>
                      <div className="horizontal-line" />
                      <div className="row">
                        <div className="col-6 form-group">
                          <Label title="Primary Number" showStar={true} />
                          <input
                            className="form-control input"
                            type="text"
                            onKeyPress={(e) =>
                              HelperService.allowOnlyNumericValue(e)
                            }
                            onKeyUp={(e) => {
                              HelperService.contactFormatter(e);

                              if (
                                watchAllFields?.ARCustomerMaster
                                  ?.DefaultBillToFromServiceLocation === true
                              ) {
                                setValue(
                                  "ARCustomerMasterPhoneNumber",
                                  e.currentTarget.value
                                );
                              }
                            }}
                            {...register("PhoneNumber", {
                              required: true,
                              minLength: 12,
                            })}
                            placeholder="Primary Number"
                          />
                          {errors.PhoneNumber && (
                            <Label
                              title={"Please enter valid primary number."}
                              modeError={true}
                            />
                          )}
                        </div>
                        <div className="col-6 form-group">
                          <Label title="Secondary Number" />
                          <input
                            className="form-control input"
                            onKeyPress={(e) =>
                              HelperService.allowOnlyNumericValue(e)
                            }
                            onKeyUp={(e) => HelperService.contactFormatter(e)}
                            type="text"
                            {...register("HomePhone", {
                              required: false,
                              minLength: 12,
                            })}
                            placeholder="Secondary Number"
                          />
                          {errors.HomePhone && (
                            <Label
                              title={"Please enter valid secondary number."}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                      <div className="row ">
                        <div className="col-6 form-group">
                          <Label title="Email" />
                          <input
                            className="form-control input"
                            onKeyUp={(e: any) => {
                              HelperService.isValidEmail(e.target.value);
                              if (
                                watchAllFields?.ARCustomerMaster
                                  ?.DefaultBillToFromServiceLocation === true
                              ) {
                                setValue(
                                  "ARCustomerMasterEmail",
                                  (e.target as HTMLInputElement).value
                                );
                              }
                            }}
                            type="text"
                            {...register("Email", {
                              required: false,
                              pattern:
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            })}
                            placeholder="Email"
                          />
                          {errors.Email && (
                            <Label
                              title={"Please enter valid email."}
                              modeError={true}
                            />
                          )}
                        </div>

                        <div className="col-6 form-group">
                          <Label title="Zone" showStar={true} />
                          <Controller
                            control={control}
                            name="Zone"
                            rules={{ required: true }}
                            render={({ field }) => (
                              <SawinSelect
                                options={zoneList}
                                selected={zoneValue}
                                disValue="BreakName"
                                value="BreakCode"
                                onChange={(data: any) =>
                                  field.onChange(data.id)
                                }
                              />
                            )}
                          />
                          {errors.Zone && (
                            <Label
                              title={"Please select zone."}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6 form-group pt-3 align-self-end">
                          <Form.Group
                            className="mb-2 mt-3"
                            controlId="Is_Taxable"
                          >
                            <Form.Check
                              type="checkbox"
                              label="Is Taxable"
                              checked={isTaxable}
                              onChange={() => {
                                setIsTaxable(!isTaxable);
                              }}
                            />
                          </Form.Group>
                        </div>
                        {isTaxable && (
                          <div className="col-6 form-group">
                            <div className="left-side">
                              <Label
                                title="Tax"
                                showStar={isTaxable === true ? true : false}
                              />
                            </div>
                            <Controller
                              control={control}
                              name="TaxCode"
                              rules={{
                                required: isTaxable === true ? true : false,
                              }}
                              render={({ field }) => (
                                <SawinSelect
                                  options={taxCodeList}
                                  selected={taxCodeValue}
                                  disValue="BreakName"
                                  value="BreakCode"
                                  isHideArrow={true}
                                  onChange={(data: any) =>
                                    field.onChange(data.id)
                                  }
                                />
                              )}
                            />
                            {errors.TaxCode && (
                              <Label
                                title={`Please select Tax.`}
                                modeError={true}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BILL TO INFO */}
                  <div className="col-lg-6">
                    <div className="col-12 d-flex justify-content-between mb-2">
                      <div className="service-location-info col-4">
                        Bill To Info
                      </div>
                      <div className="col-7">
                        <Form.Group
                          className="d-flex justify-content-end"
                          controlId="formBasicCheckbox"
                        >
                          <Form.Check
                            type="checkbox"
                            disabled={
                              window.location.pathname ===
                              "/add-new-same-customer-master"
                                ? true
                                : false
                            }
                            defaultChecked={
                              window.location.pathname ===
                              "/add-new-same-customer-master"
                                ? false
                                : true
                            }
                            label="Default from service location"
                            {...register(
                              "ARCustomerMaster.DefaultBillToFromServiceLocation",
                              { required: false }
                            )}
                            onChange={() => {
                              watchAllFields.ARCustomerMaster.DefaultBillToFromServiceLocation =
                                !watchAllFields.ARCustomerMaster
                                  .DefaultBillToFromServiceLocation;
                              setServiceValue(
                                watchAllFields.ARCustomerMaster
                                  .DefaultBillToFromServiceLocation
                              );
                            }}
                          />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="service-location-form form-style">
                      <div className="col-12 ">
                        <div className="col-12 form-group">
                          <Label
                            title="Company"
                            showStar={
                              watchAllFields.ARCustomerMasterFirstName &&
                              watchAllFields.ARCustomerMasterLastName
                                ? false
                                : true
                            }
                          />
                          <input
                            className="form-control input"
                            type="text"
                            {...register("ARCustomerMasterCompanyName", {
                              required:
                                watchAllFields.ARCustomerMasterFirstName &&
                                watchAllFields.ARCustomerMasterLastName
                                  ? false
                                  : true,
                            })}
                            placeholder="Company Name"
                          />
                          {watchAllFields?.ARCustomerMaster
                            ?.DefaultBillToFromServiceLocation === false &&
                            (!watchAllFields.ARCustomerMasterFirstName ||
                              !watchAllFields.ARCustomerMasterLastName) &&
                            errors.ARCustomerMasterCompanyName && (
                              <Label
                                title={"Please enter company name."}
                                modeError={true}
                              />
                            )}
                        </div>
                      </div>
                      <Label
                        title="Name"
                        showStar={
                          watchAllFields.ARCustomerMasterCompanyName
                            ? false
                            : true
                        }
                      />
                      <div className=" row">
                        <div className="col-6 form-group">
                          <input
                            className="form-control input"
                            type="text"
                            {...register("ARCustomerMasterFirstName", {
                              required:
                                watchAllFields.ARCustomerMasterCompanyName
                                  ? false
                                  : true,
                            })}
                            placeholder="First Name"
                          />
                          {watchAllFields?.ARCustomerMaster
                            ?.DefaultBillToFromServiceLocation === false &&
                            !watchAllFields.ARCustomerMasterCompanyName &&
                            errors.ARCustomerMasterFirstName && (
                              <Label
                                title={"Please enter first name."}
                                modeError={true}
                              />
                            )}
                        </div>
                        <div className="col-6 form-group">
                          <input
                            className="form-control input"
                            type="text"
                            {...register("ARCustomerMasterLastName", {
                              required:
                                watchAllFields.ARCustomerMasterCompanyName
                                  ? false
                                  : true,
                            })}
                            placeholder="Last Name"
                          />
                          {watchAllFields?.ARCustomerMaster
                            ?.DefaultBillToFromServiceLocation === false &&
                            !watchAllFields.ARCustomerMasterCompanyName &&
                            errors.ARCustomerMasterLastName && (
                              <Label
                                title={"Please enter last name."}
                                modeError={true}
                              />
                            )}
                        </div>
                      </div>
                      <div className="horizontal-line" />
                      <div
                        className="d-flex align-items-center"
                        style={{ minHeight: 32 }}
                      >
                        <div className="col-6">
                          <Label title="Address" showStar={true} />
                        </div>
                        {watchAllFields?.ARCustomerMaster
                          ?.DefaultBillToFromServiceLocation === true ? (
                          <></>
                        ) : (
                          <>
                            {address?.ARCustomerMaster?.Address1 ||
                            address?.ARCustomerMaster?.Address2 ? null : (
                              <div className="col-6 d-flex justify-content-end add-button-view">
                                <BsButton
                                  variant="light"
                                  className="btn-brand-light btn-small"
                                  onClick={() => onAddAddress("BILL_INFO")}
                                >
                                  + Add
                                </BsButton>
                              </div>
                            )}

                            {(address?.ARCustomerMaster?.Address1 ||
                              address?.ARCustomerMaster?.Address2) && (
                              <div className="col-md-6 text-end">
                                <BsButton
                                  className="btn-brand-light btn-small"
                                  type="button"
                                  onClick={() => onAddAddress("BILL_INFO")}
                                >
                                  Edit
                                </BsButton>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div>
                        {(address?.ARCustomerMaster?.Address1 ||
                          address?.ARCustomerMaster?.Address2) && (
                          <div>
                            <div className="service-location-address d-flex p-2">
                              <div className="col-12">
                                <div className="address-text">
                                  {address?.ARCustomerMaster?.Address1}{" "}
                                  {address?.ARCustomerMaster?.Address2}
                                </div>
                                <div className="address-text">
                                  {address?.ARCustomerMaster?.City}{" "}
                                  {address?.ARCustomerMaster?.ZipCode}{" "}
                                  {address?.ARCustomerMaster?.State}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="horizontal-line" />

                      <div className=" row">
                        <div className="col-6 form-group">
                          <Label title="Primary Number" showStar={true} />
                          <input
                            className="form-control input"
                            onKeyPress={(e) =>
                              HelperService.allowOnlyNumericValue(e)
                            }
                            onKeyUp={(e) => HelperService.contactFormatter(e)}
                            type="text"
                            {...register("ARCustomerMasterPhoneNumber", {
                              required: true,
                              minLength: 12,
                            })}
                            placeholder="Primary Number"
                          />
                          {watchAllFields?.ARCustomerMaster
                            ?.DefaultBillToFromServiceLocation === false &&
                            errors.ARCustomerMasterPhoneNumber && (
                              <Label
                                title={"Please enter valid primary number."}
                                modeError={true}
                              />
                            )}
                        </div>

                        <div className="col-6 form-group">
                          <Label title="Email" />
                          <input
                            className="form-control input"
                            onKeyPress={(e: any) =>
                              HelperService.isValidEmail(e.target.value)
                            }
                            type="text"
                            {...register("ARCustomerMasterEmail", {
                              required: false,
                              pattern:
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            })}
                            placeholder="Email"
                          />
                          {errors.ARCustomerMasterEmail && (
                            <Label
                              title={"Please enter valid email."}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6 form-group">
                          <Label title="Terms" showStar={true} />
                          <Controller
                            control={control}
                            rules={{ required: true }}
                            name="TermDescription"
                            render={({ field }) => (
                              <SawinSelect
                                options={termsList}
                                selected={defaultsValue?.PaymentTerms}
                                onChange={(data: any) =>
                                  field.onChange(data.id)
                                }
                              />
                            )}
                          />
                          {errors.TermDescription && (
                            <Label
                              title={"Please select terms."}
                              modeError={true}
                            />
                          )}
                        </div>
                        <div className="col-6 form-group">
                          <Label title="Credit Limit" />
                          <input
                            className="form-control input"
                            type="text"
                            {...register("ARCustomerMasterCreditLimit", {
                              required: false,
                            })}
                            placeholder="Credit Limit"
                            onKeyPress={(e) =>
                              HelperService.allowNewDecimalValue(e)
                            }
                            onBlur={(e) => HelperService.currencyFormat(e)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
              <div className="text-center mt-4 sticky-button">
                <div className="button">
                  <Button size="large" label="Save" b_type="SAVE" />
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AddNewServiceMaster;
