"use client";

import Step1 from "./step1";
import Step2 from "./step2";

const DynamicStepComponent = ({ params }: { params: { step: string } }) => {
  switch (params.step) {
    case "1":
      return <Step1 />;
    case "2":
      return <Step2 />;
    default:
      return null;
  }
};

export default DynamicStepComponent;
