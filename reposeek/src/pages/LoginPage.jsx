import Login from '../components/login';
import React from 'react';
import { AuroraBackground } from "../components/aurora-bg";

const LoginPage = () => {
    return (
      <div>
        <AuroraBackground className="absolute inset-0 z-0" />
        <div className="relative z-10 flex  min-h-screen justify-center ">
          <Login />
        </div>
      </div>
    );
}

export default LoginPage;