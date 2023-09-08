import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../config/Store";
import { SDMaster } from "../../../../../reducer/CommonReducer";
import WebService from "../../../../../utility/WebService";
import { Button, Card, Row, Col, Offcanvas, Form } from 'react-bootstrap';
import { Dispatch } from "redux";
import Loader from "../../../../../components/Loader/Loader";
import TextEditor from "../../../../../components/TextEditor/TextEditor";
import { Label } from "../../../../../components/Label/Label";
import BsButton from "react-bootstrap/Button";
import StandardDescriptionModal from "../../../../../components/StandardDescriptionModal/StandardDescriptionModal";
import { toast } from "react-toastify";

import { useForm, Controller } from "react-hook-form";
import Plumbing from "../../../../../assets/images/plumbing.jpg";
import Electrician from "../../../../../assets/images/electrician.jpg";
import loader from "../../../../../assets/images/loader.gif";
import { ChevronRight, CircleFill, X, FilePdf, FileExcel, FileText } from "react-bootstrap-icons";
import SawinDatePicker from "../../../../../components/SawinDatePicker/SawinDatePicker";
import HelperService from "../../../../../utility/HelperService";
import SawinSelect from "../../../../../components/Select/SawinSelect";
import SignatureCanvas from "../../../../../components/Select/SignatureCanvas/SignatureCanvas";

interface PropData {
    isShow: boolean;
    isClose: any;
    data: any;
    Ids: any
}

