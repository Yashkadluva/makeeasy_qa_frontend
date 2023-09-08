import { useState, useEffect, useRef } from "react";
import { Row, Col, Offcanvas, Tabs, Tab, Form, Button } from 'react-bootstrap';
import { Envelope } from 'react-bootstrap-icons';
import { useForm, Controller } from "react-hook-form";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import SawinDatePicker from "../../../../components/SawinDatePicker/SawinDatePicker";
import { useNavigate } from "react-router-dom";
import "./ContractDetail.scss"
import WebService from "../../../../utility/WebService";
import { toast } from 'react-toastify';
import Grid, { GridColumn, GridHeader, GridRow, FilterOption, Filter } from "../../../../components/Grid/Grid";
import HelperService from "../../../../utility/HelperService";
import AttachEquipmentModal from "../../../../components/AttachEquipmentModal/AttachEquipmentModal";
import DescriptionModal from "../../../../components/DescriptionModal/DescriptionModal";
import { Label } from "../../../../components/Label/Label";
import StandardDescriptionModal from "../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../components/Loader/Loader";
import ContractAddPart from "../AddContract/ContractAddPart";
import deleteicon from "../../../../assets/images/delete-icon.svg";
import editicon from "../../../../assets/images/edit.svg";
import saveIcon from "../../../../assets/images/save.svg";
import cancelIcon from "../../../../assets/images/cancel.svg";
import PartsAdvanceSearch from "../../../../components/PartsAdvanceSearch/PartsAdvanceSearch";
import ContractAttachEquipment from "./ContractAttachEquipment";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { setDataInRedux, SET_IS_REFRESH } from "../../../../action/CommonAction";


const componentKey = "MaintenanceSchEntry";

const headers: GridHeader[] = [
  {
    title: "Model",
    isShow: true,

  },
  {
    title: "Serial #",
    isShow: true,

  },
  {
    title: "Manufacturer",
  },
  {
    title: "System",
  },
  {
    title: "Location",
  },

  {
    title: "Unit",
  },
  {
    title: "Job #",
  }
];

const headersPart: GridHeader[] = [
  {
    title: "Is Inventory",
    isShow: true,
    class: "text-center"

  },
  {
    title: "Part Number",
    isShow: true,

  },
  {
    title: "Description",
  },
  {
    title: "Quantity",
    class: "text-end"
  },
  {
    title: "Actions",
    isFilter: false,
    isSorting: false,
    class: "freeze-column text-center",
    isFreeze: true,
  }
];


const dateFilter: FilterOption[] = [
  {
    title: "Start Date",
    value: "StartDate",
  },
  {
    title: "Expiry Date",
    value: "ExpiryDate",
  },
];

const filters: Filter[] = [
  {
    title: "Contract Type",
    key: "ContractServiceType",
    child: [
      {
        title: "CRPM",
        value: "CRPM",
      },
      {
        title: "CPM",
        value: "CPM",
      },
      {
        title: "Dispatch",
        value: "D",
      },
      {
        title: "RRPM",
        value: "RRPM",
      },
      {
        title: "RPM",
        value: "RPM",
      },
      {
        title: "CPU-Check",
        value: "CPU-Check",
      },
      {
        title: "CRPM",
        value: "CRPM",
      },

    ],
  },
  {
    title: "Status",
    key: "Status",
    child: [
      {
        title: "Active",
        value: "Active",
      },
      {
        title: "Cancelled",
        value: "Cancelled",
      },
      {
        title: "Expired",
        value: "Expired",
      },
      {
        title: "Renewed",
        value: "Renewed",
      },
      {
        title: "New",
        value: "New",
      },
    ],
  },
];

interface PropData {
  data: any;
  activeTab: any;
  changeTab: any;
  updateListing: any;
  partDetaiil: any;
}

