import { useEffect, useState } from "react";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Label } from "../../../components/Label/Label";
import SawinDatePicker from "../../../components/SawinDatePicker/SawinDatePicker";
import SawinSelect from "../../../components/Select/SawinSelect";
import TextEditor from "../../../components/TextEditor/TextEditor";
import { Controller, useForm } from "react-hook-form";
import WebService from "../../../utility/WebService";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster } from "../../../reducer/CommonReducer";
import { toast } from 'react-toastify';
import HelperService from '../../../utility/HelperService';
import Loader from "../../../components/Loader/Loader";
import moment from "moment";

interface PropData {
  isShow: boolean;
  title?: any;
  isClose: any;
  popupData?: any;
  Ids?: any;
}

const AddRecommendationModal = (props: PropData) => {
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [bladeTitle, setBladeTitle] = useState("Add Equipment")
  const [recommendedByOptions, setRecommendedByOptions] = useState([]);
  const [showError, setShowError] = useState(false);
  const [recommendedStatus, setRecommendedStatus] = useState("")
  const [startDate, setStartDate] = useState(new Date());
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    reset
  } = useForm();
  const [previousData, setpreviousData] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    getRecommendedByOptions();
  }, [])

  useEffect(() => {
    getRecommendedByOptions();
    if (props.popupData.RecommendedBy && props.isShow == true) {
      setBladeTitle("Edit Recommendation")
      setValue("RecommendedDate", props.popupData.RecommendedDate);
      setpreviousData(props.popupData.RecommendationText);
      setRecommendedStatus(props?.popupData?.Status)
      reset(props.popupData)
      setStartDate(props.popupData.RecommendedDate)
    }
    else {
      setBladeTitle("Add Recommendation")
      setpreviousData("")
      // reset({})
      setValue("RecommendedDate", new Date());
      setStartDate(new Date())
    }
  }, [props.popupData])



  const getRecommendedByOptions = () => {
    WebService.getAPI({
      action: `SetupSaiSDTechMaster/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        setRecommendedByOptions(res.map((item: any, index: any) => {
          return { value: item.TechNameInternal, id: item.TechNum }
        })
        )
      })
      .catch((e) => { });
  }


  const onSubmit = (requestBody: any) => {
    console.log(requestBody)
    if (previousData === "") {
      setShowError(true)
    } else if (requestBody.RecommendedDate >= requestBody.AcceptedOn) {
      toast.error("Please Select Correct Date")
      setValue("AcceptedOn", "")
    } else {
      setLoading(true)
      setShowError(false)
      requestBody.AccountId = user_info["AccountId"];
      requestBody.CompanyId = user_info["CompanyId"];
      requestBody.RecommendationText = previousData;
      requestBody.SDServiceMasterId = props?.Ids?.SDServiceMasterId ? props?.Ids?.SDServiceMasterId : props?.Ids?.Id;
      requestBody.AcceptedOnSDCallMasterId = ""
      if (props?.Ids?.IsInvoice) {
        requestBody.RecommendedOnSDCallMasterId = props?.Ids?.Id ? props?.Ids?.Id : "";
        requestBody.RecommendedDateToDisplay = HelperService.getFormatedDate(requestBody.RecommendedDate)
        requestBody.AcceptedOnDisplay = HelperService.getFormatedDate(requestBody.AcceptedOn)
      }
      WebService[bladeTitle === "Add Recommendation" ? "postAPI" : "putAPI"]({
        action: `SDServiceMasterRecommendation`,
        body: requestBody,
      })
        .then((res: any) => {
          setLoading(false)
          reset({})
          bladeTitle === "Add Recommendation"
            ? toast.success("Recommendation created successfully.")
            : toast.success("Recommendation edited successfully.");
          onCloseModal("add");
        })
        .catch((e) => { setLoading(false) });
    }
  }

  const onCloseModal = (e: any) => {
    reset({})
    setRecommendedStatus("")
    props.isClose(!props.isShow, e);
  };


  const recommendationStatusOption = [
    {
      id: 1, value: "Pending"
    },
    {
      id: 2, value: "Accepted"
    },
    {
      id: 3, value: "Decline"
    },
  ]
  const handleStatus = (data: any) => {
    setRecommendedStatus(data.id)
  }

  return (
    <>
      <Loader show={isLoading} />

      <Offcanvas show={props.isShow} onHide={() => onCloseModal("not")} placement={'end'} className="offcanvas-large" >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="border-bottom px-0 pb-0 form-style">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-3 modal-inner-min-h">
              <div className="row">
                <div className="col-4 ">
                  <div className="col-12 w-100" style={{ marginTop: -7 }}>
                    <div className="col-12 search-form rounded-pill p-1 mr-3">
                      <Label title="Recommended Date" showStar={true} />
                      <Controller
                        control={control}
                        rules={{ required: true }}
                        name="RecommendedDate"
                        render={({ field }) => (
                          <SawinDatePicker
                            selected={startDate}
                            onChange={(data: any) => { field.onChange(data); setStartDate(data) }
                            }
                          />
                        )}
                      />
                      {errors.RecommendedDate && (
                        <Label
                          title={"Please Select Recommended Date"}
                          modeError={true}
                        />
                      )}


                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <Label title="Recommended By " showStar={true} />
                  <Controller
                    control={control}
                    name="RecommendedBy"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <SawinSelect
                        options={recommendedByOptions}
                        disValue="BreakName"
                        selected={props.popupData.RecommendedBy}
                        value="BreakCode"
                        onChange={(data: any) => field.onChange(data.id)}
                      />
                    )}
                  />
                  {errors.RecommendedBy && (
                    <Label
                      title={"Please Select Recommended By"}
                      modeError={true}
                    />
                  )}
                </div>
                <div className="col-4">
                  <Label title="Status" showStar={true} />
                  <Controller
                    control={control}
                    rules={{ required: true }}
                    name="Status"
                    render={({ field }) => (
                      <SawinSelect
                        options={recommendationStatusOption}
                        disValue="BreakName"
                        selected={recommendedStatus}
                        value="BreakCode"
                        onChange={(data: any) => { field.onChange(data.id); handleStatus(data) }}
                      />
                    )}
                  />
                  {errors.Status && (
                    <Label
                      title={"Please Select Status"}
                      modeError={true}
                    />
                  )}
                </div>


                {
                  recommendedStatus == "2" &&
                  <div className="col-4 ">
                    <div className="col-12 w-100" style={{ marginTop: -7 }}>
                      <div className="col-12 search-form rounded-pill p-1 mr-3">
                        <Label title="Accepted On" showStar={true} />
                        <Controller
                          control={control}
                          rules={{ required: true }}
                          name="AcceptedOn"
                          render={({ field }) => (
                            <SawinDatePicker
                              selected={props.popupData.AcceptedOn ? props.popupData.AcceptedOn : ""}
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />
                        {errors.AcceptedOn && (
                          <Label
                            title={"Please Select Accepted Date"}
                            modeError={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                }
                {
                  recommendedStatus == "3" &&
                  <>
                    <div className="col-4 ">
                      <div className="col-12 w-100" style={{ marginTop: -7 }}>
                        <div className="col-12 search-form rounded-pill p-1 mr-3">
                          <Label title="Declined On" showStar={true} />
                          <Controller
                            control={control}
                            rules={{ required: true }}
                            name="AcceptedOn"
                            render={({ field }) => (
                              <SawinDatePicker
                                selected={props.popupData.AcceptedOn ? props.popupData.AcceptedOn : ""}
                                onChange={(data: any) => field.onChange(data)}
                              />
                            )}
                          />
                          {errors.AcceptedOn && (
                            <Label
                              title={"Please Select Declined Date"}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-8 ">
                      <div className="col-12 w-100" style={{ marginTop: -7 }}>
                        <div className="col-12 search-form rounded-pill p-1 mr-3 form-group">
                          <Label title="Reason to Deny" showStar={true} />
                          <input type="text" className="form-control input"
                            placeholder="Reason to Deny"
                            {...register("ReasonToDeny", {
                              required: true,
                            })} />
                          {errors.ReasonToDeny && (
                            <Label
                              title={"Please Enter Reason To Deny"}
                              modeError={true}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                  </>
                }



                <div className="col-12">
                  <Label title="Comments" showStar={true} />
                  <Controller
                    control={control}
                    rules={{ required: true }}
                    name="Comment"
                    render={({ field }) => (
                      <TextEditor type={"NORMAL"} data={previousData} editedData={(value: any) => { field.onChange(value); setpreviousData(value) }} />
                    )}
                  />
                  {errors.Comment && (
                    <Label
                      title={"Please Enter Comment"}
                      modeError={true}
                    />
                  )}

                </div>
              </div>
            </div>
            <div className="offcanvas-footer">
              <Button variant="primary" className="btn-brand-solid me-3" type="submit">Submit</Button>
              <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => onCloseModal("not")}>Cancel</Button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};
export default AddRecommendationModal;