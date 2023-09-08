import React, { useEffect, useState } from "react";
import { Button } from "../../../components/Button/Button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch } from "redux";

import "./Login.scss";
import { Label } from "../../../components/Label/Label";
import Loader from "../../../components/Loader/Loader";
import { RootState } from "../../../config/Store";
import { UserState } from "../../../reducer/AuthReducer";
import AuthHeader from "../../../components/AuthHeader/AuthHeader";
import DraggableModal from "../../../components/DraggableModal/DraggableModal";
import WebService from "../../../utility/WebService";
import { toast } from "react-toastify";
import {
  USER_LOGIN_FAIL,
  USER_LOGIN_SUCCESS,
  setDataInRedux,
  PAGE_ACTIVE,
} from "../../../action/CommonAction";
import Form from "react-bootstrap/Form";
import useDarkMode from "use-dark-mode";

const Login = () => {
  const darkMode = useDarkMode();
  const { register, handleSubmit, formState: { errors }, } = useForm();
  let history = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const userLogin = useSelector<RootState, UserState>(
    (state: RootState) => state.userLogin
  );
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    data.grant_type = "password";
    setLoading(true)
    WebService.getAccesstoken({
      action: "Token",
      body: data,
      id: "login",
    })
      .then((res: any) => {
        setLoading(false)
        dispatch({
          type: USER_LOGIN_SUCCESS,
          payload: { access_token: res.access_token },
        });
        localStorage.setItem("user_detail", JSON.stringify(res));
        dispatch(setDataInRedux({ type: PAGE_ACTIVE, value: "Dashboard" }));
        const channel = new BroadcastChannel("SAWIN_LOGIN_SUCCESS");
        channel.postMessage('LOGIN');
        history("/dashboard");
      })
      .catch((e) => {
        setLoading(false)
        dispatch({ type: USER_LOGIN_FAIL, payload: { error: e } });
        toast.error("The user name or password is incorrect.");

      });
  };

  useEffect(() => {
    if (darkMode.value) {
      darkMode.toggle();
    }
  });

  return (
    <>
      <Loader
        show={isLoading}
      />
      <AuthHeader />
      <DraggableModal
        isOpen={forgotModal}
        onClose={() => setForgotModal(false)}
        title="Forgot Password"
        type="FORGOT_PASSWORD"
        width={600}
        data={null}
      />
      <div className="d-flex justify-content-center login">
        <div className="main">
          <span className="heading">Secure Login</span>
          <form onSubmit={handleSubmit(onSubmit)} className="form-style">
            <div className="loginContainer form-style">
              <div className="form-group">
                <Label title="Email Address" />
                <input
                  className="form-control"
                  {...register("username", {
                    required: true,
                    pattern: /^\S+@\S+$/i,
                  })}
                />
                {errors.username && (
                  <Label
                    title={"Please enter email address."}
                    modeError={true}
                  />
                )}
              </div>
              <div className="form-group">
                <Label title="Password" />
                <input
                  className="form-control"
                  type={"password"}
                  {...register("password", { required: true })}
                />
                {errors.password && (
                  <Label title={"Please enter password."} modeError={true} />
                )}
              </div>
              <div className="col-12 d-flex justify-content-between mt-3">
                <div>
                  <Form.Group controlId="rememberMe">
                    <Form.Check type="checkbox" label="Remember Me" />
                  </Form.Group>
                </div>
                <div>
                  <span
                    className="signUpText"
                    onClick={() => setForgotModal(!forgotModal)}
                  >
                    Reset Password
                  </span>
                </div>
              </div>
              <div className="mt-3 row col-12">
                <div className="col-5">
                  <Button
                    buttonId="login"
                    size={"large"}
                    label="Login"
                    b_type="LOGIN"
                  />
                </div>
                <div className="col-6 align-self-center">
                  <button
                    className="b1-login"
                    onClick={() => history(`/signup`)}
                  >
                    <span className="createAccount">Create Account</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 mb-3">
                <span>
                  <img
                    src={require("../../../assets/images/lock.png")}
                    alt="lock"
                    className="theme-icon-color"
                  />
                  <span className="account">
                    Your information is protected with 128-bit SSL encryption
                  </span>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
