import { useEffect, useState } from "react";
import "./AdditionalInformationModal.scss";
import addicon from "../../assets/images/add-icon.svg";
import deleteicon from "../../assets/images/delete-icon.svg";
import { Label } from "../../components/Label/Label";
import TextEditor from "../TextEditor/TextEditor";
import { getPriceSheet } from "../../utility/CommonApiCall";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import {
  AdditionalInfoState,
  SDMaster,
  getDictionaryState,getDefaultsState
} from "../../reducer/CommonReducer";
import SawinSelect from "../Select/SawinSelect";
import HelperService from "../../utility/HelperService";
import { Controller, useForm } from "react-hook-form";
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
  SET_ADDITIONAL_INFORMATION,
  setDataInRedux,
} from "../../action/CommonAction";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { PlusSquare } from "react-bootstrap-icons";

interface PropData {
  isShow: boolean;
  title: any;
  isClose: any;
  data: any;
}

const AdditionalInformationModal = (props: PropData) => {
  const onCloseModal = () => {
    props.isClose(!props.isShow);
  };
  const dispatch: Dispatch<any> = useDispatch();
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const addInfoData: any = useSelector<RootState, AdditionalInfoState>(
    (state) => state.additionalInformation);
    
  const dictionary: any = useSelector<RootState, getDictionaryState>(
    (state) => state.getDictionaryData?.getDictionary);

  const Defaults: any = useSelector<RootState,getDefaultsState>(
    (state) => state.getDefaults?.Defaults
  );

  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [notification, setNotification] = useState<any[]>([]);
  const [materialPsValue, setMaterialPsValue] = useState("resetSawin");
  const [labourPsValue, setLabourPsValue] = useState("resetSawin");
  const [otherPsValue, setOtherPsValue] = useState("resetSawin");
  const [PS, setPS] = useState<any[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    setValue,
  } = useForm();
  const [editorValue, setEditorValue] = useState();

  useEffect(() => {
    reset(addInfoData.AdditionalInfo);
    setEditorValue(addInfoData?.AdditionalInfo?.ProblemDescription);

    if (addInfoData?.AdditionalInfo?.PriceCodeMat) {
      setMaterialPsValue(addInfoData?.AdditionalInfo?.PriceCodeMat);
      setValue("PriceCodeMat", addInfoData?.AdditionalInfo?.PriceCodeMat);
    } else {
      setMaterialPsValue(Defaults?.PriceCodeMat);
      setValue("PriceCodeMat", Defaults?.PriceCodeMat);
    }
    if (addInfoData?.AdditionalInfo?.PriceCodeLab) {
      setLabourPsValue(addInfoData?.AdditionalInfo?.PriceCodeLab);
      setValue("PriceCodeLab", addInfoData?.AdditionalInfo?.PriceCodeLab);
    } else {
      setLabourPsValue(Defaults?.PriceCodeLab);
      setValue("PriceCodeLab", Defaults?.PriceCodeLab);
    }
    if (addInfoData?.AdditionalInfo?.PriceCodeOther) {
      setOtherPsValue(addInfoData?.AdditionalInfo?.PriceCodeOther);
      setValue("PriceCodeOther", addInfoData?.AdditionalInfo?.PriceCodeOther);
    } else {
      setOtherPsValue(Defaults?.PriceCodeOther);
      setValue("PriceCodeOther", Defaults?.PriceCodeOther);
    }

    getPSValues();
  }, [data, addInfoData,Defaults]);

  useEffect(() => {
    let obj: any = [];
    if (props?.data?.length > 0) {
      for (var i in props.data) {
        if (props.data[i].IsDefaultForEntityId === true) {
          obj.push({
            name: props.data[i].ContactName,
            email:
            Defaults &&
              Defaults.SendNotifications === true
                ? props.data[i].Email
                : "",
            contact_number:
            Defaults && Defaults.SMSAllowed === true
                ? HelperService.getFormattedContact(props.data[i].WorkPhone)
                : "",
            hasNameValidate: false,
            hasEmailValidate: false,
            hasContactValidate: false,
          });
        }
      }
    } else {
      obj.push({
        name: "",
        email: "",
        contact_number: "",
        hasNameValidate: false,
        hasEmailValidate: false,
        hasContactValidate: false,
      });
    }
    setNotification(obj);
  }, [props.data]);

  const getPSValues = () => {
    getPriceSheet({ data, user_info })
      .then((res: any) => {
        var array = [];
        for (var i in res) {
          array.push({ id: res[i].PriceCode, value: res[i].PriceCodesDesc });
        }
        setPS(array);
      })
      .catch(() => { });
  };
  const currentValue = (value: any) => {
    setEditorValue(value);
  };
  const addObj = () => {
    notification.push({
      name: "",
      email: "",
      contact_number: "",
      hasNameValidate: false,
      hasEmailValidate: false,
      hasContactValidate: false,
    });
    setNotification([...notification]);
  };
  const removeObj = (index: any) => {
    notification.splice(index, 1);
    setNotification([...notification]);
  };
  const onSubmit = (requestBody: any) => {
    var isShowError = false;
    for (var i in notification) {
      if (
        notification[i].email &&
        !HelperService.isValidEmail(notification[i].email)
      ) {
        notification[i].hasEmailValidate = true;
        isShowError = true;
      }
      if (
        notification[i].contact_number &&
        notification[i].contact_number.length < 12
      ) {
        notification[i].hasContactValidate = true;
        isShowError = true;
      }
    }
    if (isShowError == false) {
      var array = [];
      for (var i in notification) {
        for (var j in notification[i]) {
          if (notification[i][j] != null && notification[i][j] != "") {
            array.push(notification[i]);
            break;
          }
        }
      }
      if (
        data &&
        data.sd_master &&
        (data.sd_master.SendNotifications === true ||
          data.sd_master.SMSAllowed === true)
      ) {
        requestBody.notification = array;
      }
      requestBody.ProblemDescription = editorValue;
      props.isClose(!props.isShow, "ON_SAVE");
      dispatch(
        setDataInRedux({ type: SET_ADDITIONAL_INFORMATION, value: requestBody })
      );
    }
  };


  return (
    <Offcanvas
      show={props.isShow}
      onHide={onCloseModal}
      placement={"end"}
      className="offcanvas-large"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Additional Information</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
        <form onSubmit={handleSubmit(onSubmit)} className="form-style">
          <div className="modal-body px-3 modal-inner-min-h">
            <Row className="row">
              <Col lg={12} className="form-group">
                <Label
                  title="Special Instructions"
                  type="BOLD"
                  classNames="mt-3"
                />
                <TextEditor data={editorValue} editedData={currentValue} type={"NORMAL"} />
              </Col>
              <Col lg={12} className="form-group">
                <Label title="Customer PO#" type="Normal" />
                <input
                  className="form-control input"
                  type="text"
                  {...register("CustomerPONum", { required: false })}
                ></input>
              </Col>
            </Row>

            {data &&
              data.sd_master &&
              data.sd_master.SendNotifications === false &&
              data.sd_master.SMSAllowed === false ? (
              ""
            ) : (
              <div className="row">
                {notification.length > 0 && <div className="col-12">
                  <Label title="Notifications" type="BOLD" classNames="mt-2" />
                </div>
                }
                {notification.map((res, i) => {
                  return (
                    <div key={"notification_" + i} className="col-12">
                      <div className="row">
                        <div className="col">
                          <div className="row">
                            <div className="col-4 form-group">
                              <Label title="Name" />
                              <input
                                className="form-control input"
                                value={res.name}
                                onChange={(e) => {
                                  notification[i].name = e.target.value;
                                  setNotification([...notification]);
                                }}
                                type="text"
                              ></input>
                              {notification[i].hasNameValidate &&
                                !notification[i].name && (
                                  <Label
                                    title={"Please enter name."}
                                    modeError={true}
                                  />
                                )}
                            </div>
                            {data &&
                              data.sd_master &&
                              data.sd_master.SendNotifications === true && (
                                <div className="col-4 form-group">
                                  <Label title="Email" />
                                  <input
                                    className="form-control input"
                                    value={res.email}
                                    onKeyUp={(e: any) =>
                                      HelperService.isValidEmail(e.target.value)
                                    }
                                    onChange={(e) => {
                                      notification[i].email = e.target.value;
                                      setNotification([...notification]);
                                    }}
                                  ></input>
                                  {notification[i].hasEmailValidate &&
                                    !HelperService.isValidEmail(
                                      notification[i].email
                                    ) && (
                                      <Label
                                        title={"Please enter valid email."}
                                        modeError={true}
                                      />
                                    )}
                                </div>
                              )}
                            {data &&
                              data.sd_master &&
                              data.sd_master.SMSAllowed === true && (
                                <div className="col-4 form-group">
                                  <Label title="Contact Number" />
                                  <input
                                    className="form-control input"
                                    onKeyPress={(e) =>
                                      HelperService.allowOnlyNumericValue(e)
                                    }
                                    onKeyDown={(e) =>
                                      HelperService.contactFormatter(e)
                                    }
                                    onBlur={(e) =>
                                      HelperService.contactFormatter(e)
                                    }
                                    value={HelperService.getFormattedContact(res.contact_number)}
                                    onChange={(e) => {
                                      notification[i].contact_number =
                                        e.target.value;
                                      setNotification([...notification]);
                                    }}
                                    type="text"
                                  ></input>
                                  {notification[i].hasContactValidate &&
                                    notification[i]?.contact_number?.length >
                                    0 &&
                                    notification[i]?.contact_number?.length <
                                    12 && (
                                      <Label
                                        title={"Please enter valid number."}
                                        modeError={true}
                                      />
                                    )}
                                </div>
                              )}
                          </div>
                        </div>
                        <div
                          className="col-2 d-flex justify-content-end pt-3 align-items-center"
                          style={{ width: "73px" }}
                        >
                          <div className=" ">
                            {notification.length > 0 && (
                              <img
                                src={deleteicon}
                                onClick={() => removeObj(i)}
                                id="img_downarrow"
                                height={16}
                                className="deleteicon"
                                alt="downarrow"
                              />
                            )}
                          </div>
                          <div className=" ">
                            <a
                              href="javascript:void(0)"
                              onClick={() => addObj()}
                              id="img_downarrow"
                              className="addicon text-brand"
                            >
                              <PlusSquare size={18} />
                            </a>
                            {/* <img
                            src={addicon}
                            onClick={() => addObj()}
                            id="img_downarrow"
                            height={18}
                            className="addicon"
                            alt="downarrow"
                          /> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="row">
              <Label title="Price Sheet" type="BOLD" classNames="mt-3 mb-1" />
              <div className="col-4 form-group">
                <Label title="Labor" />
                <Controller
                  control={control}
                  name="PriceCodeLab"
                  render={({ field }) => (
                    <SawinSelect
                      options={PS}
                      disValue="BreakName"
                      selected={labourPsValue}
                      value="BreakCode"
                      onChange={(data: any) => field.onChange(data.id)}
                    />
                  )}
                />
              </div>
              <div className="col-4 form-group">
                <Label title="Material" />
                <Controller
                  control={control}
                  name="PriceCodeMat"
                  render={({ field }) => (
                    <SawinSelect
                      options={PS}
                      disValue="BreakName"
                      selected={materialPsValue}
                      value="BreakCode"
                      onChange={(data: any) => {
                        setMaterialPsValue(data.id);
                        field.onChange(data.id);
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-4 form-group">
                <Label title="Other" />
                <Controller
                  control={control}
                  name="PriceCodeOther"
                  render={({ field }) => (
                    <SawinSelect
                      options={PS}
                      disValue="BreakName"
                      selected={otherPsValue}
                      value="BreakCode"
                      onChange={(data: any) => field.onChange(data.id)}
                    />
                  )}
                />
              </div>
            </div>

            <div className="row">
              {dictionary.db_ServiceCall_Label1 &&
                dictionary.db_ServiceCall_Label1 != "Label1" ? (
                <div className="col-6 form-group">
                  <Label title={dictionary.db_ServiceCall_Label1} />
                  <input
                    className="form-control input"
                    type="text"
                    {...register(`CustomFields[field1]`)}
                  ></input>
                </div>
              ) : null}
              {dictionary.db_ServiceCall_Label2 &&
                dictionary.db_ServiceCall_Label2 != "Label2" ? (
                <div className="col-6 form-group">
                  <Label title={dictionary.db_ServiceCall_Label2} />
                  <input
                    className="form-control input"
                    {...register(`CustomFields[field2]`)}
                    type="text"
                  ></input>
                </div>
              ) : null}
              {dictionary.db_ServiceCall_Label3 &&
                dictionary.db_ServiceCall_Label3 != "Label3" ? (
                <div className="col-6 form-group">
                  <Label title={dictionary.db_ServiceCall_Label3} />
                  <input
                    {...register(`CustomFields[field3]`)}
                    className="form-control input"
                    type="text"
                  ></input>
                </div>
              ) : null}
              {dictionary.db_ServiceCall_Label4 &&
                dictionary.db_ServiceCall_Label4 != "Label4" ? (
                <div className="col-6 form-group">
                  <Label title={dictionary.db_ServiceCall_Label4} />
                  <input
                    className="form-control input"
                    {...register(`CustomFields[field4]`)}
                    type="text"
                  ></input>
                </div>
              ) : null}
            </div>
          </div>
          <div className="offcanvas-footer mt-4  ">
            <Button
              variant="primary"
              className="btn-brand-solid me-3"
              type="submit"
            >
              Submit
            </Button>
            <Button
              variant="primary"
              className="btn-brand-outline"
              type="button"
              onClick={onCloseModal}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default AdditionalInformationModal;
