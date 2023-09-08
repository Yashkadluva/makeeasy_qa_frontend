import React, { useEffect, useState } from 'react';
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import { Label } from "../../../../../components/Label/Label";
import './PreviewMail.scss';
import TextEditor from "../../../../../components/TextEditor/TextEditor";
import WebService from '../../../../../utility/WebService';
import { Controller, useForm } from "react-hook-form";
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../config/Store';
import { InviceSDMasterState, InvoiceState } from '../../../../../reducer/CommonReducer';
import attachIcon from '../../../../../assets/images/attach-icon.png';
import cancelIcon from "../../../../../assets/images/cancel.svg";
import { toast } from 'react-toastify';
import moment from 'moment';
import HelperService from '../../../../../utility/HelperService';
import Loader from '../../../../../components/Loader/Loader';

interface PropData {
    isShow: boolean;
    isClose: any;
    invoicePdf: string;
}

const PreviewMail = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        setValue,
    } = useForm();
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const [dragActive, setDragActive] = React.useState(false);
    const [emailBody, setEmailBody] = useState<any>({});
    const [previousData, setpreviousData] = useState("");
    const [attachments, setAttachments] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(false);

    const onCloseModal = () => {
        props.isClose(!props.isShow);
    };

    useEffect(() => {
        getEmailBody()
        getSenderEmail()
        getAttachments()
    }, [props.invoicePdf])

    const getEmailBody = () => {
        WebService.getAPI({
            action: `SAIEmailTemplate/GetEmailTemplate/${user_info["AccountId"]}/${user_info["CompanyId"]}/6/51`,
            body: null
        })
            .then((res: any) => {
                res.EmailBody = res.EmailBody.replaceAll("[SendingInvoice.ARCustomerName]", invoiceData?.invoiceData?.ARName);
                res.EmailBody = res.EmailBody.replaceAll("[SendingInvoice.InvoiceNum]", invoiceData?.invoiceData?.InvoiceNum);
                res.EmailBody = res.EmailBody.replaceAll("[SendingInvoice.CompanyName]", invoiceData?.invoiceData?.CompanyName);
                res.EmailBody = res.EmailBody.replaceAll("[SendingInvoice.CompanyPhone]", invoiceData?.invoiceData?.CompanyPhone);
                res.EmailBody = res.EmailBody.replaceAll("[SendingInvoice.AmountDue]", invoiceData?.invoiceData?.AmountDue);
                setpreviousData(res.EmailBody)
                setEmailBody(res)
                reset(res)
                if (res.EmailSubject === 'Invoice') {
                    setValue('EmailSubject', `Please find Invoice # ${invoiceData?.invoiceData?.InvoiceNum} attached with this email`)
                }
            })
            .catch((e) => {

            })
    }

    const getSenderEmail = () => {
        WebService.getAPI({
            action: `EntityContact/GetContactWithEmail/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoceSDMaster.invoceSDMaster.SDServiceMasterId}/1`,
            body: null
        })
            .then((res: any) => {
                var data = res.toString();
                getServiceMaster(data)
            })
            .catch((e) => {

            })
    }

    const getServiceMaster = (emails: any) => {
        WebService.getAPI({
            action: `SDserviceMaster/${invoceSDMaster.invoceSDMaster.SDServiceMasterId}_${user_info["AccountId"]}_${user_info["CompanyId"]}`,
            body: null
        })
            .then((res: any) => {
                var data = res.ARCustomerMaster.Email && res.ARCustomerMaster.Email + ",".concat(emails)
                setValue('TO', data)
            })
            .catch((e) => {

            })
    }

    const getAttachments = () => {
        WebService.getAPI({
            action: `SDInvoice/GetInvoiceAttachments/${user_info["AccountId"]}/${user_info["CompanyId"]}/${invoiceData?.invoiceData?.InvoiceNum}`,
            body: null
        })
            .then((res: any) => {
                var array = [];
                array.push({ DocumentName: "Invoice.pdf", DocumentURL: props.invoicePdf })
                for (var i in res) {
                    array.push(res[i])
                }
                setAttachments(array)
            })
            .catch((e) => {

            })
    }

    const handleDrag = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers when file is dropped
    const handleDrop = function (e: any) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // handleFiles(e.dataTransfer.files);
        }
    };

    // triggers when file is selected with click
    const handleChange = function (e: any) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setLoading(true)
            // handleFiles(e.target.files);
            let fromData = new FormData();
            fromData.append('AccountId', user_info["AccountId"])
            fromData.append('CompanyId', user_info["CompanyId"])
            fromData.append('files', e.target.files[0])
            WebService.postAPI({
                action: `PrintOrEmail/UploadDocument`,
                body: fromData
            })
                .then((res: any) => {
                    setLoading(false)
                    attachments.push({ DocumentName: res.FileName, DocumentURL: res.UploadedUri })
                    setAttachments([...attachments])
                    toast.success('Attachment uploaded successfully');
                })
                .catch((e) => { setLoading(false) })
        }
    };

    const currentValue = (value: any) => {
        setpreviousData(value);
    };

    const onSubmit = (data: any) => {
        var isCheck = false;
        if (data.TO) {
            var email = data.TO.split(",");
            for (var i in email) {
                var check = HelperService.isValidEmail(email[i])
                if (check === false) {
                    toast.error('Please enter valid email in TO')
                    isCheck = true;
                    break;
                }
            }
        }

        if (data.CC) {
            var email = data.CC.split(",");
            for (var i in email) {
                var check = HelperService.isValidEmail(email[i])
                if (check === false) {
                    toast.error('Please enter valid email in CC')
                    isCheck = true;
                    break;
                }
            }
        }

        if (data.BCC) {
            var email = data.BCC.split(",");
            for (var i in email) {
                var check = HelperService.isValidEmail(email[i])
                if (check === false) {
                    toast.error('Please enter valid email in BCC')
                    isCheck = true;
                    break;
                }
            }
        }

        if (isCheck === false) {
            var documentArray = [];
            for (var i in attachments) {
                documentArray.push(attachments[i].DocumentURL)
            }
            documentArray.push(props.invoicePdf)
            var token: any = {
                InvoiceNum: invoiceData.invoiceData.InvoiceNum,
                InvoiceDate: invoiceData.invoiceData.InvoiceDate && moment(invoiceData.invoiceData.InvoiceDate).format('MM/DD/YYYY hh:mm:ss'),
                CallNum: invoiceData.invoiceData.CallNum,
                ARCustomerName: invoiceData.invoiceData.ARName,
                ARCustomerAddress: invoiceData.invoiceData.ARAddress,
                Surveylink: '',
                InvoiceTotal: `"${invoiceData.invoiceData.InvoiceTotal}"`,
                AmountDue: `"${invoiceData.invoiceData.AmountDue}"`,
                CompanyName: invoiceData.invoiceData.CompanyName,
                CompanyPhone: invoiceData.invoiceData.CompanyPhone,
                CustomerPortalLink: 'CUSTOMER_PORTAL_LINK',
                InvoicePaymentLink: 'CP_INVOICE_PAYMENT_LINK',
            }
            var requestedBody = {
                To: data.TO,
                CC: data.CC,
                Bcc: data.BCC,
                Subject: data.EmailSubject,
                Body: previousData,
                AttachmentUrls: documentArray,
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                EmailTemplateCategoryId: emailBody.SAIEmailTemplateCategoryId,
                EmailType: emailBody.EmailType,
                IsDeleteBlobs: true,
                EntityId: invoiceData.invoiceData.InvoiceNum,
                JsonForTokenData: JSON.stringify(token)
            }
            WebService.postAPI({
                action: `PrintOrEmail/SendEmail`,
                body: requestedBody
            })
                .then((res) => {
                    toast.success('Email send successfully')
                    onCloseModal()
                })
                .catch((e) => { })
        }
    }

    const onDeleteDocument = (data: any, index: any) => {
        for (var i in attachments) {
            if (index == i) {
                attachments.splice(index, 1)
            }
        }
        setAttachments([...attachments])
        toast.success("File removed successfully")
    }

    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas
                show={props.isShow}
                onHide={onCloseModal}
                placement={"end"}
                className="offcanvas-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Preview-Email</Offcanvas.Title>
                </Offcanvas.Header>

                <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body px-3 modal-inner-min-h form-group previewMail form-style">
                            <div className="d-flex column mt-3 align-items-center">
                                <div className="label text-dark">
                                    <Label title="To" showStar={true} />
                                </div>
                                <div className="input">
                                    <input
                                        className="form-control"
                                        type="text"
                                        {...register("TO", { required: true })}
                                    ></input>
                                    {errors.TO && (
                                        <Label
                                            title={"Please Enter Mail."}
                                            modeError={true}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="d-flex column mt-3 align-items-center">
                                <div className="label font-14 text-dark">
                                    <Label title="CC" />
                                </div>
                                <div className="input">
                                    <input
                                        className="form-control"
                                        type="text"
                                        {...register("CC", { required: false })}
                                    ></input>
                                </div>
                            </div>
                            <div className="d-flex column mt-3 align-items-center">
                                <div className="label text-dark">
                                    <Label title="BCC" />
                                </div>
                                <div className="input">
                                    <input
                                        className="form-control"
                                        type="text"
                                        {...register("BCC", { required: false })}
                                    ></input>
                                </div>
                            </div>
                            <div className="d-flex column mt-3 align-items-center">
                                <div className="label text-dark text-nowrap">
                                    <Label title="Subject" showStar={true} />
                                </div>
                                <div className="input">
                                    <input
                                        className="form-control"
                                        type="text"
                                        {...register("EmailSubject", { required: true })}
                                    ></input>
                                    {errors.EmailSubject && (
                                        <Label
                                            title={"Please enter subject"}
                                            modeError={true}
                                        />
                                    )}
                                </div>
                            </div>
                            <div className="d-flex column mt-3">
                                <div className="label text-dark">
                                    <Label title="Body" />
                                </div>
                                <div className="textEditorInput ms-2" style={{ width: "633px" }}>
                                    <TextEditor
                                    type={"NORMAL"}
                                        data={previousData}
                                        editedData={currentValue}
                                    />
                                </div>
                            </div>
                            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className='col-12 d-flex mb-3'>
                                <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                                <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""} >
                                    <div className='d-flex'><img src={require('../../../../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' /> Browse</div>
                                </label>
                                {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                            </form>
                            <div className='verticalLine' />
                            <div className='attachment text-dark'>Attachment(s)</div>
                            {/* <div className='document-list'>
                                <img src={attachIcon} /><a onClick={() => window.open(props.invoicePdf, "_blank")}> Invoice.pdf</a>
                                <a href="javascript:void(0)" className="edit-action"  onClick={() => onDeleteDocument(res, "OTHER_DOCUMENTS")}>  <img src={cancelIcon} alt="" height={11} style={{ marginLeft: 10 }} /></a>
                            </div> */}
                            {
                                attachments.map((res, index) => {
                                    return (
                                        <div className='document-list'>
                                            <img src={attachIcon} className="theme-icon-color" /><a onClick={() => window.open(res.DocumentURL, "_blank")}> {res.DocumentName}</a>
                                            <a href="javascript:void(0)" className="edit-action" onClick={() => onDeleteDocument(res, index)}>  <img src={cancelIcon} className="theme-icon-color" height={11} style={{ marginLeft: 10 }} /></a>
                                        </div>
                                    )
                                })
                            }
                            <div className='verticalLine' />
                        </div>
                        <div className="offcanvas-footer mt-4">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                Send
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
    )
}

export default PreviewMail;