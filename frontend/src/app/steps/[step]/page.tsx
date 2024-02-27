"use client";

import Step1 from "./step1";
import Step2 from "./step2";
import Step3 from "./step3";

const DynamicStepComponent = ({ params }: { params: { step: string } }) => {
  switch (params.step) {
    case "1":
      return <Step1 />;
    case "2":
      return <Step2 />;
    case "3":
      return <Step3 />;
    default:
      return null;
  }
};

export default DynamicStepComponent;