const TaskListBlade = (props: PropData) => {
    const {  register,   handleSubmit,    reset,  watch,   formState: { errors },  control,  setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [isLoading, setLoading] = useState(false);
    const [documentURL, setDocumentURL] = useState<any>([]);
    const [fileName, setFileName] = useState("");
    const [documentUrl, setDocumentUrl] = useState('');
    const [taskListData, setTaskListData] = useState<any[]>([]);
    const [ShowLoader, setShowLoader] = useState(false);
    const taskListDataRef = useRef<any[]>([])

    const onCloseModal = (e: any) => {
        props.isClose(!props.isShow, e);
    };

    // console.log(taskListData)
    // console.log(props.data)
    // console.log(props.Ids)

    useEffect(() => {
        if (props.isShow == true && props.Ids?.CallTaskListId) {
            // SaiTaskList/GetCheckListForEquipment/340/1/3696/123/48/123458900-1/1
            // GetCheckListForEquipment/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data?.SDCallMasterId}/${props.data?.EntityCode}/{sdEquipmentMasterId}/{props.data?.SDCallMaster?.SDServiceMasterId}/{taskListId}

            // `GetCheckListForCall/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data?.SDCallMasterId}/${props.data?.EntityCode}/{props.data?.CallTaskListId}`
            getPackages()
            // setTaskListData(props.Ids?.Packages)
        }
    }, [props.isShow]);


    const getPackages = () => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SaiTaskList/GetCheckListForCall/${user_info["AccountId"]}/${user_info["CompanyId"]}/${props.data?.SDCallMasterId}/${props.data?.EntityCode}/${props.Ids?.CallTaskListId}`,
            body: null,
        })
            .then((res: any) => {
                setShowLoader(false)
                console.log(res)
                setTaskListData(res);
                taskListDataRef.current = res;
            })
            .catch((e) => { setShowLoader(false) });
    }


    const handleChange = function (e: any) {
        var size = e.target.files[0].size / 1024 / 1024
        if (size < 2) {
            setFileName(e.target.files[0].name)
            setDocumentURL(e.target.files);
            setDocumentUrl(URL.createObjectURL(e.target.files[0]))
            //getOnchangePreview(e.target.files[0].name,URL.createObjectURL(e.target.files[0]))
        } else {
            toast.error("File should less then 2mb")
        }
    };

    const removeFile = () => {
        //getPreview("")
        setFileName("")
        setDocumentUrl("")
        setDocumentURL([])
    }

    const onSign = (e: any) => {
        console.log(e);
    }

    const getSawinSelect = (e: any) => {
        var array: any = [];
        for (var i in e?.ComboValues) {
            array.push({ id: e?.ComboValues[i].CallPackageComboValueId, value: e?.ComboValues[i].Value });
        }
        return (
            <Col className="my-1" md={6}>
                <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                    __html: e.Value,
                }}></Form.Label>
                <Controller
                    control={control}
                    name={e.Value}
                    rules={{ required: e.IsMandatory }}
                    render={({ field }) => (
                        <SawinSelect
                            options={array}
                            selected={e.ComboSelectedValue ? e.ComboSelectedValue : ""}
                            isHideArrow={false}
                            onChange={(data: any) => {
                                {
                                    field.onChange(data.CallPackageComboValueId)
                                }
                            }}
                        />
                    )}
                />
            </Col>
        )
    };

    const onChangeGrade = (data: any) => {
        // taskListDataRef.current.[0].Packages
        console.log(data)
    }

    return (
        <>
            <Offcanvas
                show={props.isShow}
                onHide={() => onCloseModal("no")}
                placement={"end"}
                className="offcanvas-ex-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{props.Ids?.Header}</Offcanvas.Title>
                </Offcanvas.Header>
                <form action="">
                    <Offcanvas.Body className="px-0 py-0">
                        <div className="modal-body px-3 modal-inner-min-h py-3 ">
                            {
                                ShowLoader === true ? (
                                    <div className="">
                                        <div></div>
                                        <div style={{ textAlign: "center", marginTop: "10%" }}>
                                            <img
                                                style={{ position: "relative" }}
                                                src={loader}
                                                alt="No loader found"
                                            />
                                            <div style={{ position: "relative", color: "white" }}>
                                                Loading...
                                            </div>
                                        </div>
                                    </div>
                                ) : (<Row>
                                    {
                                        taskListData.length > 0 && taskListData[0].Packages.length > 0 && 
                                        taskListData[0].Packages.map((item: any, index: any) => {
                                            return (
                                                <>
                                                    {
                                                        item.AnswerType == "M" &&
                                                        <>
                                                            {
                                                                item.Type == "Label" &&
                                                                <Col className="my-1" md={6}>
                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                        __html:
                                                                            item.Value,
                                                                    }}></Form.Label>
                                                                </Col>
                                                            }
                                                            {
                                                                item.Type == "Date" &&
                                                                <>
                                                                    <Col className="my-1" md={6}>
                                                                        <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                            __html: item.Value,
                                                                        }}></Form.Label>
                                                                        <Controller
                                                                            control={control}
                                                                            name={item.Value}
                                                                            rules={{ required: item.IsMandatory }}
                                                                            render={({ field }) => (
                                                                                <SawinDatePicker
                                                                                    selected={item?.UserInput ? item?.UserInput : ""}
                                                                                    onChange={(data: any) => console.log(data)}
                                                                                />
                                                                            )}
                                                                        />
                                                                    </Col>
                                                                </>
                                                            }
                                                            {
                                                                item.Type == "String" &&
                                                                <>
                                                                    <Col className="my-1" md={6}>
                                                                        <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                            __html: item.Value,
                                                                        }}></Form.Label>
                                                                        <input
                                                                            className="form-control input"
                                                                            type="text"
                                                                            defaultValue={item.UserInput ? item?.UserInput : ""}
                                                                            {...register(item.Name, { required: item.IsMandatory })}
                                                                        ></input>
                                                                    </Col>
                                                                </>
                                                            }
                                                            {
                                                                item.Type == "Number" &&
                                                                <>
                                                                    <Col className="my-1" md={6}>
                                                                        <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                            __html: item.Value,
                                                                        }}></Form.Label>
                                                                        <input
                                                                            className="form-control input"
                                                                            type="text"
                                                                            defaultValue={item?.UserInput ? item?.UserInput : ""}
                                                                            onKeyPress={(e) =>
                                                                                HelperService.allowOnlyNumericValue(e)
                                                                            }
                                                                            {...register(item.Value, { required: item.IsMandatory })}
                                                                        ></input>
                                                                    </Col>
                                                                </>
                                                            }
                                                            {
                                                                item.Type == "Multiline" &&
                                                                <>
                                                                    <Col className="my-1" md={12}>
                                                                        <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                            __html: item.Value,
                                                                        }}></Form.Label>
                                                                        <textarea
                                                                            className="form-control booknew-textarea h-auto"
                                                                            rows={4}
                                                                            defaultValue={item?.UserInput ? item?.UserInput : ""}
                                                                            {...register(item.Name, { required: item.IsMandatory })}
                                                                        />
                                                                    </Col>
                                                                </>
                                                            }
                                                            {
                                                                item.Type == "DocumentUpload" &&
                                                                <Col className="my-1" md={12}>
                                                                    <div className="mb-3 add-document">
                                                                        <div className='upload-document' dangerouslySetInnerHTML={{
                                                                            __html: item.Value,
                                                                        }}></div>
                                                                        <input type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
                                                                        <label id="label-file-upload" htmlFor="input-file-upload">
                                                                            <div className='d-flex'>
                                                                                <img src={require('../../../../../assets/images/upload-icon.svg').default} className='me-1 theme-icon-color' alt='loading...' />
                                                                                Upload Document </div>
                                                                        </label>
                                                                        <div>
                                                                            {
                                                                                fileName &&
                                                                                <div className="file-name-tag text-center">
                                                                                    <span className='font-14 text-dark'>{fileName}</span><button className='remove-file-btn text-dark' onClick={() => removeFile()} type='button'><X size={18} /></button>
                                                                                </div>
                                                                            }
                                                                        </div>
                                                                        <div className="text-center text-dark mt-2">
                                                                            Upload files here
                                                                        </div>
                                                                    </div>

                                                                </Col>
                                                            }
                                                            <div className="task-doc-list mb-4">
                                                                {
                                                                    item.Type == "DocumentUpload" && item.checkListDocuments.length > 0 &&
                                                                    item.checkListDocuments.map((res: any) => {
                                                                        return (
                                                                            <div className="document ">
                                                                                <div className="document-type">
                                                                                    <img src={res?.ThumbnailUrl ? res?.ThumbnailUrl : require('../../../../../assets/images/PDF-file-type.svg').default} className='' alt='PDF' width={60} />
                                                                                </div>
                                                                                <input type="text" className="file-name" defaultValue={res?.Name} />
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                            {
                                                                item.Type == "Signature" && item?.checkListDocuments.length > 0 &&
                                                                item?.checkListDocuments.map((res: any, index: number) => {
                                                                    return (
                                                                        <Col key={"taskList-" + index} className="my-1" md={6}>
                                                                            <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                                __html: item.Value,
                                                                            }}></Form.Label>
                                                                            <SignatureCanvas signature={onSign} previousSignature={res.ImageFile} />
                                                                            <input
                                                                                className="form-control input mt-1"
                                                                                type="text"
                                                                                defaultValue={res.Name ? res?.Name : ""}
                                                                                {...register(res.Name, { required: item.IsMandatory })}
                                                                            ></input>
                                                                            <p className="text-end font-medium font-14">{HelperService.getFormatedDate(res?.SignedOn)}</p>
                                                                        </Col>
                                                                    )
                                                                })

                                                            }
                                                            {
                                                                item.Type == "Signature" && item?.checkListDocuments.length == 0 &&
                                                                <Col className="my-1" md={6}>
                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                        __html: item.Value,
                                                                    }}></Form.Label>
                                                                    <SignatureCanvas signature={onSign} />
                                                                    <input
                                                                        className="form-control input mt-1"
                                                                        type="text"
                                                                        defaultValue={item.Name ? item?.Name : ""}
                                                                        {...register(item.Value, { required: item.IsMandatory })}
                                                                    ></input>
                                                                </Col>
                                                            }
                                                            {
                                                                item.Type == "Checkbox" &&
                                                                <div>

                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                        __html: item.Value,
                                                                    }}></Form.Label>
                                                                    <Form.Group className="me-3">
                                                                        <Form.Check defaultChecked={item?.UserInput} type="checkbox" />
                                                                    </Form.Group>

                                                                </div>
                                                            }
                                                        </>
                                                    }

                                                    {
                                                        item.AnswerType == "P" &&
                                                        <>
                                                            <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                __html: item.Value,
                                                            }}></Form.Label>
                                                            <Col className="my-1" md={6}>
                                                                <div className="d-flex justify-content-evenly mb-4">

                                                                    {
                                                                        item.PackageValues.length > 0 &&
                                                                        item.PackageValues.map((ite: any) => {
                                                                            return (
                                                                                <>
                                                                                    {
                                                                                        ite.Type == "CheckBox" && ite.Items.length > 0 &&
                                                                                        ite.Items.map((res: any, ind: number) => {
                                                                                            return (
                                                                                                <div key={ind}>
                                                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                                                        __html: res.Value,
                                                                                                    }}></Form.Label>
                                                                                                    <Form.Group className="me-3">
                                                                                                        <Form.Check defaultChecked={res?.UserInput} type="checkbox" />
                                                                                                    </Form.Group>
                                                                                                </div>
                                                                                            )

                                                                                        })
                                                                                    }
                                                                                    {
                                                                                        ite.Type == "TextBox" && ite.Items.length > 0 &&
                                                                                        ite.Items.map((res: any, ind: number) => {
                                                                                            return (
                                                                                                <div key={ind}>
                                                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                                                        __html: res.Value,
                                                                                                    }}></Form.Label>
                                                                                                    <input
                                                                                                        className="form-control input"
                                                                                                        type="text"
                                                                                                        defaultValue={res.UserInput ? res?.UserInput : ""}
                                                                                                        {...register(res.Value, { required: item.IsMandatory })}
                                                                                                    ></input>
                                                                                                </div>
                                                                                            )

                                                                                        })
                                                                                    }


                                                                                </>
                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                            </Col>
                                                            {/* {
                                    item.PackageValues.length > 0 && item.PackageValues[0].Type == "TextBox" &&
                                    <>
                                        <Col className="my-1" md={6}>
                                            {
                                                item.PackageValues[0].Items.map((res: any, ind: number) => {
                                                    return (
                                                        <>
                                                            <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                __html: res.Value,
                                                            }}></Form.Label>
                                                            <input
                                                                className="form-control input"
                                                                type="text"
                                                                onKeyPress={(e) =>
                                                                    HelperService.allowOnlyNumericValue(e)
                                                                }
                                                                {...register(res.Value, { required: item.IsMandatory })}
                                                            ></input>
                                                        </>
                                                    )
                                                })
                                            }


                                        </Col>
                                    </>
                                } */}
                                                        </>
                                                    }
                                                    {
                                                        item.AnswerType == "L" &&
                                                        <>
                                                            <Col className="my-1" md={6} >
                                                                <div className="d-flex mb-4">
                                                                    <Form.Label className="me-3 font-w-medium" dangerouslySetInnerHTML={{
                                                                        __html: item.Value,
                                                                    }}></Form.Label>
                                                                    {
                                                                        item.ComboValues.length > 0 &&
                                                                        item.ComboValues.map((res: any, ind: number) => {
                                                                            return (
                                                                                <>
                                                                                    <Form.Group className="me-3 grade-level" style={{ backgroundColor: res.Value }}  >
                                                                                        <Form.Check value={res?.Value} type="radio" defaultChecked={item?.ComboSelectedValue == res?.Value} name={item.Value} onChange={() => onChangeGrade(res)} />
                                                                                    </Form.Group>
                                                                                </>

                                                                            )
                                                                        })
                                                                    }
                                                                </div>
                                                            </Col>
                                                        </>
                                                    }
                                                    {
                                                        item.AnswerType == "C" && item?.ComboValues.length > 0 && getSawinSelect(item)
                                                    }
                                                    {
                                                        item.AnswerType == "T" && alert("hi")
                                                    }





                                                    {/* {
                            item.PackageValues && item.PackageValues.length > 0 && item.PackageValues[0].Type == "CheckBox" && item.PackageValues[0].Items && item.PackageValues[0].Items.length > 0 &&
                            item.PackageValues[0].Items.map((res: any, ind: number) => {
                                return (
                                    <Col className="my-1" md={6} key={ind}>
                                        <Form.Label dangerouslySetInnerHTML={{
                                            __html: res.Value,
                                        }}></Form.Label>
                                        <Form.Group className="me-3">
                                            <Form.Check type="checkbox" />
                                        </Form.Group>
                                    </Col>
                                )
                            })
                        } */}
                                                </>
                                            )

                                        })
                                    }
                                </Row>)
                            }

                        </div>
                        <div className="offcanvas-footer mt-4">
                            <Button
                                variant="primary"
                                className="btn-brand-solid me-3"
                                type="submit"
                            >
                                Save
                            </Button>
                            <Button
                                variant="primary"
                                className="btn-brand-outline"
                                type="button"
                                onClick={() => onCloseModal("no")}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Offcanvas.Body>
                </form>
            </Offcanvas>
        </>
    );
};

export default TaskListBlade;
