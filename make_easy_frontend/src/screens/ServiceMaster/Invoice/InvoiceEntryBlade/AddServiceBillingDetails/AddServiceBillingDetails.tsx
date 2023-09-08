import { useEffect, useState } from 'react';
import Offcanvas from "react-bootstrap/Offcanvas";
import Button from "react-bootstrap/Button";
import { Label } from "../../../../../components/Label/Label";
import { useForm, Controller } from "react-hook-form";
import SawinSelect from "../../../../../components/Select/SawinSelect";
import HelperService from '../../../../../utility/HelperService';
import WebService from '../../../../../utility/WebService';
import Loader from '../../../../../components/Loader/Loader';
import { toast } from 'react-toastify';

interface PropData {
    isShow: boolean;
    isClose: any;
    invoiceNum: any;
}

const AddServiceBillingDetails = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const { register, handleSubmit, formState: { errors }, control, setValue, watch } = useForm();
    const watchAllFields = watch();
    const [categoryOption, setCategoryOption] = useState<any[]>([]);
    const [serviceOption, setServiceOption] = useState<any[]>([]);
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        getCategory()
    }, [])

    const getCategory = () => {
        WebService.postAPI({
            action: `SaiServicesProvidedCategorySetup/List`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                Offset: 0,
                Limit: 100000000
            }
        })
            .then((res: any) => {
                var array = [];
                if (res.list.length > 0) {
                    for (var i in res.list) {
                        array.push({
                            value: res.list[i].CategoryName,
                            id: res.list[i].Id,
                        });
                    }
                    setCategoryOption(array)
                }
            })
            .catch((e) => {

            })
    }

    const getService = (id: any) => {
        WebService.postAPI({
            action: `SaiServicesProvidedCategorySetup/ServiceList/${id}`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                Offset: 0,
                Limit: 100000000
            }
        })
            .then((res: any) => {
                var array = [];
                if (res.list.length > 0) {
                    for (var i in res.list) {
                        array.push({
                            value: res.list[i].ServiceCode,
                            id: res.list[i].Id,
                            object: res.list[i]
                        });
                    }
                    setServiceOption(array)
                }
            })
            .catch((e) => {

            })
    }

    const onCloseModal = () => {
        props.isClose(!props.isShow);
    };

    const onCalculatePrice = (qty: any, cost?: any) => {
        var costValue = cost ? cost : watchAllFields.Cost
        var value = qty * costValue
        setValue('Price', value)
    }

    const handleForm = (requestBody: any) => {
        setLoading(true)
        WebService.postAPI({
            action: `SDInvoiceDetail/AddServiceProvidedtemsToInvoice`,
            body: {
                AccountId: user_info["AccountId"],
                CompanyId: user_info["CompanyId"],
                InvoiceNum: props.invoiceNum,
                Items: [
                    {
                        SaiServicesProvidedSetupId: requestBody.service,
                        Quantity: requestBody.Quantity
                    }
                ]
            }
        })
            .then((res) => {
                setLoading(false)
                props.isClose(!props.isShow, "SAVE");
                toast.success('Service Added Successfully')
            })
            .catch((e) => {
                setLoading(false)
            })
    }

    return (
        <>
            <Loader show={isLoading} />
            <Offcanvas
                show={props.isShow}
                onHide={() => onCloseModal()}
                placement={"end"}
                className="offcanvas-large"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>{'Add Service'}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="border-bottom px-0 information-main-view py-0">
                    <form onSubmit={handleSubmit(handleForm)}>
                        <div className="modal-body px-3 employee-mater-model">
                            <div className=" service-address">
                                <div className="service-location-form form-style">
                                    <div className="row mt-3 pb-5">
                                        <div className="col-6 form-group">
                                            <Label title="Category" showStar={true} />
                                            <Controller
                                                control={control}
                                                name="ItemCategory"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={categoryOption}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data)
                                                                getService(data.id)
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.ItemCategory && (
                                                <Label
                                                    title={"Please Select Item Category."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-6 form-group">
                                            <Label title="Service" showStar={true} />
                                            <Controller
                                                control={control}
                                                name="service"
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <SawinSelect
                                                        options={serviceOption}
                                                        onChange={(data: any) => {
                                                            {
                                                                field.onChange(data.id)
                                                                setValue('Quantity', '1')
                                                                setValue('Cost', data.object.Cost)
                                                                onCalculatePrice(1, data.object.Cost)
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                            {errors.service && (
                                                <Label
                                                    title={"Please Select Service."}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <Label title="Quantity" showStar={true} />
                                            <input className="form-control input" type="text" {...register(`Quantity`, { required: true })}
                                                onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)}
                                                onBlur={(e) => onCalculatePrice(e.target.value)} />
                                            {errors.ServiceCode && (
                                                <Label
                                                    title={"Please enter code"}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <Label title="Cost" showStar={true} />
                                            <input className="form-control input" type="text"  {...register(`Cost`, { required: true })}
                                                disabled={true}
                                                onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} onBlur={(e) => {
                                                    HelperService.formateUptoTwoDecimal(e)
                                                }} />
                                            {errors.Cost && (
                                                <Label
                                                    title={"Please enter cost"}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                        <div className="col-md-4 form-group">
                                            <Label title="Price" showStar={true} />
                                            <input className="form-control input" type="text"  {...register(`Price`, { required: true })}
                                                disabled={true}
                                                onKeyPress={(e) => HelperService.allowOnlyNumericValue(e)} />
                                            {errors.Price && (
                                                <Label
                                                    title={"Please enter price"}
                                                    modeError={true}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="offcanvas-footer position-absolute d-flex justify-content-center">
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
                                onClick={() => onCloseModal()}
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

export default AddServiceBillingDetails;