import './TopFiveCustomerDetail.scss';
import { useEffect, useState } from 'react';
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import DescriptionModal from '../../../../../components/DescriptionModal/DescriptionModal';
import deleteicon from "../../../../../assets/images/delete-icon.svg"
import WebService from '../../../../../utility/WebService';
import { toast } from 'react-toastify';
import DraggableModal from '../../../../../components/DraggableModal/DraggableModal';
import Button from "react-bootstrap/Button";
import { useForm,Controller } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { Label } from '../../../../../components/Label/Label';
import SawinSelect from '../../../../../components/Select/SawinSelect';
import SawinDatePicker from '../../../../../components/SawinDatePicker/SawinDatePicker';

interface PropData {
    data: any;
    showLoader: any;
};

const headers: GridHeader[] = [
    {
        title: "AR#",
    },
    {
        title: "Name",
    },
    {
        title: "Address",
    },
    {
        title: "Email",
    },
    {
        title: "Phone #",
        class: "text-end"
    },
    {
        title: "Actions",
        isFilter: false,
        isSorting: false,
        class: "freeze-column text-center",
        isFreeze: true,
        isNotAllowClick: true
    }

];

const ExceptionListDetail = (props: PropData) => {
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const [rows, setRows] = useState<GridRow[]>([]);
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [isShoWDeleteModal, setShowDeleteModal] = useState(false);
    const [deletedData, setDeletedData] = useState<any>({});
    const [showAlertModel, setAlertModel] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [list,setList] = useState<any[]>([])

    useEffect(() => {
        getExceptionList()
    }, [props.data]);

    const getExceptionList = () => {
        setShowLoader(true)
        WebService.getAPI({
            action: `SAIUserPreference/${user_info["AccountId"]}/${user_info["CompanyId"]}/${user_info["userID"]}/TOP_FIVE_CUSTOMERS_EXCEPTIONS`
        })
            .then((res: any) => {
                setShowLoader(false);
                let temp: any = JSON.parse(res?.value)
                console.log(temp.Data);
                let rows: GridRow[] = [];
                for (var i in temp.Data) {
                    let columns: GridColumn[] = [];
                    columns.push({ value: temp.Data[i].ARCustomerMasterId });
                    columns.push({ value: temp.Data[i].DisplayName });
                    columns.push({ value: temp.Data[i].Address1 });
                    columns.push({ value: temp.Data[i].Email });
                    columns.push({ value: temp.Data[i].PhoneNumber && HelperService.getFormattedContact(temp.Data[i].PhoneNumber) });
                    columns.push({ value: actionList(temp.Data[i]) })
                    rows.push({ data: columns });
                }
                setList(temp?.Data)
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })

    }

    const actionList = (value: any) => {
        return <div className="text-center action-btns">
            <a onClick={() => onDelete(value)} className="text-dark ms-2 font-18 cursor-pointer">
                <img
                    src={deleteicon}
                    height={25}
                /></a>
        </div >;
    };


    const onDelete = (data: any) => {
        setShowDeleteModal(true)
        var obj = {
            id: data.QBId,
         }
        setDeletedData(obj)
    };

    const onDeleteContract = () => {
        let temp:any = list.filter((item:any)=>{
            return item.QBId !== deletedData?.id
        })
        setShowDeleteModal(false);
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            key: 'TOP_FIVE_CUSTOMERS_EXCEPTIONS',
            UserName: user_info["userName"],
            value: JSON.stringify({ "Data": temp })
        }
        WebService.postAPI({
            action: `SAIUserPreference/`,
            body: requestBody
        })
            .then((res) => {
                toast.success('AR deleted from Exception List successfully.')
                getExceptionList()
            })
            .catch((e) => {
                if (e.response.data.ErrorDetails.message) {
                    setAlertModel(!showAlertModel)
                    setErrorMessage(e?.response?.data?.ErrorDetails?.message)
                }
            })
    };

    const DurationDataSource: any = [
        {
            value: 'Last 7 Days',
            id: '7 Days'
        },
        {
            value: 'Last 15 Days',
            id: '15 Days'
        },
        {
            value: 'Last 30 Days',
            id: '30 Days'
        },
        {
            value: 'Last 45 Days',
            id: '45 Days'
        },
        {
            value: 'Last 60 Days',
            id: '60 Days'
        },
        {
            value: 'Last 90 Days',
            id: '90 Days'
        },
        {
            value: 'Last 120 Days',
            id: '120 Days'
        },
        {
            value: 'Last 1 Year',
            id: '1 Year'
        },
        {
            value: 'Custom',
            id: 'Custom'
        }
    ];

    const getFilterLIst = () => {

    }


    return (
        <>
            <DraggableModal
                isOpen={isShoWDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Alert"
                type="DELETE_MODAL"
                width={600}
                delete={onDeleteContract}
                data={null}
            />

            <DraggableModal
                isOpen={showAlertModel}
                onClose={() => setAlertModel(false)}
                title="Alert"
                type="ALERT_MODEL"
                width={600}
                previousData={errorMessage}
            />
            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={() => setIsShowDescription(false)}
                data={descriptionData}
            />
            <>
            <form className="form-style p-2" onSubmit={handleSubmit(getFilterLIst)}>
                    <Row>
                        <Col md={3}>
                            <Label title='Search Field' />
                            <Controller
                                control={control}
                                name="Duration"
                                render={({ field }) => (
                                    <SawinSelect
                                        options={DurationDataSource}
                                        onChange={(data: any) => { field.onChange(data.id) }}
                                    />
                                )}
                            />

                        </Col>
                        <Col md={3}>
                            <Label title='Operator' showStar={true} />
                            <Controller
                                control={control}
                                name="StartDate"
                                render={({ field }) => (
                                    <SawinSelect
                                    options={DurationDataSource}
                                    onChange={(data: any) => { field.onChange(data.id) }}
                                />
                                )}
                            />

                        </Col>
                        <Col md={3}>
                            <Label title='Enter Text' showStar={true} />
                            <Controller
                                control={control}
                                name="EndDate"
                                render={({ field }) => (
                                    <input
                                    className="form-control input"
                                    type="text"
                                    {...register("SerialNo")}
                                  ></input>
                                )}
                            />

                        </Col>
                        <Col md={3} className="mt-1">
                            <div className="mt-4">
                                <Button
                                    variant="primary"
                                    className="btn-brand-solid me-3"
                                    type="submit" >
                                    Search
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </form>
                <div className="mt-2 detail-grid-div">
                    <Grid
                        headers={headers}
                        rows={rows}
                        ShowLoader={showLoader}
                        errorMessage={"No Part Found"}
                    />
                </div>
            </>
        </>
    )
}

export default ExceptionListDetail;





