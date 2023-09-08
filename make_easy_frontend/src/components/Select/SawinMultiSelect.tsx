import "./SawinSelect.scss";
import React, { useState, Fragment, useEffect } from "react";
import useClickOutside from "../../hooks/useClickOutside";

import { ChevronDown, Check } from "react-bootstrap-icons";

interface PropData {
  placeholder?: string;
  options: Options[];
  selected: any[];
  onChange: any;
  isDisable?: boolean;
  isHideArrow?: boolean;
  sakey?: string;
  selectLimit?: number
}

export interface Options {
  id: any;
  IconPath?: string;
  value: string;
  code: string;
  object?: any;
  isSelected?: boolean;
  isDisabled?: boolean;
}

const SawinMultiSelect = (props: PropData) => {
  const [options, setOptions] = useState<Options[]>(props.options);
  const [isFocus, setIsFocus] = useState(false);
  const [isOpenTop, setIsOpenTop] = useState(false);
  const [userInput, setUserInput] = useState(props.placeholder);

  useEffect(() => {
    let selectedValue = "";
    let tempOption: Options[] = [];
    props.options.map((option) => {
      var obj = { ...option };
      props.selected.map((select) => {
        if (option.id === select) {
          obj.isDisabled = false;
          if (!selectedValue) {
            selectedValue = option.value;
          }
          obj.isSelected = true;
        }
      });
      let limit: any = props.selectLimit ? props.selectLimit : 3
      if (!obj.isSelected && props.selected.length >= limit) {
        obj.isDisabled = true;
      }

      tempOption.push(obj);
    });

    if (selectedValue) {
      setUserInput(
        selectedValue +
        (props.selected.length > 1
          ? " ...(" + props.selected.length + ")"
          : "")
      );
    } else {
      setUserInput(props.placeholder);
    }

    setOptions(tempOption);

    // alert("Component " + props.options.length)
  }, [props.selected, props.options]);

  let domNode = useClickOutside(() => {
    setIsFocus(false);
  }, this);

  const checkPossition = () => {
    var topHeight = domNode.current.getBoundingClientRect().y;
    var bottomHeight =
      window.innerHeight - domNode.current.getBoundingClientRect().y;
    if (bottomHeight > 300 || topHeight <= 280) {
      setIsOpenTop(false);
    } else {
      setIsOpenTop(true);
    }
  };

  let optionsListComponent;

  if (options.length) {
    optionsListComponent = (
      <ul className={"options " + (isOpenTop ? "open-top" : "")}>
        {options.map((suggestion: Options, index) => {
          return (
            <li
              className={
                (suggestion.isSelected ? "option-active" : "") +
                " " +
                (suggestion.isDisabled ? "option-disabled" : "")
              }
              key={index}
              onMouseDown={() => onSelect(suggestion)}
            >
              {suggestion.IconPath ? (
                <div className="row-icon-view">
                  <img src={suggestion.IconPath} className="row-icons" />
                  <div className="option">{suggestion.value}</div>
                  {suggestion.isSelected ? (
                    <Check
                      className="option-active"
                      style={{ width: 40, height: 30 }}
                    />
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div className="row-icon-view">
                  {suggestion.code && <div className="option pe-1" style={{width: "62px"}}> {suggestion.code} </div>}
                  <div className="option ">{suggestion.value}</div>
                  {suggestion.isSelected ? (
                    <Check
                      className="option-active"
                      style={{ width: 40, height: 30 }}
                    />
                  ) : (
                    ""
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  } else {
    optionsListComponent = (
      <div className="no-options">
        <em>No data found</em>
      </div>
    );
  }

  const onSelect = (e: Options) => {
    let selectedValue: string = "";
    let tempSelectedOption: Options[] = [];
    var count = 0;
    options.map((option: Options) => {
      if (option.id == e.id) {
        if (!option.isSelected) {
          tempSelectedOption.push(option);
          if (!selectedValue) {
            selectedValue = option.value;
          }
          count++;
        }
      } else {
        if (option.isSelected) {
          tempSelectedOption.push(option);
          if (!selectedValue) {
            selectedValue = option.value;
          }
          count++;
        }
      }
    });

    if (selectedValue) {
      setUserInput(selectedValue + (count > 1 ? " ...(" + count + ")" : ""));
    } else {
      setUserInput(props.placeholder);
    }

    setOptions(
      options.map((option: Options) =>
        option.id === e.id
          ? {
            ...option,
            isSelected: !option.isSelected,
          }
          : {
            ...option,
            isDisabled: !option.isSelected && count >= (props.selectLimit ? props.selectLimit : 3) ? true : false,
          }
      )
    );

    if (props.onChange) {
      props.onChange(tempSelectedOption);
    }
  };

  return (
    <>
      <Fragment>
        <div
          ref={domNode}
          id={props.sakey ? props.sakey : "mutliSelectId"}
          key={props.sakey}
          className={
            props.isDisable === true ? "disabled-select" : "select w-100"
          }
        >
          <div
            className={"form-style " + (isFocus ? "zindex" : "")}
            tabIndex={0}
            onMouseDown={() => {
              if (!props.isDisable) {
                if (!isFocus) {
                  checkPossition();
                  setIsFocus(true);
                }
              }
            }}
          >
            <div
              className="form-control select-div text-truncate"
              onMouseDown={() => {
                if (isFocus) {
                  setIsFocus(false);
                }
              }}
            >
              <span>{userInput}</span>
              {!props.isHideArrow || isFocus ? (
                <div className="right-icon">
                  <ChevronDown id="img_downarrow" className="downarrow" />
                </div>
              ) : (
                ""
              )}
            </div>
            {isFocus ? optionsListComponent : ""}
          </div>
        </div>
      </Fragment>
    </>
  );
};

SawinMultiSelect.defaultProps = {
  placeholder: "Select",
  selected: "",
  isSearchable: false,
  sakey: new Date().getTime(),
  type: "ARROW",
  isHideArrow: false,
  options: [],
};

export default SawinMultiSelect;
