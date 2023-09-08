import Offcanvas from "react-bootstrap/Offcanvas";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import Button from "react-bootstrap/Button";
import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import Loader from "../../../../components/Loader/Loader";
import { useSelector } from "react-redux";
import SawinSelect, { Options } from "../../../../components/Select/SawinSelect";
import { Label } from "../../../../components/Label/Label";
import WebService from "../../../../utility/WebService";
import DraggableModal from "../../../../components/DraggableModal/DraggableModal";
import { RootState } from "../../../../config/Store";
import { SDMaster } from "../../../../reducer/CommonReducer";
import {
    SET_WORK_ORDER_ID, setDataInRedux
} from "../../../../action/CommonAction";

interface PropData {
    isShow: boolean;
    title: string;
    isClose: any;
    data: any;
}

const AddAssignBatchBlade = (props: PropData) => {
    const {
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [bladeTitle, setBladeTitle] = useState("  Invoice Assign Batch ");
    const [pageLoader, setPageLoader] = useState(false);
    const [isDefault, setIsDefault] = useState(false)
    const [confirmAlertModel, setConfirmAlertModel] = useState(false);
    const [showAlertModel1, setAlertModel1] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [assignBatch, setAssignBatch] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [Batches, setBatch] = useState<Options[]>([]);
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);


    useEffect(() => {
        if (props.isShow == true && Batches.length == 0) {
            getBatchOption();
            setAssignBatch(props?.data?.BatchNum)
        }
    }, [props.isShow])

    const onCloseModal = () => {
        reset({})
        setAssignBatch("")
        setConfirmAlertModel(false);
        setErrorMessage("")
        props.isClose(!props.isShow);
    };

    const onConfirm = (data: any) => {
        setAssignBatch(data.BatchNum)
        setConfirmAlertModel(true);
        setErrorMessage("Are you sure you want to change the batch number for this invoice?")
    }

    const handleForm = () => {
        setConfirmAlertModel(false);
        setLoading(true)
        WebService.getAPI({
            action: `SDInvoice/AssignBatch/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data.InvoiceNum}/${assignBatch}/Base%20User`,
            body: null,

        })
            .then((res: any) => {
                setPageLoader(false);
                setLoading(false)
                toast.success("Batch Assigned successfully.")
                onCloseModal()
            })
            .catch((e) => {
                setPageLoader(false);
                setLoading(false)
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel1(!showAlertModel1)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }
            });
    };

    // console.log(props?.data?.BatchNum)


    const getBatchOption = () => {
        setConfirmAlertModel(false);
        setLoading(true);
        WebService.getAPI({
            action: `SDInvoiceBatch/GetAllOpenBatches/${user_info["AccountId"]}/${user_info["CompanyId"]}`,
            body: null,
        })
            .then((res: any) => {
                var array = [];
                for (var i in res) {
                    array.push({ id: res[i].BatchNum, value: res[i].BatchNum });
                }
                setBatch(array);

                setLoading(false);
            })
            .catch((e) => {

                setLoading(false);
            });
    };

    return (

        <>
            <Loader show={isLoading} />
            <DraggableModal
                isOpen={confirmAlertModel}
                onClose={() => setConfirmAlertModel(false)}
                title="Alert"
                type="CONFIRM_MODAL"
                width={600}
                previousData={errorMessage}
                onConfirm={handleForm}

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
                    <form onSubmit={handleSubmit(onConfirm)}>
                        <div className="modal-body px-3">
                            <div className=" service-address">
                                <div className="service-location-form form-style">
                                    <div className=" row firstrow">

                                        <div className="col-4 ">
                                            <div className="form-group">
                                                <Label title="Assign for the Invoice" /><br />
                                                <Label title={props?.data?.InvoiceNum}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-4">
                                            <div className="form-group">
                                                <div className=" rounded-pill">
                                                    <Label title="Batch#" />
                                                    <Controller
                                                        control={control}
                                                        name="BatchNum"
                                                        rules={{ required: true }}
                                                        render={({ field }) => (
                                                            <SawinSelect
                                                                options={Batches}
                                                                selected={props?.data?.BatchNum}
                                                                onChange={(data: any) => field.onChange(data.id)}
                                                            />
                                                        )}
                                                    />
                                                </div>
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
                                Assign Batch
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

export default AddAssignBatchBlade;
