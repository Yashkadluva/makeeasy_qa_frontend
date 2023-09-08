import React, { useEffect, useState } from 'react';
import './TimePicker.scss';
import time from "../../assets/images/downarrow.svg";
import { Label } from '../../components/Label/Label';
const TimePicker = () => {

    const myFunction = (e: any) => {
        e.currentTarget.style.background = "yellow";
    };
    return (
        <>
            <div className="col-3 mt-5 row" >
                <Label title='Time Required' showStar={true} />
                <div className="" >
                    <input
                        onFocus={myFunction}
                        className="form-control" type="text"
                    />
                    <img src={time} className="image " />
                </div>
            </div>
        </>
    );

}

export default TimePicker;