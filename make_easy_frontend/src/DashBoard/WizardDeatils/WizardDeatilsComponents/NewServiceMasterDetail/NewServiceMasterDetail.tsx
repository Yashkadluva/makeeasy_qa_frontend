import './NewServiceMasterDetail.scss';


import { useEffect, useState } from 'react';
import loader from "../../../../../assets/images/loader.gif";
import WebService from '../../../../../utility/WebService';
import { Col, Row } from 'react-bootstrap';
import { Label } from '../../../../../components/Label/Label';
import SawinSelect from '../../../../../components/Select/SawinSelect';
import { useForm, Controller } from "react-hook-form";
import SawinDatePicker from '../../../../../components/SawinDatePicker/SawinDatePicker';
import Button from "react-bootstrap/Button";
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
    SET_WORK_ORDER_ID, setDataInRedux, SEARCH_RESULT, SET_ACTIVE_TAB
} from "../../../../../action/CommonAction";
import { useNavigate } from 'react-router-dom';
import DescriptionModal from '../../../../../components/DescriptionModal/DescriptionModal';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Master # - Name",
    },
    {
        title: "Address",
    },
    {
        title: "Phone #",
        class: "text-end"
    },
    {
        title: "Email",
    },
];

const NewServiceMasterDetail = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [type, setType] = useState<any>("All");
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");

    useEffect(() => {
        if (props.data) {
            reset(props.data?.value)
            setDuration(props.data?.value?.Duration)
            setFromDate(props.data?.value?.StartDate)
            setToDate(props.data?.value?.EndDate)
            getCustomerInvoicesDetail();
        }
    }, [props.data]);

    console.log(props.data);

    const getCustomerInvoicesDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'CallPurchaseOrder',
            UserName: user_info["userName"],
            RefreshData: 'false',
            Filter: {
                ToDate:`${HelperService.getFormatedDateForSorting(toDate ? toDate : props.data?.value?.EndDate)} 0:0:0`,
                FromDate: `${HelperService.getFormatedDateForSorting(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration,
                CallPurchaseOrderType: type
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetNewServiceMasterCreatedData`,
            body: requestBody,
        })
            .then((res: any) => {
                setShowLoader(false);
                console.log(res)

                let rows: GridRow[] = [];
                for (var i in res.NewSMList) {
                    let columns: GridColumn[] = [];
                    columns.push({
                        value: res.NewSMList[i].SMId && onServiceMaster(res.NewSMList[i]),
                    });
                    columns.push({ value: res.NewSMList[i].Address });
                    columns.push({ value: res.NewSMList[i].Phone && HelperService.getFormattedContact(res.NewSMList[i].Phone) });
                    columns.push({ value: res.NewSMList[i].Email });
                    rows.push({ data: columns });
                }

                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };


    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.SMId}{" "}{value.SMName}
        </a>
    }


    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.SMId },
            })
        );
        navigate(`/service-master`);
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


    return (
        <>
            <div className="p-3">
                <Grid
                    headers={headers}
                    rows={rows}
                    ShowLoader={showLoader}
                    errorMessage={"No NewService Master Detail Found"}
                />
            </div>
        </>
    )
}

export default NewServiceMasterDetail;


