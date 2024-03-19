import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LockIcon from './assets/lockoutline.png';

interface QuizComponentProps {
  quiz: {
    Id: number;
    Name: string;
    Description: string;
    IsPrivate: boolean;
    MainCategory: {
      Id: number;
      Name: string;
    };
    Length: number;
    Owner: string;
  };
  defaultExpanded?: boolean;
  score?: number | null;
}

const QuizComponent: React.FC<QuizComponentProps> = ({ quiz, score = null }) => {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [flipAnimation, setFlipAnimation] = useState<boolean>(false);
  const [first, setFirst] = useState<boolean>(false); 
  const navigate = useNavigate();

  const handleQuizClick = async () => {
    const suffix = quiz.IsPrivate ? "-l" : "-u";
    navigate(`/quiz/${quiz.Id}${suffix}`, { state: { quiz } });
  };

  const goToOwner = () => {
    window.location.href = `/user/${quiz.Owner}`;
  };

  const goToLeaderboard = () => {
    window.location.href = `/quiz/leaderboard/${quiz.Id}`;
  };

  const changeSide = () => {
    setFlipAnimation(true);
    setFirst(true);
  
    setTimeout(() => {
      setExpanded(!expanded);
    }, 500);
  };

  useEffect(() => {
    if (flipAnimation) {
      const timeoutId = setTimeout(() => {
        setFlipAnimation(false);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [flipAnimation]);

  const renderSecondView = () => (
    <div className={`m-1 flex flex-col text-center h-[375px] w-[550px] text-black bg-white p-4 mb-4 border-2 border-black shadow-[13px_10px_0_3px_rgba(0,0,0,0.8)] select-none ${flipAnimation && 'animate-rotate-y'}`}>
      <div className="flex flex-col flex-grow border-black border-8 relative">
        <p className="font-silkscreen text-xl font-extrabold mb-2 mt-4">{quiz.Name.toUpperCase()}</p>
        <p className="italic font-semibold mb-4" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2" }}>{quiz.Description}</p>
        <div className="flex flex-col font-semibold">
          <p className="mb-1">Category: {quiz.MainCategory.Name}</p>
          <p className="mb-2">Questions: {quiz.Length}</p>
          <div className="flex justify-center">
            <p className="mb-2">Created by:</p>
            <p className="mb-2 hover:cursor-pointer underline" onClick={goToOwner}>{quiz.Owner}</p>
          </div>
        </div>
        {score !== null && (
          <p className="mb-2 text-indigo-500 font-semibold">
            {score === 0 ? "User didn't score any points :(" : `User scored ${score} ${score === 1 ? 'point!' : 'points!'} `}
          </p>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          className="w-full mt-2 px-6 py-2 font-silkscreen text-white bg-indigo-500 hover:bg-indigo-300 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] relative"
          onClick={goToLeaderboard}
        >
          {quiz.IsPrivate && (
            <div className="absolute h-[25px] w-[25px] right-3 top-[7px]">
              <img alt="" src={LockIcon}/>
            </div>
          )}
          See Leaderboard
        </button>
        <button
          onClick={changeSide}
          className="w-[15%] mt-2 px-2 py-2 font-silkscreen text-sm text-white bg-indigo-500 hover:bg-indigo-300 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]"
        >
          Flip
        </button>
      </div>
    </div>
  );

  const renderFirstView = () => (
    <div className={`m-1 flex flex-col text-center h-[375px] w-[550px] text-black bg-white p-4 mb-4 border-2 border-black shadow-[13px_10px_0_3px_rgba(0,0,0,0.8)] select-none ${first && flipAnimation && 'animate-rotate-y'}`}>
      <div className="flex flex-col flex-grow border-black border-8 relative">
        <p className="font-silkscreen text-xl font-extrabold mb-2 mt-4">{quiz.Name.toUpperCase()}</p>
        <p className="italic font-semibold mb-4" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2" }}>{quiz.Description}</p>
        <div className="flex flex-col font-semibold">
          <p className="mb-1">Category: {quiz.MainCategory.Name}</p>
          <p className="mb-2">Questions: {quiz.Length}</p>
          <div className="flex justify-center">
            <p className="mb-2">Created by:</p>
            <p className="mb-2 hover:cursor-pointer underline" onClick={goToOwner}>{quiz.Owner}</p>
          </div>
        </div>
        {score !== null && (
          <p className="mb-2 text-indigo-500 font-semibold">
            {score === 0 ? "User didn't score any points :(" : `User scored ${score} ${score === 1 ? 'point!' : 'points!'} `}
          </p>
        )}
      </div>
      <div className="flex space-x-4">
        <button
          className="w-full mt-2 px-6 py-2 font-silkscreen bg-amber-500 hover:bg-amber-300 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] relative"
          onClick={handleQuizClick}
        >
          {quiz.IsPrivate && (
            <div className="absolute h-[25px] w-[25px] right-3 top-[7px]">
              <img alt="" src={LockIcon}/>
            </div>
          )}
          Start Quiz
        </button>
        <button
          onClick={changeSide}
          className="w-[15%] mt-2 px-2 py-2 text-sm font-silkscreen bg-amber-500 hover:bg-amber-300 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]"
        >
          Flip
        </button>
      </div>
    </div>
  );

  return expanded ? renderFirstView() : renderSecondView();
};

export default QuizComponent;