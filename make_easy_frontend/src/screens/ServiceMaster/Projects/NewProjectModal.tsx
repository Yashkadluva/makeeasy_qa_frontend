import Offcanvas from "react-bootstrap/Offcanvas";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Button from "react-bootstrap/Button";
import "./NewProjectModal.scss";
import React, { useEffect, useState } from "react";
import WebService from "../../../utility/WebService";
import ToggleButton from "../../../components/ToggleButton/ToggleButton";
import SawinSelect, { Options } from "../../../components/Select/SawinSelect";
import { Label } from "../../../components/Label/Label";
import SawinDatePicker from "../../../components/SawinDatePicker/SawinDatePicker";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import TextEditor from "../../../components/TextEditor/TextEditor";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster } from "../../../reducer/CommonReducer";
import { toast } from 'react-toastify';

interface PropData {
  isShow: boolean;
  title: string;
  isClose: any;
}

const NewProjectModal = (props: PropData) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue
  } = useForm();
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
  const [projectManagerOption, setProjectManagerOption] = useState<Options[]>([]);
  const [projectTypeOption, setProjectTypeOption] = useState<Options[]>([]);
  const [salesmanOption, setSalesmanOption] = useState<Options[]>([]);
  const [editorValue, setEditorValue] = useState();
  const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);

  const currentValue = (value: any) => {
    setEditorValue(value);
  };

  const onCloseModal = () => {
    props.isClose(!props.isShow);
  };

  const handleForm = (requestBody: any) => {
    requestBody.Description = editorValue;
    requestBody.AccountId = user_info["AccountId"];
    requestBody.CompanyId = user_info["CompanyId"];
    requestBody.SDServiceMasterId = data.sd_master.Id;
    requestBody.ARCustomerMasterId = data.sd_master.ARCustomerMasterId;
    requestBody.SetupSDProjectTypeId = "1";

    WebService.postAPI({
      action: `SDSMProjects`,
      body: requestBody,
    })
      .then((res: any) => {
        toast.success("Project Created successfully.")
        props.isClose(!props.isShow);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const onDefault = (e: any) => {
    alert(e);
  };

  useEffect(() => {
    getProjectManagerOption()
    getProjectTypeOption()
    getSalesmanOption()
    setValue("StartDate", new Date())
  }, []);

  const getProjectManagerOption = () => {
    WebService.getAPI({
      action: `SetupSaiPYEmployeeMaster/GetProjectManagerList/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        const temp = [];
        for (var i in res) {
          temp.push({
            id: res[i].ProjectManagerNum,
            value: res[i].ProjectManagerName,
          });
        }
        setProjectManagerOption(temp);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getProjectTypeOption = () => {
    WebService.getAPI({
      action: `SetupSDProjectTypes/${user_info["AccountId"]}/${user_info["CompanyId"]}/true`,
      body: null,
    })
      .then((res: any) => {

        const temp = [];
        for (var i in res) {
          temp.push({
            id: `${i + 1}`,
            value: res[i].ProjectType,
          });
        }
        setProjectTypeOption(temp);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getSalesmanOption = () => {
    WebService.getAPI({
      action: `SetupSMSalesman/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
      body: null,
    })
      .then((res: any) => {
        const temp = [];
        for (var i in res) {
          temp.push({
            id: `${i + 1}`,
            value: res[i].SalesmanName,
            code: res[i].SalesmanNum
          });
        }
        setSalesmanOption(temp);
      })
      .catch((e) => {
        console.log(e);
      });
  };


  return (
    <>
      <Offcanvas
        show={props.isShow}
        onHide={onCloseModal}
        placement={"end"}
        className="offcanvas-large"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title> Add Project</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="border-bottom px-0 py-0">
          <form onSubmit={handleSubmit(handleForm)} className="pt-2">
            <div className='modal-body px-3 modal-inner-min-h'>
              <div className="form-style">
                <div className=" row firstrow">
                  <div className="col-6">
                    <div className="form-group ">
                      <Label title="Project Number" showStar={true} />
                      <input
                        className="form-control input"
                        type="text"
                        {...register("ProjectNum", { required: true })}
                        placeholder="Project Number "
                      />
                      {errors.ProjectNum && (
                        <small className="text-danger">
                          Project number is required
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="form-group">
                      <Label title=" Project Name" showStar={true} />
                      <input
                        className="form-control input"
                        type="text"
                        {...register("ProjectName", { required: true })}
                        placeholder="Project Name "
                      />
                      {errors.ProjectName && (
                        <small className="text-danger">
                          Project name is required
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-6 ">
                    <div className="form-group">
                      <Label title="Project Manager" showStar={true} />
                      <Controller
                        control={control}
                        name="ProjectManagerId"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <SawinSelect
                            options={projectManagerOption}
                            onChange={(data: any) => field.onChange(data.id)}
                          />
                        )}
                      />
                      {errors.ProjectManagerId && (
                        <small className="text-danger">
                          Project manager is required
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="col-6 ">
                    <div className="form-group">
                      <Label title="Project Type" showStar={true} />
                      <Controller
                        control={control}
                        name="ProjectType"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <SawinSelect
                            options={projectTypeOption}
                            onChange={(data: any) => field.onChange(data.value)}
                            type={"ARROW"}
                          />
                        )}
                      />
                      {errors.ProjectType && (
                        <small className="text-danger">
                          Project type is required
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-6  ">
                    <div className="form-group">
                      <div className=" rounded-pill">
                        <Label title="Start Date " showStar={true} />
                        <Controller
                          control={control}
                          name="StartDate"
                          rules={{ required: true }}
                          render={({ field }) => (
                            <SawinDatePicker
                              onChange={(data: any) => field.onChange(data)}
                            />
                          )}
                        />
                        {errors.StartDate && (
                          <small className="text-danger">
                            {" "}
                            Start date is required
                          </small>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-6 ">
                    <div className="form-group">
                      <Label title="Salesman" showStar={true} />
                      <Controller
                        control={control}
                        name="SalesmanNum1"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <SawinSelect
                            options={salesmanOption}
                            onChange={(data: any) => field.onChange(data.code)}
                            type={"ARROW"}
                          />
                        )}
                      />
                      {errors.Salesman && (
                        <small className="text-danger">
                          {" "}
                          Salesman is required
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-6 emptylabel">
                    <div className="form-group  ">
                      <Label title="" />
                      <Controller
                        control={control}
                        name="SalesmanNum2"
                        render={({ field }) => (
                          <SawinSelect
                            options={salesmanOption}
                            onChange={(data: any) => field.onChange(data.code)}
                            type={"ARROW"}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="form-group ">
                      <Label title="Customer PO#" />
                      <input
                        className="form-control input"
                        type="text"
                        {...register("CustomerPONum")}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div className="form-group ">
                      <Label title="Profit Margin %" />
                      <input
                        className="form-control input"
                        type="text"
                        {...register("EstimatedProfitMargin")}
                        placeholder=""
                      />
                    </div>
                  </div>

                  <Col lg={12} className="form-group">
                    <Label title="Description" type="BOLD" classNames="mt-3" />
                    <TextEditor data={editorValue} editedData={currentValue} type={"NORMAL"}/>
                  </Col>
                </div>
              </div>
            </div>
            <div className="offcanvas-footer mt-4">
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
    </>
  );
};

export default NewProjectModal;
