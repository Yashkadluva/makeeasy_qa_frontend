import "./SawinSelect.scss";
import { useState, Fragment, useEffect } from "react";
import { Options } from "./SawinSelect";
import useClickOutside from "../../hooks/useClickOutside";

import {
  CaretRightFill,
  CaretDownFill,
  ChevronDown,
} from "react-bootstrap-icons";

interface PropData {
  placeholder?: string;
  options: ExpandOption[];
  selected: any;
  onChange: any;
  isDisable?:boolean;
}

export interface ExpandOption {
  isView?: boolean;
  value: string;
  values: Options[];
}

const ExpandableSelect = (props: PropData) => {
  const [options, setOptions] = useState(props.options);
  const [selectedOption, setSelectedOption] = useState(props.selected);
  const [isFocus, setIsFocus] = useState(false);
  let index = -1;
  const [userInput, setUserInput] = useState(props.placeholder);
  const [selectedIndex, setSelectedIndex] = useState(index);

  useEffect(() => {
    setOptions(props.options);
  }, [props.options]);

  useEffect(() => {
    setSelectedOption(props.selected);
    if (props.selected == "resetsawin") {
      setUserInput(props.placeholder);
    } else {
      options.forEach((exOption: ExpandOption) => {
        exOption.values.forEach((option: Options) => {
          if (option.id == props.selected) {
            setUserInput(option.value);
          }
        });
      });
    }
  }, [props.selected]);

  let domNode = useClickOutside(() => {
    setIsFocus(false);
  }, this);

  let optionsListComponent;

  if (options.length) {
    optionsListComponent = (
      <ul className="expand-option">
        {options.map((suggestion: ExpandOption, i) => {
          return (
            <li key={"expandable_" + i}>
              {suggestion.isView ? (
                <CaretDownFill
                  className="expandIcon"
                  onClick={() => {
                    onclickArrow(suggestion);
                  }}
                />
              ) : (
                <CaretRightFill
                  className="expandIcon"
                  onClick={() => {
                    onclickArrow(suggestion);
                  }}
                />
              )}
              {suggestion.value}
              {suggestion.isView ? (
                <ul className="primary ps-2 ms-1">
                  {suggestion.values.map((option: Options, index) => {
                    let className = "";
                    if (index === selectedIndex) {
                      className = "option-active";
                    }

                    return (
                      <li
                        className={className}
                        key={index}
                        onMouseDown={() => onSelect(option)}
                      >
                        <div className="d-flex option options-wrap">
                          <div className=" code-div"></div>
                          <div className="col">{option.value}</div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                ""
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

  const onclickArrow = (e: ExpandOption) => {
    setOptions(
      options.map((option: ExpandOption) =>
        option.value === e.value
          ? { ...option, isView: !option.isView }
          : { ...option, isView: false }
      )
    );
  };

  const onSelect = (e: Options) => {
    setIsFocus(false);
    setSelectedOption(e.id);
    setSelectedIndex(index);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  const handleKey = (e: any) => {
    if (e.keyCode === 40) {
      if (selectedIndex < options.length - 1)
        setSelectedIndex(selectedIndex + 1);
    } else if (e.keyCode === 38) {
      if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
    } else if (e.keyCode === 13) {
      //   options.map((value: Options, i: number) => {
      //     if (selectedIndex === i) {
      //       onSelect(value);
      //     }
      //   });
    }
  };

  return (
    <>
      <Fragment>
        <div ref={domNode}  id="expandId"
          className={
            props.isDisable === true ? "disabled-select" : "row select"
          }
        >
          <div
            className={"form-style " + (isFocus ? "zindex" : "")}
            onKeyDown={(e) => {
              handleKey(e);
            }}
            tabIndex={0}
            onMouseDown={() => {
              if (!isFocus && !props.isDisable) {
                 setIsFocus(true);
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
              {userInput}
              <div className="right-icon">
                <ChevronDown id="img_downarrow" className="downarrow" />
              </div>
            </div>
            {isFocus ? optionsListComponent : ""}
          </div>
        </div>
      </Fragment>
    </>
  );
};

ExpandableSelect.defaultProps = {
  placeholder: "Select",
  selected: "",
  isView: false,
};

export default ExpandableSelect;
