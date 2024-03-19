import React from "react";
import { useNavigate } from "react-router-dom";
import buttonicon from "./assets/button1.png";

const AddQuizButton: React.FC = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/add-question");
  };

  return (
    <button
      className="fixed bottom-4 right-[300px] bg-indigo-500 hover:bg-amber-500 transition duration-300 text-white hover:text-black shadow-[10px_10px_0_0_rgba(0,0,0,0.8)]"
      onClick={handleButtonClick}
    >
      <img src={buttonicon} alt="" className="w-[320px] h-[80px]"/>
      <p className="absolute bottom-[23px] left-[30px] font-silkscreen text-lg">Add Question</p>
      <p className="absolute bottom-[16px] right-[20px] font-silkscreen text-4xl">+</p>
    </button>
  );
};

export default AddQuizButton;
