import './PendingMaintanenceScheduleDetail.scss';
import { useEffect, useRef, useState } from 'react';
import WebService from '../../../../../utility/WebService';
import { useForm, Controller } from "react-hook-form";
import HelperService from '../../../../../utility/HelperService';
import Grid, { GridColumn, GridHeader, GridRow } from '../../../../../components/Grid/Grid';
import { Dispatch } from "redux";
import { useDispatch } from "react-redux";
import {
     setDataInRedux, SEARCH_RESULT, SET_ACTIVE_TAB
} from "../../../../../action/CommonAction";
import { useNavigate } from 'react-router-dom';
import DescriptionModal from '../../../../../components/DescriptionModal/DescriptionModal';

interface PropData {
    data: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Master",
    },
    {
        title: "Address",
    },
    {
        title: "Phone #",
        class: "text-end"
    },
    {
        title: "Contract #",
    },
    {
        title: "Maintenance Due Date",
        class: "text-center"
    },
    {
        title: "Notification Sent",
        class: "text-center"
    },
];



const PendingMaintanenceScheduleDetail = (props: PropData) => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors }, control, reset, setValue, } = useForm();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [showLoader, setShowLoader] = useState(false);
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [duration, setDuration] = useState<any>("")
    const [fromDate, setFromDate] = useState<any>("")
    const [toDate, setToDate] = useState<any>("")
    const [selectedTechnician, setSelectedTechnician] = useState<any>("All")
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");
    const allTechnician = useRef<any[]>([]);
    const [technicianOption, setTechnicianOption] = useState<any[]>([]);
    const [retunCallData, setretunCallData] = useState<any[]>([])

    useEffect(() => {
        if (props.data) {
            getPurchaseOrderDetail();
        }
    }, [props.data]);

    const getPurchaseOrderDetail = () => {
        let requestBody = {
            AccountId: user_info["AccountId"],
            CompanyId: user_info["CompanyId"],
            userID: user_info["userID"],
            WidgetCode: 'ReturnCalls',
            UserName: user_info["userName"],
            RefreshData: 'true',
            Filter: {
                ToDate: `${HelperService.getFormatedDateForDetail(toDate ? toDate : props.data?.value?.EndDate)} 23:59:59`,
                FromDate: `${HelperService.getFormatedDateForDetail(fromDate ? fromDate : props.data?.value?.StartDate)} 0:0:0`,
                Duration: duration ? duration : props.data?.value?.Duration,
            }
        }
        setShowLoader(true)
        WebService.postAPI({
            action: `SaiUserWidget/GetPendingMaintenanceScheduleDetail`,
            body: props.data,
        })
            .then((res: any) => {
                setShowLoader(false);
                let techData: any = [];
                let rows: GridRow[] = [];
                setretunCallData(res.Data)
                if (props.data) {
                    for (var i in res.Data) {
                        let columns: GridColumn[] = [];
                        columns.push({ value: res.Data[i].ServiceMasterId && onServiceMaster(res.Data[i]), });
                        columns.push({ value: res.Data[i].Address});
                        columns.push({ value: res.Data[i].Phone && HelperService.getFormattedContact(res.Data[i].Phone) });
                        columns.push({ value:res.Data[i].ContractNum });
                        columns.push({ value: res.Data[i].ScheduleDate && HelperService.getFormatedDate(res.Data[i].ScheduleDate) });
                        columns.push({ value: res.Data[i].NotificationStatus});
                        rows.push({ data: columns });
                    }
                };
                setRows(rows);
            })
            .catch((e) => {
                setShowLoader(false)
            })
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.ServiceMasterId}{" "}{value.SMName}
        </a>
    };

    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.ServiceMasterId },
            })
        );
        navigate(`/service-master`);

    };

    return (
        <>
            <DescriptionModal
                isShow={isShowDescription}
                title="Description"
                isClose={() => setIsShowDescription(false)}
                data={descriptionData}
            />

            <>
        
                    <div className="mt-2 p-2">
                        <Grid
                            headers={headers}
                            rows={rows}
                            ShowLoader={showLoader}
                            errorMessage={"No Return Calls Detail Found"}
                        />
                    </div>
            </>



        </>
    )
}

export default PendingMaintanenceScheduleDetail;