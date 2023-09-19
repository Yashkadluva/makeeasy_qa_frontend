import './PendingQuoteDetail.scss';
import { useEffect, useState } from 'react';
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
    showLoader: any;
};

const headers: GridHeader[] = [
    {
        title: "Service Master # - Name",
    },
    {
        title: "Recommended Date",
        class: "text-center"
    },
    {
        title: "Recommended By",
    },
    {
        title: "Description",
        class:"description-text"
    },
    {
        title: "Phone",
        class: "text-end"
    },

];


const PendingRecommendationsDetail = (props: PropData) => {
    const navigate = useNavigate();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();
    const [isShowDescription, setIsShowDescription] = useState(false);
    const [descriptionData, setDescriptionData] = useState("");


    useEffect(() => {
        if (props.data && props.data.length > 0) {
            let rows: GridRow[] = [];
            for (var i in props.data) {
                let columns: GridColumn[] = [];
                columns.push({
                    value: props.data[i].SDServiceMasterId && onServiceMaster(props.data[i]),
                });
                columns.push({ value: props.data[i].RecommendedDate && HelperService.getFormatedDate(props.data[i].RecommendedDate) });
                columns.push({ value: props.data[i].RecommendedBy });
                columns.push({ value: props.data[i].RecommendationText && showDescription(props.data[i].RecommendationText) });
                columns.push({ value: props.data[i].Phone && HelperService.getFormattedContact(props.data[i].Phone) });
                rows.push({ data: columns });
            }

            setRows(rows);
        } else {
            setRows([])
        }
    }, [props.data]);

    const showDescription = (e: any) => {
        if (e) {
            return (
                <a className="grid-hypper-link"
                    onClick={() => viewFullDescription(e)}>
                    {HelperService.removeHtml(e)}
                </a>
            );
        }
    };

    const viewFullDescription = (data: any) => {
        setDescriptionData(data);
        setIsShowDescription(true);
    };

    const onServiceMaster = (value: any) => {
        return <a className="grid-hypper-link" onClick={() => onNavaigteServiceMaster(value)}>
            {value.SDServiceMasterId}{" "}{value.SMName}
        </a>
    };

    const onNavaigteServiceMaster = (e: any) => {
        dispatch(setDataInRedux({ type: SET_ACTIVE_TAB, value: "Overview" }));

        dispatch(
            setDataInRedux({
                type: SEARCH_RESULT,
                value: { Id: e.SDServiceMasterId },
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
            <div className="mt-2 detail-grid-div">
                <Grid
                    headers={headers}
                    rows={rows}
                    ShowLoader={props.showLoader}
                    errorMessage={"No Pending Recommendation Found"}
                />
            </div>
        </>
    )
}

export default PendingRecommendationsDetail;


