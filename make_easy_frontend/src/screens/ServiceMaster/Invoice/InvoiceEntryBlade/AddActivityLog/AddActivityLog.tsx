import './AddActivityLog.scss';
import { Button, Offcanvas, Row, Col, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InvoiceState } from '../../../../../reducer/CommonReducer';
import { Label } from '../../../../../components/Label/Label';
import { useForm, Controller } from "react-hook-form";
import { useState } from 'react';
import Loader from '../../../../../components/Loader/Loader';
import WebService from '../../../../../utility/WebService';
import { toast } from 'react-toastify';

interface PropData {
    isShow: boolean;
    isClose: any;
}

const AddActivityLog = (props: PropData) => {
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        clearErrors,
        formState: { errors },
    } = useForm();
    const [isLoading, setLoading] = useState(false);
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");

    const onCloseModal = () => {
        clearErrors("NewValue");
        props.isClose(!props.isShow);
    };

    const onSubmit = (requestedData: any) => {
        setLoading(true)
        requestedData.SDCallMasterId = invoiceData?.invoiceData?.InvoiceNum;
        requestedData.SDServiceMasterId = invoiceData?.invoiceData?.SMNum;
        requestedData.SDServiceMasterName = invoiceData?.invoiceData?.SMName;
        requestedData.CompanyId = user_info["CompanyId"];
        requestedData.AccountId = user_info["AccountId"];
        WebService.postAPI({
            action: `SDCallMaster/LogCallActivity`,
            body: requestedData
        })
            .then((res) => {
                setLoading(false)
                toast.success('Activity log added successfully')
                reset();
                onCloseModal()
            })
            .catch((e) => {
                setLoading(false)
            })
    }
    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas show={props.isShow} onHide={onCloseModal} placement={'end'} className="offcanvas-large">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Add Entry</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="px-0 pb-0">
                    <form className="form-style" onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-4  modal-inner-min-h">

                            <Row className="mb-3">
                                <Col md-6>
                                    <label htmlFor="">Service Master</label>
                                    <p className="mb-0">{invoiceData?.invoiceData?.SMNum} {invoiceData?.invoiceData?.SMName}</p>
                                </Col>
                                <Col md-6>
                                    <label htmlFor="">Service Call #</label>
                                    <p className="mb-0">{invoiceData?.invoiceData?.InvoiceNum}</p>
                                </Col>
                                <Col md="12" className="mb-3 mt-3">
                                    <Label title='Description' showStar={true} />
                                    <textarea className="form-control h-auto" rows={3}   {...register("NewValue", {
                                        required: true,
                                    })} />
                                    {errors.NewValue && (
                                        <Label title={"Please enter description."} modeError={true} />
                                    )}
                                </Col>

                            </Row>
                        </div>
                        <div className="offcanvas-footer">
                            <Button variant="primary" className="btn-brand-solid me-3" type="submit">Submit</Button>
                            <Button variant="primary" className="btn-brand-outline" type="button" onClick={() => onCloseModal()}>Cancel</Button>
                        </div>
                    </form>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default AddActivityLog;