const CreateSchedule = (props: PropData) => {
  const dispatch: Dispatch<any> = useDispatch();
  const { register, handleSubmit, formState: { errors }, watch, control, reset, setValue, } = useForm();
  const user_info = JSON.parse(localStorage.getItem('user_detail') || "");
  const watchAllFields = watch();
  const [gridHeader, setHeader] = useState<GridHeader[]>(headers);
  const [partGridHeader, setPartGridHeader] = useState<GridHeader[]>(headersPart);
  const [rows, setRows] = useState<GridRow[]>([]);
  const [rowsPart, setRowsPart] = useState<GridRow[]>([]);
  const partRowCompute = useRef<GridRow[]>([]);
  const [scheduleData, setScheduleData] = useState<any>({})
  const [taskOptions, setTaskOptions] = useState<any[]>([])
  const [showAttachEquipmentModal, setshowAttachEquipmentModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any[]>([]);
  const [descriptionData, setDescriptionData] = useState("");
  const [isShowDescription, setIsShowDescription] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  const [showStatndardDescriptionModel, setShowStatndardDescriptionModel] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showAlertModel, setAlertModel] = useState(false);
  const [showAddPartModal, setshowAddPartModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [partDetailsData, setPartDetailsData] = useState<any>([]);
  let partNum: any = "";
  let isInventory: any = false;
  let description: any = "";
  let quantity: any;
  let partData = useRef<any>([]);
  const partEditData = useRef<any[]>([]);
  const partEditIndex = useRef<any>("");
  const [isPartInventory, setPartInventory] = useState(false)

  useEffect(() => {
    setPartDetailsData(props.partDetaiil)
  }, [props.partDetaiil])

  useEffect(() => {
    if (props.activeTab == "TabCreate") {
      setValue("ScheduleDate", props.data?.Contract?.StartDate);
      setValue("Interval", 1);
      setValue("NoOfMaintenanceCall", 1);
      setValue("BillingDetailLineNo", 1);
      setValue("WeeklyOrMonthly", "M");
      taskOptions.length == 0 && getTaskCode();
      setScheduleData(props.data);
    } else {
      partRowCompute.current = []
      partData.current = []
      reset({})
      setRows([])
      setRowsPart([])
      setSelectedEquipment([])
    }
  }, [props.activeTab]);

  const dropdonwOptions: Options[] = [
    { id: "M", value: "Month(s)" },
    { id: 'D', value: "Day(s)" },
  ];

  const listEquipments = (res: any) => {
    setShowLoader(true);
    let rows: GridRow[] = [];
    var array = [];
    for (var i in res) {
      let columns: GridColumn[] = [];
      columns.push({ value: res[i].EqpManufacturer });
      columns.push({ value: res[i].EqpModel });
      columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
      columns.push({ value: res[i].SerialNo });
      columns.push({ value: res[i].Location });
      columns.push({ value: res[i].System });
      columns.push({ value: res[i].Unit });
      rows.push({ data: columns });
      array.push(res[i])
    }
    setShowLoader(false);
    setRows(rows);
  }

  const listParts = (res: any) => {
    setShowLoader(true);
    let rows: GridRow[] = [];
    for (var i in res) {
      let columns: GridColumn[] = [];
      columns.push({ value: checkBox(res[i].IsInventory) });
      columns.push({ value: res[i].PartNum });
      columns.push({ value: showDescription(HelperService.removeHtml(res[i].Description)) });
      columns.push({ value: res[i].Quantity });
      columns.push({
        value: actionList(Number(i), "ACTION", res[i]),
        type: "COMPONENT",
      });
      columns.push({ value: res[i].Unit });
      rows.push({ data: columns });
    }
    setShowLoader(false);
    setRowsPart(rows);
    partRowCompute.current = rows
  }

  const actionList = (value: number, type: string, data: object) => {
    return (
      <div className="action-ele action-btns">
        {type === "ACTION" ? (
          <div>
            <a
              onClick={() => onEdit(value, data)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={editicon} height={20} className="theme-icon-color" />
            </a>
            <a
              onClick={() => onDelete(value)}
              className="text-dark ms-2 font-18 cursor-pointer"
            >
              <img src={deleteicon} height={25} />
            </a>
          </div>
        ) : (
          <div>
            <a
              onClick={() => onSavePart()}
              className="text-dark ms-3 font-18 cursor-pointer "
            >
              <img src={saveIcon} />
            </a>
            <a
              onClick={() => onRemove()}
              className="text-dark ms-3 font-18 cursor-pointer "
            >
              <img src={cancelIcon} className="theme-icon-color" />
            </a>
          </div>
        )}
      </div>
    );
  };

  const onEdit = (index: any, data: any) => {
    partEditIndex.current = index;
    partEditData.current = [data]
    partNum = data.PartNum;
    isInventory = data.IsInventory;
    description = data.Description;
    quantity = data.Quantity;
    let columns: GridColumn[] = [];
    columns.push({ value: partRowCompute.current[index].data[0].value });
    columns.push({ value: partSearch(data.IsInventory) });
    columns.push({ value: addInput("desc") });
    columns.push({ value: addInput("qty") });
    columns.push({
      value: actionList(index, "UDATE", data),
      type: "COMPONENT",
    });
    setRowsPart(
      partRowCompute.current.map((option: GridRow, i: number) => {
        return i === index ? { data: columns } : option;
      })
    );
  }

  const onDelete = (index: any) => {
    partData.current.splice(index, 1);
    listParts(partData.current)
  }

  const onSavePart = () => {
    if (partNum == "") {
      toast.error("Please Enter Part Number")
    } else if (description == "") {
      toast.error("Please Enter Description")
    } else if (!quantity) {
      toast.error("Please Enter Quantity")
    } else {
      if (partEditData.current.length > 0) {
        partEditData.current[0].PartNum = partNum;
        partEditData.current[0].IsInventory = isInventory;
        partEditData.current[0].Description = description;
        partEditData.current[0].Quantity = quantity;
        partData.current[partEditIndex.current] = partEditData.current[0];
        partEditData.current = []
        partEditIndex.current = ""
        listParts(partData.current);
      } else {
        let temp = {
          IsInventory: isInventory,
          PartNum: partNum,
          Description: description,
          Quantity: quantity,
        }
        partData.current.unshift(temp);
        listParts(partData.current)
      }
    }

  }

  const onRemove = () => {
    setRowsPart(partRowCompute.current)
    partEditData.current = [];
  }

  const checkBox = (e: boolean) => {
    return (
      <div className="text-center">
        <Form.Check type="checkbox" checked={e} />
      </div>
    )
  }

  const onAddPart = () => {
    let columns: GridColumn[] = [];
    columns.push({ value: addDrpoDown(false) });
    columns.push({ value: partSearch(false) });
    columns.push({ value: addInput("desc") });
    columns.push({ value: addInput("qty") });
    columns.push({
      value: actionList(0, "UDATE", {}),
      type: "COMPONENT",
    });
    setRowsPart([{ data: columns }, ...partRowCompute.current]);
  };

  const partSearch = (e: boolean) => {
    return (
      <PartsAdvanceSearch
        isInventory={e}
        selected={partNum}
        onChange={(value: any, data: any) => {
          onSelectPart(value, data)
        }} />
    )
  };

  const addInput = (e: any) => {
    if (e == "desc") {
       return (
        <div className="form-style">
          <input key={new Date().getTime()+""} className="form-control" type="text" defaultValue={description} onChange={(e) => { description = e.target.value }} />
        </div>
      )
    } else if (e == "qty") {
      return (
        <div className="form-style">
          <input key={new Date().getTime()+""} className="form-control" type="text" defaultValue={quantity} onChange={(e) => { quantity = e.target.value }} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
        </div>
      )
    }

  };

  const inventoryOptions: Options[] = [
    { id: true, value: "Yes" },
    { id: false, value: "No" },
  ]

  const addDrpoDown = (e: any) => {
    return (
      <div className="form-style text-truncated">
        <SawinSelect
          options={inventoryOptions}
          selected={e}
          onChange={(data: any) => onChangeInventory(data)}
        />
      </div>
    )
  };

  const onChangeInventory = (data: any) => {

    setLoading(true);
    setTimeout(() => {
      description = "";
      partNum = "";
      quantity = 1;
      isInventory = data.id;
      setPartInventory(data.id)

      let columns: GridColumn[] = [];
      {
        columns.push({ value: addDrpoDown(data.id) });
        columns.push({ value: partSearch(data.id) });
        columns.push({ value: addInput("desc") });
        columns.push({ value: addInput("qty") });
        columns.push({ value: actionList(0, "UDATE", data) });
      }
      let temp: any = [{ data: columns }, ...partRowCompute.current];
      setRowsPart(temp);
      setLoading(false);

    }, 1000)

  }


  const showDescription = (e: any) => {
    if (e) {
      return (
        <a
          className="grid-hypper-link"
          onClick={() => viewFullDescription(e)}
        >
          {e}
        </a>
      );
    }
  };

  const viewFullDescription = (data: any) => {
    setDescriptionData(data);
    setIsShowDescription(true);
  };

  const closeDescription = (value: any) => {
    setIsShowDescription(value);
  };

  const closeAttachEquipment = (e: any, type: any, data: any, hasChange: boolean) => {
    setshowAttachEquipmentModal(false);
    if (type == 'SAVE') {
      setSelectedEquipment(data)
      listEquipments(data)
    }
  }

  const getTaskCode = () => {
    WebService.getAPI({
      action: `SetupSDProblemTaskCode/${user_info["AccountId"]}/${user_info["CompanyId"]}/M`,
    })
      .then((res: any) => {
        let columns: any[] = []
        for (var i in res) {
          columns.push({ value: res[i].Description, id: res[i].text, object: res[i] })
        }
        setTaskOptions(columns)
      })
      .catch((e) => { });
  }

  const onSave = (requestBody: any) => {
    requestBody.ContractNum = scheduleData?.Contract?.ContractNum;
    requestBody.SDServiceMasterId = scheduleData?.Contract?.ServiceMasterNum;
    requestBody.MaintenanceAmount = scheduleData?.Contract?.Amount;
    requestBody.MaintenanceDone = false;
    requestBody.AccountId = user_info["AccountId"];
    requestBody.CompanyId = user_info["CompanyId"];
    if (selectedEquipment.length > 0) {
      requestBody.SelectedEquipmentItems = selectedEquipment.map((item: any) => {
        return (item.Id)
      })
    }

    requestBody.EndDate = scheduleData?.Contract?.ExpiryDate;
    requestBody.TotalContractAmount = scheduleData?.Contract?.Amount;
    if (partData.current.length > 0) {
      requestBody.SaiSDContractMaintenanceScheduleParts = partData.current.map((item: any) => {
        return {
          AccountId: user_info["AccountId"],
          CompanyId: user_info["CompanyId"],
          ContractNum: scheduleData?.Contract?.ContractNum,
          PartNum: item.PartNum,
          Description: item.Description,
          IsInventory: item.IsInventory,
          Quantity: item.Quantity,
        }
      })

    }
    if (props.data?.MaintainanceScheduleGridData.length > 0) {
      requestBody.existingMaintenanceSchedule = props.data?.MaintainanceScheduleGridData
    } else {
      requestBody.existingMaintenanceSchedule = null
    }
    setLoading(true);
    WebService.postAPI({
      action: `SaiSDContractMaintenanceSchedule`,
      body: requestBody,
    })
      .then((res: any) => {
        setLoading(false);
        toast.success("Maintenance Schedule created successfully");
        dispatch(setDataInRedux({ type: SET_IS_REFRESH, value: new Date().getTime() }));
        reset();
        partData.current = [];
        setRowsPart([]);
        // props.updateListing(res.maintenanceScheduleLists)
        props.changeTab("Tablisting")
      })
      .catch((e) => {
        setLoading(false);
        if (e.response.data.ErrorDetails.message) {
          setAlertModel(!showAlertModel);
          setErrorMessage(e?.response?.data?.ErrorDetails?.message);
        }
      });
  }

  const closeModal = (value: any, type: any, data: any) => {
    if (type === "ON_SAVE") {
      const val = watchAllFields?.MaintenanceDescription
        ? watchAllFields?.MaintenanceDescription + " " + data
        : data;

      setValue("MaintenanceDescription", val);
    }
    setShowStatndardDescriptionModel(value);
  };

  const closeAddPart = (value: any, data: any) => {
    setshowAddPartModal(false)
  };

  const onSelectPart = (e: any, value: any) => {
    let data = e.id ? e.id : e;
    if (value) {
      partNum = value.PartNum

      setLoading(true);
      setRowsPart(partRowCompute.current);

      setTimeout(() => {
        if (value.SalesDescription) {
          description = value.SalesDescription;
        }
        if (partEditData.current.length > 0) {
          let columns: GridColumn[] = [];
          {
            columns.push({ value: addDrpoDown(isInventory) });
            columns.push({ value: partSearch(isInventory) });
            columns.push({ value: addInput("desc") });
            columns.push({ value: addInput("qty") });
            columns.push({ value: actionList(partEditIndex.current, "UDATE", data) });
          }
          let temp: any = partRowCompute.current;
          temp[partEditIndex.current] = { data: columns }
          setRowsPart(temp);
          setLoading(false);
        } else {
          let columns: GridColumn[] = [];
          {
            columns.push({ value: addDrpoDown(isInventory) });
            columns.push({ value: partSearch(isInventory) });
            columns.push({ value: addInput("desc") });
            columns.push({ value: addInput("qty") });
            columns.push({ value: actionList(0, "UDATE", data) });
          }
          let temp: any = [{ data: columns }, ...partRowCompute.current];
          setRowsPart(temp);
          setLoading(false);
        }
      }, 1000)



    } else {
      partNum = data;
    }
  };



  return <>

    {
      showAttachEquipmentModal &&
      <ContractAttachEquipment
        isShow={showAttachEquipmentModal}
        title="Attach EquipmentModal"
        isClose={closeAttachEquipment}
        selectedData={selectedEquipment}
        data={props.data?.EquipmentGridData}
      />
    }


    {
      showAlertModel &&
      <DraggableModal
        isOpen={showAlertModel}
        onClose={() => setAlertModel(false)}
        title="Alert"
        type="ALERT_MODEL"
        width={600}
        previousData={errorMessage}
      />
    }
    {
      isShowDescription &&
      <DescriptionModal
        isShow={isShowDescription}
        title="Description"
        isClose={closeDescription}
        data={descriptionData}
      />
    }

    {
      showAddPartModal &&
      <ContractAddPart
        isShow={showAddPartModal}
        isClose={closeAddPart}
        data={props?.data}
      />
    }

    {
      showStatndardDescriptionModel &&
      <StandardDescriptionModal
        isShow={showStatndardDescriptionModel}
        isClose={closeModal}
        title="Standard Descriptions"
        Contract={true}
      />
    }



    <div className="form-style create-maintance-sched-blad text-dark">
      <form onSubmit={handleSubmit(onSave)}>
        <Row className="mb-3 mt-3">
          <Col md={10}>
            <Form.Label className="font-w-medium me-4">Contract # <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ContractNum}</span></Form.Label>
            <Form.Label className="font-w-medium me-4">Start Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.StartDate && HelperService.getFormatedDate(scheduleData?.Contract?.StartDate)}</span></Form.Label>
            <Form.Label className="font-w-medium me-4">Expiration Date <span className="ms-1 font-w-regular">{scheduleData?.Contract?.ExpiryDate && HelperService.getFormatedDate(scheduleData?.Contract?.ExpiryDate)}</span></Form.Label>
            <Form.Label className="font-w-medium  ">Contract Amount $ <span className="ms-1 font-w-regular">{
              scheduleData?.Contract?.Amount ? HelperService.getCurrencyFormatter(scheduleData?.Contract?.Amount) : "0.00"}</span></Form.Label>
          </Col>
          <Col md={2} className="text-end">
            <Button id="saveSchedule" hidden variant="light" className="btn-brand-light" type="submit">+ Save</Button>
          </Col>
        </Row>
        <Row>
          <Col md={4} className="mb-3">
            <Form.Label>Task Code <span className="text-danger">*</span></Form.Label>
            <Controller
              control={control}
              rules={{ required: true }}
              name="TaskCode"
              render={({ field }) => (
                <SawinSelect
                  options={taskOptions}
                  type={"ARROW"}
                  onChange={(data: any) => { field.onChange(data.id); setValue("ProblemTaskFunctionCode", data.object?.FunctionCode); setValue("ProblemTaskComponentCode", data.object?.ComponentCode) }}
                />
              )}
            />
            {errors.TaskCode && (
              <Label
                title={"Please Select Task Code."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Maintenance Call Every <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text"  {...register("Interval", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
            {errors.Interval && (
              <Label
                title={"Please Enter Maintenance Call Every."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Frequency</Form.Label>
            <Controller
              control={control}
              rules={{ required: true }}
              name="WeeklyOrMonthly"
              render={({ field }) => (
                <SawinSelect
                  options={dropdonwOptions}
                  selected={"M"}
                  type={"ARROW"}
                  onChange={(data: any) => field.onChange(data.id)}
                />
              )}
            />
            {errors.WeeklyOrMonthly && (
              <Label
                title={"Please Select Weekly Or Monthly."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>No. Of Maintenance Call <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text"  {...register("NoOfMaintenanceCall", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
            {errors.NoOfMaintenanceCall && (
              <Label
                title={"Please Enter No. Of Maintenance Call."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>Starting Detail Line<span className="text-danger">*</span></Form.Label>
            <Form.Control type="text"  {...register("BillingDetailLineNo", { required: true })} onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
            {errors.BillingDetailLineNo && (
              <Label
                title={"Please Enter Billing Detail Line."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={4} className="mb-3">
            <Form.Label>First Maintenance Date <span className="text-danger">*</span></Form.Label>
            <Controller
              control={control}
              rules={{ required: true }}
              name="ScheduleDate"
              render={({ field }) => (
                <SawinDatePicker
                  minData={new Date(scheduleData?.Contract?.StartDate)}
                  maxData={new Date(scheduleData?.Contract?.ExpiryDate)}
                  selected={scheduleData?.Contract?.StartDate}
                  onChange={(data: any) => field.onChange(data)}
                />
              )}
            />
            {errors.ScheduleDate && (
              <Label
                title={"Please Select First Maintenance Date."}
                modeError={true}
              />
            )}
          </Col>

          <Col md={12} className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <Form.Label>Description</Form.Label>
              <Button variant="light" className="btn-brand-light mb-2"
                onClick={() => setShowStatndardDescriptionModel(true)} >Standard Billing Description</Button>
            </div>
            <Form.Control  {...register("MaintenanceDescription", { required: false })} as="textarea" rows={3} className="h-auto" />
          </Col>

          <Col md={12} className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 font-w-medium">Equipments</h6>
            <Button variant="light" onClick={() => { setshowAttachEquipmentModal(true) }} className="btn-brand-light" type="button">+ Attach Equipment</Button>
          </Col>

          <Col md={12} >
          <div className="equipment-grid">
            <Grid
              headers={gridHeader}
              rows={rows}
              ShowLoader={ShowLoader}
              errorMessage={'No Equipment Found'}
              // hoverRow={true}
              storeKey={componentKey}
            />
            </div>
          </Col>


          <Col md={12} className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0 font-w-medium">Parts Used In Maintenance Schedule</h6>
            <Button variant="light" onClick={() => { onAddPart() }} className="btn-brand-light" type="button">+ Add Part</Button>
          </Col>

          <Col md={12} >
            <div className="part-used-grid">
              <Grid
                headers={partGridHeader}
                rows={rowsPart}
                ShowLoader={ShowLoader}
                errorMessage={'No Parts Found'}
              />
            </div>
          </Col>
        </Row>
      </form>
    </div>
    {
      isLoading &&
      <Loader show={isLoading} />
    }
  </>;
};

export default CreateSchedule;


