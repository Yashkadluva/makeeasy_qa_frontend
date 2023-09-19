

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
        title: "Quote #",
    },
    {
        title: "Quote Name",
    },
    {
        title: "Quote Date",
        class: "text-center"
    },
    {
        title: "Phone",
        class: "text-end"
    },
    {
        title: "Quote Amount ($)",
        class: "text-end"
    },

];

const PendingQuotesDetail = (props: PropData) => {
    const navigate = useNavigate();
    const user_info = JSON.parse(localStorage.getItem("user_detail") || "{}");
    const [rows, setRows] = useState<GridRow[]>([]);
    const dispatch: Dispatch<any> = useDispatch();

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            let rows: GridRow[] = [];
            for (var i in props.data) {
                let columns: GridColumn[] = [];
                columns.push({
                    value: props.data[i].SDServiceMasterId && onServiceMaster(props.data[i]),
                });
                columns.push({ value: props.data[i].Id });
                columns.push({ value: props.data[i].QuoteName });
                columns.push({ value: props.data[i].QuoteDate && HelperService.getFormatedDate(props.data[i].QuoteDate) });
                columns.push({ value: props.data[i].Phone && HelperService.getFormattedContact(props.data[i].Phone) });
              
                columns.push({ value: props.data[i].Total && HelperService.getCurrencyFormatter(props.data[i].Total) });
              
                rows.push({ data: columns });
            }

            setRows(rows);
        } else {
            setRows([])
        }
    }, [props.data]);

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
            <>
                <div className="mt-2 detail-grid-div">
                    <Grid
                        headers={headers}
                        rows={rows}
                        ShowLoader={props.showLoader}
                        errorMessage={"No Pending Quote Found"}
                    />
                </div>
            </>
        </>
    )
}

export default PendingQuotesDetail;


