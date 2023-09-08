import ToggleButton from "../../../components/ToggleButton/ToggleButton";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { Label } from "../../../components/Label/Label";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import WebService from "../../../utility/WebService";
import { toast } from 'react-toastify';
import HelperService from "../../../utility/HelperService";
import { useSelector } from "react-redux";
import { RootState } from "../../../config/Store";
import { SDMaster } from "../../../reducer/CommonReducer";

interface PropData {
  isShow: boolean;
  title: any;
  isClose: any;
  data: any;
}

const AddContactModal = (props: PropData) => {
  const [isDefault, setIsDefault] = useState(false)
  const [isInvoiceMail, setIsInvoiceMail] = useState(false)
  const user_info = JSON.parse(localStorage.getItem("user_detail") || "");
  const [bladeTitle, setBladeTitle] = useState("Add Contact")
  const serviceData: any = useSelector<RootState, SDMaster>(
    (state) => state.sdMaster
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm();


  useEffect(() => {
    if (props.data.ContactName) {
      setIsInvoiceMail(props.data.IncludeInInvoiceEmail);
      setIsDefault(props.data.IsDefaultForEntityId);
      setBladeTitle("Edit Contact")
      reset(props.data)
      props.data?.WorkPhone && setValue("WorkPhone", HelperService.getFormattedContact(props.data?.WorkPhone))
      props.data?.HomePhone && setValue("HomePhone",HelperService.getFormattedContact(props.data?.HomePhone))
    }
    else {
      setIsInvoiceMail(false);
      setIsDefault(false);
      setBladeTitle("Add Contact")
      reset()
    }
  }, [props.data, props.isShow])

  const onCloseModal = () => {
    props.isClose(!props.isShow);
    reset({})
  };

  const onSubmit = (requestBody: any) => {
    requestBody.IsDefaultForEntityId = isDefault;
    requestBody.IncludeInInvoiceEmail = isInvoiceMail;
    requestBody.CompanyId = user_info["CompanyId"];
    requestBody.AccountId = user_info["AccountId"];
    requestBody.EntityType = "1";
    requestBody.EntityId = serviceData.sd_master.Id
    WebService[bladeTitle === 'Add Contact' ? 'postAPI' : 'putAPI']({
      action: `EntityContact`,
      body: requestBody,
    })
      .then((res: any) => {
        bladeTitle === 'Add Contact' ? toast.success("Contact created successfully.") : toast.success("Contact edited successfully.")
        props.isClose(!props.isShow, "ON_SAVE");
      })
      .catch((e: any) => {  });
  };

  const onDefault = (e: any) => {
    setIsDefault(e)
  }
  const onInvoiceMail = (e: any) => {
    setIsInvoiceMail(e)
  }

  return (

    <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large" >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="border-bottom px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="form-style">
          <div className="row px-4">
            <div className="col-6 form-group">
              <Label title="Contact Name" showStar={true} />
              <input className="form-control input" type="text" placeholder="Contact Name"
                {...register(`ContactName`, { required: true })}
              ></input>
              {errors.ContactName && (
                <Label title={"Please enter contact name"} modeError={true} />
              )}
            </div>
            <div className="col-6 form-group">
              <Label title="Email" />
              <input className="form-control input" type="email" placeholder="Email"
                  {...register("Email", {
                              required: false,
                              pattern:
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            })}
              ></input>
            </div>
            <div className="col-6 form-group">
              <Label title="Primary Number" />
              <input className="form-control input" type="text" placeholder="Primary Number"
                {...register(`WorkPhone`, { minLength: 12 })}
                onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                onKeyUp={(e) => HelperService.contactFormatter(e)}
              ></input>
              {errors.WorkPhone && (
                <Label
                  title={"Please enter valid primary number."}
                  modeError={true}
                />
              )}
            </div>
            <div className="col-6 form-group">
              <Label title="Secondary Number" />
              <input className="form-control input" type="text" placeholder="Secondary Number" {...register(`HomePhone`, { minLength: 12 })}
                onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                onKeyUp={(e) => HelperService.contactFormatter(e)}
              ></input>
              {errors.HomePhone && (
                <Label
                  title={"Please enter valid secondary number."}
                  modeError={true}
                />
              )}
            </div>
            <div className="col-12 form-group mb-3">
              <Label title="Comment"></Label>
              <textarea
                className="form-control form-control-textarea h-auto"
                {...register(`Comment`)}
                placeholder="Comment" rows={3} />
            </div>
            <div className="col-md-5">
              <ToggleButton isChecked={isDefault} title="Is Default" label_id="default" onChange={onDefault} />
            </div>
            <div className="col-md-7">
              <ToggleButton isChecked={isInvoiceMail} title="Include In Invoice Email"
                label_id="invoiceEmail" onChange={onInvoiceMail} />
            </div>
          </div>
          <div className="offcanvas-footer mt-4 position-absolute">
            <Button variant="primary" className="btn-brand-solid me-3" type="submit">Submit</Button>
            <Button variant="primary" className="btn-brand-outline" type="button" onClick={onCloseModal}>Cancel</Button>
          </div>
        </form>
      </Offcanvas.Body>
    </Offcanvas>

    // <Modal show={props.isShow} className="modal right fade" size="xl">
    //   <Modal.Header>
    //     <Modal.Title>
    //       <div className="col-12 row d-flex justify-content-between">
    //         <div className="col-6">{props.title}</div>
    //         <div className="col-6 text-end">
    //           <img
    //             className="image"
    //             src={require("../../../assets/images/cross-black.svg").default}
    //             onClick={() => onCloseModal()}
    //           />
    //         </div>
    //       </div>
    //     </Modal.Title>
    //   </Modal.Header>

    //   <Modal.Body>
    //     <div className="add-contact">
    //       <div className="add-contact-heading-view ">
    //         <div className=" col-12 row">
    //           <Label title="Contact" type="BOLD" />
    //           <div className="col-3">
    //             <Label title="Contact Name" showStar={true} />
    //             <input className="form-control input" type="text" placeholder="Contact Name"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Email" />
    //             <input className="form-control input" type="text" placeholder="Email"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Work#" />
    //             <input className="form-control input" type="text" placeholder="Work#"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Extension" />
    //             <input className="form-control input" type="text" placeholder="Extension#"></input>
    //           </div>
    //         </div>

    //         <div className=" col-12 row">
    //           {/* <Label title="Contact" type="BOLD" /> */}
    //           <div className="col-3">
    //             <Label title="Fax" />
    //             <input className="form-control input" type="text" placeholder="Fax"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Personal Mobile" />
    //             <input className="form-control input" type="text" placeholder="Personal Mobile"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Office Mobile" />
    //             <input className="form-control input" type="text" placeholder="Office Mobile"></input>
    //           </div>
    //           <div className="col-3">
    //             <Label title="Home#" />
    //             <input className="form-control input" type="text" placeholder="Home#"></input>
    //           </div>
    //         </div>

    //         <div className="col-12  ">
    //           <Label title="Comment"></Label>
    //           <input
    //             className="form-control input h-100 w-100 mr-3"
    //             type="text"
    //             placeholder="Comment"
    //           />
    //         </div>

    //         <div className="col-12 row ml-4 mt-4 ">
    //         <div className="col-3">
    //           <ToggleButton title="Is Default" label_id="default" />
    //         </div>
    //         <div className="col-4">
    //           <ToggleButton title="Include In Invoice Email"
    //              label_id="invoiceEmail" />
    //         </div>
    //       </div>

    //       </div>
    //     </div>




    //   </Modal.Body>
    //   <hr />
    //   <Modal.Header>
    //     <Modal.Title>
    //       <div className="col-12 mt-5 d-flex justify-content-end row ">
    //         <div className="col-2">
    //           <Button
    //             size="large"
    //             label="Save"
    //             // onClick={handleSubmit(onSubmit)}
    //             b_type="SAVE"
    //           />
    //         </div>
    //         <div className="col-2">
    //           <Button
    //             size="small"
    //             label="Cancel"
    //             // onClick={handleSubmit(onSubmit)}
    //             b_type="CANCEL"
    //           />
    //         </div>
    //       </div>
    //     </Modal.Title>
    //   </Modal.Header>

    // </Modal >
  );
};
export default AddContactModal;