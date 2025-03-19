import React from "react";
import { socialData } from "../../Data/Content";

const Social = () => {
  return (
    <div className="w-full bg-white flex justify-between items-center px-[5vw] h-[10vh]">
      {socialData.map((platform, index) => (
        <p key={index}>{platform}</p>
      ))}
    </div>
  );
};

export default Social;
