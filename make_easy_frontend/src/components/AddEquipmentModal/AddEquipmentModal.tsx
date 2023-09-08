import { useEffect, useRef, useState } from "react";
import "./AddEquipmentModal.scss";
import { GridHeader, GridRow } from "../Grid/Grid";
import Button from "react-bootstrap/Button";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Label } from "../../components/Label/Label";
import SawinDatePicker from "../../components/SawinDatePicker/SawinDatePicker";
import SawinSelect, { Options } from "../../components/Select/SawinSelect";
import TextEditor from "../../components/TextEditor/TextEditor";
import WebService from "../../utility/WebService";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../config/Store";
import { SDMaster } from "../../reducer/CommonReducer";
import { toast } from "react-toastify";
import {
  ArrowLeftShort,
  ArrowRightShort,
  ZoomIn,
  ZoomOut,
} from "react-bootstrap-icons";
import Form from "react-bootstrap/Form";
import { clearKey } from "../../utility/CommonApiCall";
import deleteicon from "../../assets/images/delete-icon.svg";
import BsButton from "react-bootstrap/Button";
import DraggableModal from "../DraggableModal/DraggableModal";

interface PropData {
  isShow: boolean;
  title: any;
  isClose: any;
  popupData: any;
  equipId?: any;
}

export interface Attachment {
  data: any;
  image: string;
  IsDefault: boolean;
  Id?: any;
}

const headers: GridHeader[] = [
  {
    title: "Contract.No",
    isSorting: false,
  },
  {
    title: "Select",
    isSorting: false,
  },
  {
    title: "Manufacturer",
    isSorting: false,
  },
  {
    title: "Model",
    isSorting: false,
  },
  {
    title: "Description",
    isSorting: false,
  },
  {
    title: "Serial #",
    isSorting: false,
  },
  {
    title: "System",
    isSorting: false,
  },
  {
    title: "Location",
    isSorting: false,
  },
];

