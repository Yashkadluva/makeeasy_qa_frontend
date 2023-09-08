import "./Button.scss";

interface PropData {
  btnType?:any;
  isPrimary?: boolean;
  size?: string;
  label: string;
  b_disabled?: boolean;
  b_type?: string;
  onClick: any;
  buttonId?: any;
}

export const Button = (props: PropData) => {
  const mode = props.isPrimary == true ? "primary-button" : " ";
  return (
    <button
      id={props.buttonId ? props.buttonId : ''}
      type={props.btnType}
      disabled={props.b_disabled}
      className={
        props.b_type === "CANCEL"
          ? "cancel-button"
          : mode + " sawin-button " + "button-" + props.size
      }
      {...props}
    >
      {props.label}
    </button>
  );
};

Button.defaultProps = {
  primary: false,
  size: "medium",
  onClick: undefined,
  b_disabled: false,
  b_type: "SAVE",
  btnType: "submit"
};
