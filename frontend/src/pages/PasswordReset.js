import React from "react";
import Userfront, { PasswordResetForm } from "@userfront/toolkit/react";

Userfront.init("demo1234");

const PasswordReset = () => {
    return (
      <div>
        <PasswordResetForm />
      </div>
    );
};

export default PasswordReset;