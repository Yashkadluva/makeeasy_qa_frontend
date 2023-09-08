import "./InvoiceEntry.scss";
import BackComponent from "../../../../components/BackComponent/BackComponent"
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useRef, useState } from "react";
import WebService from "../../../../utility/WebService";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../config/Store";
import { InvoiceState, InviceSDMasterState } from "../../../../reducer/CommonReducer";
import mail from '../../../../assets/images/message-icon.png';
import download from '../../../../assets/images/download.png';
import loader from "../../../../assets/images/loader.gif";
import PreviewMail from "../InvoiceEntryBlade/PreviewMail/PreviewMail";
import { Label } from "../../../../components/Label/Label";
import { Controller, useForm } from "react-hook-form";
// import SawinSelect from "../../../../Select/SawinSelect";
import { Envelope, FileEarmarkArrowDown } from 'react-bootstrap-icons'
import SawinSelect from "../../../../components/Select/SawinSelect";
import { Dispatch } from "redux";
import { setDataInRedux, SET_INVOICE_DATA } from "../../../../action/CommonAction";

const InvoiceEntryPreview = () => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const invoiceData: any = useSelector<RootState, InvoiceState>(
        (state) => state.invoice);
    const invoceSDMaster: any = useSelector<RootState, InviceSDMasterState>(
        (state) => state.invoceSDMaster);
    const [rawData, setRawData] = useState('')
    const [footer, setFooter] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [isShowModal, setShowModal] = useState(false)
    const [dropDownList, setDropDownList] = useState();
    const [selected, setSelected] = useState();
    const url = useRef('')
    const {
        control,
    } = useForm();
    const dispatch: Dispatch<any> = useDispatch();

    useEffect(() => {
        if (invoiceData?.invoiceData?.InvoiceType) {
            getDropDownData(invoiceData.invoiceData.InvoiceType)
        } else {
            getDownloadUrl('GetInvoicePDFUri')
        }
        getDropDownOption()
    }, [])

    const getDocument = () => {
        var requestedBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            InvoiceNum: invoiceData?.invoiceData?.InvoiceNum,
            CallNum: invoiceData?.invoiceData?.CallNum
        }
        WebService.postAPI({
            action: `SDInvoice/GetInterpolatedInvoiceHtml`,
            body: requestedBody
        })
            .then((res: any) => {
                setRawData(res.ContentHtml)
                setFooter(res.FooterHtml)

                setLoading(false)
            })
            .catch((e) => {
                console.log("e", e)
                setLoading(false)
            })
    }

    const getDownloadUrl = (actionUrl: any) => {
        setLoading(true)
        var requestedBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            InvoiceNum: invoiceData?.invoiceData?.InvoiceNum
        }
        WebService.postAPI({
            action: `SDInvoice/` + actionUrl,
            body: requestedBody
        })
            .then((res: any) => {
                url.current = res
                getDocument()
            })
            .catch((e) => {
                console.log(e)
                setLoading(false)
            })
    }

    const getDropDownOption = () => {
        WebService.getAPI({
            action: `SetupSaiSDEmailStyle/GetAll/${user_info["AccountId"]}/${user_info["CompanyId"]}/SDInvoice`,
            body: null
        })
            .then((res: any) => {
                var array: any = [];
                for (var i in res) {
                    array.push({ id: res[i].Code, value: res[i].Description });
                }
                setDropDownList(array)
            })
            .catch((e) => {

            })
    }

    const getDropDownData = (e: any) => {
        let data: any = invoiceData.invoiceData;
        data.InvoiceType = e;
        dispatch(setDataInRedux({ type: SET_INVOICE_DATA, value: data }));
        setSelected(e)
        setLoading(true)
        var requestedBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            EntityId: invoiceData?.invoiceData?.InvoiceNum,
            EmailStyleCode: e
        }
        WebService.postAPI({
            action: `SDInvoice/UpdateEmailStyle`,
            body: requestedBody
        })
            .then((res: any) => {
                setRawData(res.ContentHtml)
                setFooter(res.FooterHtml)

                setLoading(false)
                getDownloadUrl("UpdateInvoicePDFUriOnStyleChange");
            })
            .catch((e) => {
                console.log("e", e)
                setLoading(false)
            })
    }


    const closeModal = () => {
        setShowModal(false)
    }

    return (
        <>

            <PreviewMail
                isShow={isShowModal}
                isClose={closeModal}
                invoicePdf={url.current}
            />
            <div className=' '>
                <Row>
                    <Col md={12} id="wideCol">
                        <BackComponent title={'Preview'} />
                        <Card className="card-style form-style preview-card">
                            <Card.Body className="">
                                <Row className="align-items-center">

                                    <div className="col-4 d-flex  form-group">
                                        <Label title="Style" classNames="mt-2 mx-2" />
                                        <Controller
                                            control={control}
                                            name="Style"
                                            render={({ field }) => (
                                                <SawinSelect
                                                    options={dropDownList}
                                                    selected={selected}
                                                    onChange={(data: any) => getDropDownData(data.id)}
                                                />
                                            )}
                                        />
                                    </div>
                                    <Col className="text-end">
                                        {/* <a onClick={() => setShowModal(!isShowModal)}><img src={mail} className="me-3" /></a> */}
                                        <Button variant="primary" className="btn-brand-solid me-3" style={{ minWidth: "auto" }} onClick={() => { url.current && setShowModal(!isShowModal) }}><Envelope /></Button>
                                        <Button variant="primary" className="btn-brand-solid" style={{ minWidth: "auto" }} onClick={() => window.open(url.current, "_blank")}><FileEarmarkArrowDown /></Button>
                                        {/* <a onClick={() => window.open( url.current, "_blank")}> <img src={download} /></a> */}
                                    </Col>
                                </Row>
                            </Card.Body>
                            <Card.Body className="border-bottom border-light">
                                {
                                    isLoading === true ?
                                        <div style={{ textAlign: "center" }}>
                                            <img
                                                style={{ position: "relative", height: 79 }}
                                                src={loader}
                                                alt="No loader found"
                                            />
                                            <div style={{ position: "relative", color: "white" }}>
                                                Loading...
                                            </div>
                                        </div>
                                        :
                                        <div className="blue-border invoice-preview">
                                            <div dangerouslySetInnerHTML={{ __html: rawData }} />
                                            <div dangerouslySetInnerHTML={{ __html: footer }} />
                                        </div>
                                }
                            </Card.Body>

                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default InvoiceEntryPreview;