const rows: GridRow[] = [];
const AddEquipmentModal = (props: PropData) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
    setValue,
  } = useForm();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);
  const [previousData, setpreviousData] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [currentImgeIndex, setCurrentImgeIndex] = useState<number>(0);
  const [manufacturerOption, setManufacturerOption] = useState([]);
  const [modelOption, setModelOption] = useState([]);
  const [equipmentType, setEquipmentType] = useState([]);
  const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
  const [isShoWZoomImage, setShowZoomImage] = useState(false);
  const [bladeTitle, setBladeTitle] = useState("Add Equipment");
  const [deleteImageId, setDeleteImageId] = useState("");
  const [deleteImageIndex, setDeleteImageIndex] = useState(0);
  const [zoomImageUrl, setZoomImageUrl] = useState("");
  const [showAlertModel, setAlertModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const onCloseModal = (e:any) => {
    reset();
    setAttachments([]);
    setManufacturerOption([]);
    setModelOption([]);
    setEquipmentType([]);
    props.isClose(!props.isShow,e);
    setpreviousData('')
  };

  useEffect(() => {
    if (props.isShow == true) {
      getManufacturer();
    }
  }, [props.isShow]);

  useEffect(() => {
    setCurrentImgeIndex(0);
    if (props.popupData.EqpManufacturer) {
      getEquipmentFile();
      setpreviousData(props.popupData.EquipmentNotes);
      setBladeTitle("Edit Equipment");
      onSelectManufacturer(props.popupData.EqpManufacturer);
      reset(props.popupData);
    } else {
      setBladeTitle("Add Equipment");
      setpreviousData("");
      reset({});
    }
  }, [props.popupData]);

  const getManufacturer = () => {
    WebService.getAPI({
      action: `SetupSDEquipmentManufacturer/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        setManufacturerOption(
          res.map((item: any) => {
            return { value: item.EqpManufacturer, id: item.EqpManufacturer };
          })
        );
      })
      .catch((error) => {});
  };

  const onSelectManufacturer = (e: any) => {
    if (e) {
      const requestData = {
        AccountId: user_info["AccountId"],
        CompanyId: user_info["CompanyId"],
        EqpManufacturer: e,
      };
      WebService.postAPI({
        action: `SetupSDEquipmentManufacturerModel/GetModelList`,
        body: requestData,
      })
        .then((res: any) => {
          setModelOption(
            res.map((item: any, index: any) => {
              return {
                object: item.EqpDescription,
                value: item.EqpModel,
                id: item.EqpModel,
              };
            })
          );
        })
        .catch((error) => {});

      WebService.getAPI({
        action: `SetupSDEquipmentTypes/GetEquipmentTypes/${user_info["AccountId"]}/${user_info["CompanyId"]}/true`,
        body: null,
      })
        .then((res: any) => {
          setEquipmentType(
            res.Data.map((item: any, index: any) => {
              return { value: item.EquipmentType, id: item.Id };
            })
          );
        })
        .catch((error) => { });
    }
  };

  const getEquipmentFile = () => {
    WebService.getAPI({
      action: `SDEquipmentMasterPicture/GetEquipmentPictures/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.equipId.Id}/${props.popupData.Id}`,
      body: null,
    })
      .then((res: any) => {
        setAttachments(
          res.Data.map((item: any, index: any) => {
            return {
              image: item.PictureUrl,
              IsDefault: item.IsDefault,
              Id: item.Id,
            };
          })
        );
      })
      .catch((e) => {  if (e.response.data.ErrorDetails.message) {
        setAlertModel(!showAlertModel);
        setErrorMessage(e?.response?.data?.ErrorDetails?.message);
      } });
  };

  const onSubmit = (requestBody: any) => {
    var EquipmentModel = {
      AccountId: user_info["AccountId"],
      CompanyId: user_info["CompanyId"],
      EqpManufacturer: requestBody.EqpManufacturer,
      EqpModel: requestBody.EqpModel,
    };
    let Status1 = { Open: true };
    requestBody.AccountId = user_info["AccountId"];
    requestBody.CompanyId = user_info["CompanyId"];
    requestBody.EquipmentModel = EquipmentModel;
    requestBody.Status1 = Status1;
    requestBody.SDServiceMasterId = props.equipId.Id;
    requestBody.EquipmentNotes = previousData;

    WebService[bladeTitle === "Add Equipment" ? "postAPI" : "putAPI"]({
      action: `SDEquipmentMaster`,
      body: requestBody,
    })
      .then((res: any) => {
        clearKey("equipments");
        bladeTitle === "Add Equipment"
          ? toast.success("Equipment created successfully.")
          : toast.success("Equipment edited successfully.");
        uploadImages(res.Data.SDEquipmentMasterId, 0);
        attachments.length == 0 && onCloseModal("yes");
        setpreviousData('')
      })
      .catch((e) => {   if (e.response.data.ErrorDetails.message) {
        setAlertModel(!showAlertModel);
        setErrorMessage(e?.response?.data?.ErrorDetails?.message);
      }});
  };

  const uploadImages = (e: any, i: number) => {
    if (attachments.length > 0) {
      let fromData = new FormData();
      fromData.append("AccountId", user_info["AccountId"]);
      fromData.append("CompanyId", user_info["CompanyId"]);
      fromData.append("ARCustomerMasterId", props.equipId.ARCustomerMasterId);
      fromData.append("SDServiceMasterId", props.equipId.Id);
      fromData.append("SDEquipmentMasterId", e);
      if (i != attachments.length - 1 && attachments[i].data) {
        fromData.append("files", attachments[i].data);
        WebService.postAPI({
          action: `SDEquipmentMasterPicture`,
          body: fromData,
        })
          .then((res: any) => {
            toast.success("Image uploaded successfully.");
            uploadImages(e, i + 1);
          })
          .catch((e) => {   if (e.response.data.ErrorDetails.message) {
            setAlertModel(!showAlertModel);
            setErrorMessage(e?.response?.data?.ErrorDetails?.message);
          }});
      } else if (attachments.length - 1 > i) {
        uploadImages(e, i + 1);
      } else if (i == attachments.length - 1) {
        onCloseModal("yes");
      }
    }
  };

  const currentValue = (value: any) => {
    setpreviousData(value);
  };

  const uploadDocument = (e: any) => {
    if (e.target.files[0] === undefined) {
      toast.error("Please upload image");
    } else if (
      e.target.files[0].type === "image/png" ||
      e.target.files[0].type === "image/jpg" ||
      e.target.files[0].type === "image/jpeg"
    ) {
      var temp = [...attachments];
      for (var i = 0; i < e.target.files.length; i++) {
        temp.push({
          data: e.target.files[i],
          image: URL.createObjectURL(e.target.files[i]),
          IsDefault: false,
        });
      }
      setAttachments(temp);
    } else {
      toast.error("File not supported");
    }
  };

  const prevImage = () => {
    if (currentImgeIndex > 0) {
      setCurrentImgeIndex((prevCurrentImgeIndex) => prevCurrentImgeIndex - 1);
    }
  };

  const nextImage = () => {
    if (currentImgeIndex < attachments.length - 1) {
      setCurrentImgeIndex((prevCurrentImgeIndex) => prevCurrentImgeIndex + 1);
    }
  };

  const defaultImageSet = (value: any) => {
    WebService.getAPI({
      action: `SDEquipmentMasterPicture/SetDefaultEquipmentPicture/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.equipId.Id}/${props.popupData.SDEquipmentMasterId}/${value.Id}`,
      body: null,
    })
      .then((res: any) => {
        toast.success("Set default successfully.");
      })
      .catch((error) => { });
  };

  const confirmDeleteImage = (value: any, index: number) => {
    setDeleteImageIndex(index);
    setDeleteImageId(value.Id);
    setShowDeleteModal(!isShoWDeleteModal);
  };

  const deleteImage = () => {
    setShowDeleteModal(false);
    if (props.popupData.EqpManufacturer && deleteImageId) {
      WebService.deleteAPI({
        action: `SDEquipmentMasterPicture/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.equipId.Id}/${props.popupData.SDEquipmentMasterId}/${deleteImageId}`,
        body: null,
      })
        .then((res: any) => {
          toast.success("Deleted successfully.");
          setCurrentImgeIndex(0);
          getEquipmentFile();
        })
        .catch((error) => {  });
    } else {
      setAttachments(
        attachments.filter((item: any, index: number) => {
          return index != deleteImageIndex;
        })
      );
      setCurrentImgeIndex(0);
    }
  };

  const getZoomImage = (e: any) => {
    setZoomImageUrl(e.image);
    setShowZoomImage(!isShoWZoomImage);
  };
  return (
    <>
      <DraggableModal
        isOpen={isShoWDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Alert"
        type="DELETE_IMAGE"
        width={600}
        delete={deleteImage}
        data={deleteImageId}
      />

      <DraggableModal
        isOpen={isShoWZoomImage}
        onClose={() => setShowZoomImage(false)}
        title="View Image"
        type="ZOOM_IMAGE"
        width={600}
        data={zoomImageUrl}
      />

<DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />

      <Offcanvas
        show={props.isShow}
        onHide={() => onCloseModal("no")}
        placement={"end"}
        className="offcanvas-dex-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className=" px-0 pb-0 new-box-main-view form-style">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-body px-3">
              <div className=" ">
                <div className="row">
                  <div className="col-6">
                    <label htmlFor="upload-doc" className="w-100" style={{height: "94%"}}>
                      <div className=" new-box-view d-flex justify-content-center align-items-center">
                        <div className="col-6 upload-icon">
                          <img
                            src={
                              require("../../assets/images/upload-icon.svg")
                                .default
                            }
                            className="theme-icon-color"
                          />
                          Upload Document (.png/.jpg/.jpeg)
                        </div>
                      </div>
                    </label>
                    <input
                      type="file"
                      className="upload-file-input"
                      id="upload-doc"
                      onChange={(e) => uploadDocument(e)}
                    />
                  </div>
                  <div className="col-6">
                    <div className="document-preview-main">
                      {attachments.length > 0 &&
                        attachments.map((item: Attachment, index: number) => {
                          return (
                            <>
                              {currentImgeIndex === index ? (
                                <>
                                  <div className="document-preview mt-2">
                                    <button
                                      className="image-preview-btn"
                                      onClick={() => prevImage()}
                                      disabled={
                                        currentImgeIndex === 0 ? true : false
                                      }
                                      type="button"
                                    >
                                      <ArrowLeftShort className="theme-icon-color"/>
                                    </button>
                                    <div>
                                      <img
                                        key={"attachment_" + index}
                                        src={item.image}
                                        className="rounded"
                                      />
                                    </div>
                                    <button
                                      className="image-preview-btn"
                                      disabled={
                                        currentImgeIndex ===
                                          attachments.length - 1
                                          ? true
                                          : false
                                      }
                                      onClick={() => nextImage()}
                                      type="button"
                                    >
                                      <ArrowRightShort className="theme-icon-color" />
                                    </button>
                                  </div>
                                  <div className="edit-image-div">
                                    {item.IsDefault == true ? (
                                      <>
                                        <div></div>
                                        <div></div>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          className="image-edit-btn"
                                          onClick={() =>
                                            confirmDeleteImage(item, index)
                                          }
                                          type="button"
                                        >
                                          <img
                                            src={deleteicon}
                                            alt=""
                                            width={15}
                                          />
                                        </button>
                                        {item.Id ? (
                                          <BsButton
                                            variant="primary"
                                            className="btn-brand-light btn-small"
                                            onClick={() =>
                                              defaultImageSet(item)
                                            }
                                            type="button"
                                          >
                                            Set as default
                                          </BsButton>
                                        ) : (
                                          ""
                                        )}
                                      </>
                                    )}
                                    <button
                                      className="image-edit-btn theme-icon-color"
                                      onClick={() => getZoomImage(item)}
                                      type="button"
                                    >
                                      {isShoWZoomImage == false ? (
                                        <ZoomIn />
                                      ) : (
                                        <ZoomOut />
                                      )}
                                    </button>
                                  </div>
                                </>
                              ) : (
                                ""
                              )}
                            </>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
              <div className=" ">
                <div className="row">
                  <div className="col-4 form-group">
                    <Label title="Manufacturer" showStar={true} />
                    <Controller
                      control={control}
                      name="EqpManufacturer"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SawinSelect
                          options={manufacturerOption}
                          selected={
                            props.popupData.EqpManufacturer
                              ? props.popupData.EqpManufacturer
                              : ""
                          }
                          isHideArrow={true}
                          isCustomInput={true}
                          isSearchable={true}
                          onChange={(data: any) => {
                            if (data.value) {
                              field.onChange(data.value ? data.value : data);
                              onSelectManufacturer(data.value);
                            }
                          }}
                        />
                      )}
                    />
                    {errors.EqpManufacturer && (
                      <Label
                        title={"Please Select Manufacturer."}
                        modeError={true}
                      />
                    )}
                  </div>
                  <div className="col-4 form-group">
                    <Label title="Model" showStar={true} />
                    <Controller
                      control={control}
                      name="EqpModel"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SawinSelect
                          options={modelOption}
                          selected={
                            props.popupData.EqpModel
                              ? props.popupData.EqpModel
                              : ""
                          }
                          isHideArrow={true}
                          isCustomInput={true}
                          isSearchable={true}
                          onChange={(data: Options) => {
                            {
                              field.onChange(data.value ? data.value : data);
                              setValue("Description", data.object);
                            }
                          }}
                        />
                      )}
                    />
                    {errors.EqpModel && (
                      <Label title={"Please Select Model."} modeError={true} />
                    )}
                  </div>
                  <div className="col-4 form-group">
                    <Label title="Equipment type" />
                    <Controller
                      control={control}
                      name="SetupSDEquipmentTypeId"
                      render={({ field }) => (
                        <SawinSelect
                          options={equipmentType}
                          selected={
                            props.popupData.EquipmentType
                              ? props.popupData.EquipmentType
                              : ""
                          }
                          isHideArrow={true}
                          isSearchable={true}
                          onChange={(data: any) =>
                            field.onChange(data.id ? data.id : data)
                          }
                        />
                      )}
                    />
                  </div>

                  <div className="col-4 form-group">
                    <Label title="Serial #" />
                    <input
                      className="form-control input"
                      type="text"
                      placeholder="Serial #"
                      {...register("SerialNo")}
                    ></input>
                  </div>
                  <div className="col-4 form-group">
                    <Label title="Location" />
                    <input
                      className="form-control input"
                      type="text"
                      placeholder="Location"
                      {...register("Location")}
                    ></input>
                  </div>
                  <div className="col-4 form-group">
                    <Label title="System" />
                    <input
                      className="form-control input"
                      type="text"
                      placeholder="System"
                      {...register("System")}
                    ></input>
                  </div>

                  <div className="col-4 form-group">
                    <Label title="Unit" />
                    <input
                      className="form-control input"
                      type="text"
                      placeholder="Unit"
                      maxLength={10}
                      {...register("Unit")}
                    ></input>
                  </div>
                  <div
                    className={
                      bladeTitle === "Edit Equipment"
                        ? "col-4 appointment-view form-group"
                        : "col-4 appointment-view add-new-equipment"
                    }
                  >
                    {/* <Label title="Invalid Equipment" /> */}
                    {/* <br />
                    <input
                      type="checkbox"
                      {...register("InvalidEquipment")}
                      className="sawin-checkbox addequpment-chkbox"
                    /> */}
                    <Form.Group
                      className="mt-4 pt-2"
                      controlId="Invalid Equipment"
                    >
                      <Form.Check
                        type="checkbox"
                        label="Invalid Equipment"
                        {...register("InvalidEquipment")}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-4 appointment-view form-group align-self-end">
                    <Form.Group className=" " controlId="Our_Installation">
                      <Form.Check
                        type="checkbox"
                        label="Our Installation"
                        {...register("OurInstallation")}
                      />
                    </Form.Group>
                    {/* <Label title="Our Installation" />
                  <br />
                  <input
                    type="checkbox"
                    {...register("OurInstallation")}
                    className="sawin-checkbox addequpment-chkbox"
                  /> */}
                  </div>

                  <div
                    className={
                      bladeTitle === "Add Equipment"
                        ? "col-4 form-group"
                        : "col-4 add-new-equipment"
                    }
                  >
                    <Label title="Installation Date" />
                    <Controller
                      control={control}
                      name="InstallationDate"
                      render={({ field }) => (
                        <SawinDatePicker
                          selected={
                            props.popupData.InstallationDate
                              ? props.popupData.InstallationDate
                              : ""
                          }
                          onChange={(data: any) => field.onChange(data)}
                        />
                      )}
                    />

                    {/* {errors.InstallationDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                  </div>

                  <div className="col-12 form-group">
                    <Label title="Description" />
                    <textarea
                      className="form-control form-control-textarea h-auto"
                      placeholder="Description"
                      rows={4}
                      {...register("Description")}
                    />
                  </div>
                </div>
                <div
                  className={
                    bladeTitle === "Edit Equipment"
                      ? "row  form-group"
                      : "row  add-new-equipment"
                  }
                >
                  <div className="col-4 ">
                    <div className="col-12 search-form rounded-pill p-1 mr-3">
                      <Label title="Installation Date" />
                      <Controller
                        control={control}
                        name="InstallationDate"
                        render={({ field }) => (
                          <SawinDatePicker
                            selected={
                              props.popupData.InstallationDate
                                ? props.popupData.InstallationDate
                                : ""
                            }
                            onChange={(data: any) => field.onChange(data)}
                          />
                        )}
                      />

                      {/* {errors.InstallationDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                    </div>
                  </div>

                  <div className="col-4 ">
                    <div className="col-12 search-form rounded-pill p-1 mr-3">
                      <Label title="Replaced Date" />
                      <Controller
                        control={control}
                        name="ReplacedDate"
                        render={({ field }) => (
                          <SawinDatePicker
                            selected={
                              props.popupData.ReplacedDate
                                ? props.popupData.ReplacedDate
                                : ""
                            }
                            onChange={(data: any) => field.onChange(data)}
                          />
                        )}
                      />

                      {/* {errors.ReplacedDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                    </div>
                  </div>

                  <div className="col-4 ">
                    <div className="col-12 search-form rounded-pill p-1 mr-3">
                      <Label title="Last Repair Date" />
                      <Controller
                        control={control}
                        name="LastRepairDate"
                        render={({ field }) => (
                          <SawinDatePicker
                            selected={
                              props.popupData.LastRepairDate
                                ? props.popupData.LastRepairDate
                                : ""
                            }
                            onChange={(data: any) => field.onChange(data)}
                          />
                        )}
                      />

                      {/* {errors.LastRepairDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                    </div>
                  </div>
                </div>

                <div
                  className={
                    bladeTitle === "Edit Equipment"
                      ? "row  form-group"
                      : "row  add-new-equipment"
                  }
                >
                  <div className="col-4 ">
                    <div className="col-12 w-100" style={{ marginTop: -7 }}>
                      <div className="col-12 search-form rounded-pill p-1 mr-3">
                        <Label title="Man. Warranty Date" />
                        <Controller
                          control={control}
                          name="ManufacturerWarrantyDate"
                          render={({ field }) => (
                            <SawinDatePicker
                              selected={
                                props.popupData.ManufacturerWarrantyDate
                                  ? props.popupData.ManufacturerWarrantyDate
                                  : ""
                              }
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />

                        {/* {errors.ManufacturerWarrantyDate  && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                      </div>
                    </div>
                  </div>

                  <div className="col-4 ">
                    <div className="col-12 w-100" style={{ marginTop: -7 }}>
                      <div className="col-12 search-form rounded-pill p-1 mr-3">
                        <Label title="Extend Warranty Date" />
                        <Controller
                          control={control}
                          name="ExtendWarrantyDate"
                          render={({ field }) => (
                            <SawinDatePicker
                              selected={
                                props.popupData.ExtendWarrantyDate
                                  ? props.popupData.ExtendWarrantyDate
                                  : ""
                              }
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />

                        {/* {errors.ExtendWarrantyDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                  //   />
                  // )} */}
                      </div>
                    </div>
                  </div>

                  <div className="col-4 ">
                    <div className="col-12 w-100" style={{ marginTop: -7 }}>
                      <div className="col-12 search-form rounded-pill p-1 mr-3">
                        <Label title="Part Warranty Date" />
                        <Controller
                          control={control}
                          name="PartWarrantyDate"
                          render={({ field }) => (
                            <SawinDatePicker
                              selected={
                                props.popupData.PartWarrantyDate
                                  ? props.popupData.PartWarrantyDate
                                  : ""
                              }
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />

                        {/* {errors.PartWarrantyDate && (
                    <Label
                      title={"Please select start date."}
                      modeError={true}
                    />
                  )} */}
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    bladeTitle === "Edit Equipment"
                      ? "row  form-group"
                      : "row  add-new-equipment"
                  }
                >
                  <div className="col-4 ">
                    <div className="col-12 w-100" style={{ marginTop: -7 }}>
                      <div className="col-12 search-form rounded-pill p-1 mr-3">
                        <Label title="Labor Warranty Date" />
                        <Controller
                          control={control}
                          name="LaborWarrantyDate"
                          render={({ field }) => (
                            <SawinDatePicker
                              selected={
                                props.popupData.LaborWarrantyDate
                                  ? props.popupData.LaborWarrantyDate
                                  : ""
                              }
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />

                        {/* {errors.LaborWarrantyDate && (
                  <Label
                    title={"Please select start date."}
                    modeError={true}
                  />
                )} */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 form-group">
                  <div className=" ">
                    <Label title="Equipment Notes" type="BOLD" />
                    <TextEditor data={previousData} editedData={currentValue} type={"NORMAL"} />
                  </div>
                </div>
              </div>
            </div>
            <div className="offcanvas-footer mt-4">
              <Button
                variant="primary"
                className="btn-brand-outline"
                type="button"
                onClick={() => onCloseModal("no")}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="btn-brand-solid ms-3"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default AddEquipmentModal;
