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
import { RootState } from "../../../../../config/Store";
import { SDMaster } from "../../../../../reducer/CommonReducer";

interface PropData {
    isShow: boolean;
    title: string;
    isClose: any;
    data: any;
}

const AddCreditModal = (props: PropData) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        reset,
        setValue,
    } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [bladeTitle, setBladeTitle] = useState("  Invoice Credit Memo ");
    const [pageLoader, setPageLoader] = useState(false);
    const [isDefault, setIsDefault] = useState(false)
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [Batches, setBatch] = useState<Options[]>([]);
    const data: any = useSelector<RootState, SDMaster>((state) => state.sdMaster);



    useEffect(() => {
        if (props.isShow == true && Batches.length == 0) {
            getBatchOption();
        }
    }, [props.isShow])

    const onCloseModal = () => {
        reset({})
        props.isClose(!props.isShow);
    };

    const handleForm = (requestBody: any) => {
        data.CreditedInvoiceNum = requestBody.CreditMemo
        data .BatchNum = requestBody.BatchNum
        WebService.postAPI({
            action: `SDInvoice/CreateCreditMemo`,
            body: data,
            
        })
            .then((res: any) => {
                setPageLoader(false);
                setLoading(false)

                if (res[0] == "ConfirmationForPurchaseOrderNotExist") {
                    setErrorMessage("Credit memo can be created only when invoice is posted")
                } else {
                    onCloseModal();
                }
            })
            .catch((e) => {
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel);
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message);
                }
            });
    };

    const getBatchOption = () => {
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
                                                <Label title="Credit Memo for the Invoice" /><br />
                                                <Label title={props?.data?.InvoiceNum}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-4 ">
                                            <div className="form-group">
                                                <Label title="Credit Memo#" />
                                                <input
                                                    defaultValue={props?.data?.InvoiceNum}
                                                    className="form-control input"
                                                    type="text"
                                                    {...register("CreditMemo")}
                                                    placeholder="Credit Memo"
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
                                Save
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

export default AddCreditModal;
