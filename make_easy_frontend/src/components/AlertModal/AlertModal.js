import { Button } from "../Button/Button";

const AlertModal = (props) => {
  return (
    <>
      <div className="p-3  text-dark aler-msg-body">
        <div className="ml-3" dangerouslySetInnerHTML={{__html: props.message}}></div>
      </div>
      <div className="m-2 pb-3 text-center">
        <Button
          size="large"
          onClick={() => props.close()}
          label="OK"
        >
        </Button>
      </div>
    </>
  );
};
export default AlertModal;
