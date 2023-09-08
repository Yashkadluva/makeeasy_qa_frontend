import Offcanvas from "react-bootstrap/Offcanvas";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Button from "react-bootstrap/Button";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import SawinSelect, { Options } from "../../../../../components/Select/SawinSelect";
import { Label } from "../../../../../components/Label/Label";
import WebService from "../../../../../utility/WebService";
import DraggableModal from "../../../../../components/DraggableModal/DraggableModal";
import Loader from "../../../../../components/Loader/Loader";

interface PropData {
    isShow: boolean;
    title: string;
    isClose: any;
    data: any;
}

const AddChangeInvoiceModal = (props: PropData) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
    } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [bladeTitle, setBladeTitle] = useState(" Change Invoice Number");
    const [pageLoader, setPageLoader] = useState(false);
    const [isDefault, setIsDefault] = useState(false)
    const [amount, setAmount] = useState('')
    const [isLoading, setLoading] = useState(false);
    const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<any>({});
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");



    const onCloseModal = () => {
        reset({})
        props.isClose(!props.isShow);
    };


    const handleForm = (requestBody: any) => {
        setLoading(true)
        WebService.getAPI({
            action: `SDInvoice/ChangeInvoiceNum/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props?.data?.InvoiceNum}/${requestBody.NewInvoice}`,
            body: null,
        })
            .then((res: any) => {
                setPageLoader(false);
        setLoading(false)

        if(res[0] == "ConfirmationForPurchaseOrderNotExist"){
            setErrorMessage("Cannot delete the record as it is referred in Time cards")
        }else {
            onCloseModal();
        }
            })
            .catch((e) => {
                setLoading(false)
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel);
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                }
            });
    };

    return (

        <>
        <Loader show={isLoading} />
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
                onHide={onCloseModal}
                placement={"end"}
                className="offcanvas-large">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{bladeTitle}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0 ">
                    <form onSubmit={handleSubmit(handleForm)}>
                        <div className="modal-body px-3">
                            <div className=" service-address">
                                <div className="service-location-form form-style">
                                    <div className=" row firstrow">

                                        <div className="col-4 ">
                                            <div className="form-group">
                                                <Label title="Current Invoice#" /><br/>
                                                <Label title={props?.data?.InvoiceNum}
                                                />
                                                  
                                            
                                            </div>
                                        </div>

                                        <div className="col-4">
                                            <div className="form-group ">
                                                <Label title="New Invoice #" showStar={true} />
                                                <input
                                                    className="form-control input"
                                                    type="text"
                                                    {...register("NewInvoice", { required: true })}
                                                    placeholder="New Invoice"
                                                />
                                                {errors.NewInvoice && (
                                                    <small className="text-danger">
                                                        New Invoice is required
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="offcanvas-footer position-absolute">

                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                Change Invoice #
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-outline  "
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

export default AddChangeInvoiceModal;
