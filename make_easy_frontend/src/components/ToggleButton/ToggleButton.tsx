import React, { useEffect, useState } from "react";
import "./ToggleButton.scss";

interface PropData {
  label_id: any;
  title: any;
  onChange?: any;
  height?: any;
  isChecked?: any;
  isDisable?: any;
  onText?: any;
  offText?: any;
}

const ToggleButton = (props: PropData) => {
  const [toogleValue, setToggleValue] = useState(props.isChecked);

  useEffect(() => {
    setToggleValue(props.isChecked);
  }, [props.isChecked]);

  const ToggleSwitch = () => {
    if (props.onChange) {
      props.onChange(!toogleValue);
    }
  };


  return (
    <div className="">
      <div className="togglecontent-div">
        <label className="font-14"> {props.title} </label>
        <div
          className={
            props.isDisable == true
              ? "toggle-button-cover disable-toggle"
              : "toggle-button-cover"
          }
        >
          <div className="button-cover">
            <div
              className={props.height ? "button r chnage-height" : "button r"}
              id="button-1"
              onClick={() => ToggleSwitch()}
            >
              <input
                type="checkbox"
                checked={toogleValue}
                disabled={props.isDisable ? props.isDisable : false}
                className="checkbox"
                name={props.title + props.label_id}
                id={props.title + props.label_id}
              />
              <div className="knobs" data-off={props.offText} data-on={props.onText}></div>
              <div className={props.height ? "layer newlayer" : "layer"}></div>
              <label className="label" htmlFor={props.title + props.label_id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ToggleButton.defaultProps = {
  onText: "YES",
  offText: "NO",
};

export default ToggleButton;
