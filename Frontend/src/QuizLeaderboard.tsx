import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import customFetch from "./CustomFetch";
import Sidebar from "./Sidebar";
import repeatable1 from "./assets/maybe.png";
import crown from "./assets/leaderboard.png";

interface Ranking {
  user: User;
  score: number;
}

interface User {
  id: number;
  username: string;
}

interface QuizLeaderboardData {
  rankings: Ranking[];
  quizName: string;
  pages: number;
  currentPage: number;
}

const QuizLeaderboard: React.FC = () => {
  const [responseData, setResponseData] = useState<QuizLeaderboardData | null>(null);
  const [currPage, setCurrPage] = useState<number>(0);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const { id } = useParams<{ id: string }>();

  const fetchData = async () => {
    try {
      const response = await customFetch(
        `https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Quiz/leaderboard/${id}/${currPage}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        const data = await response.json();
        setResponseData(data);
        console.log(JSON.stringify(data, null, 2));
      } else if (response.status === 400) {
        const data = await response.text();
        console.log("Error 400:", data);
        data === "private" ? setIsPrivate(true) : setIsPrivate(false);
      } else {
        console.log("Unhandled status code:", response.status);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currPage]);

  const goToProfile = (name: string) => {
    window.location.href = `/user/${name}`;
  };

  const goToQuiz = () => {
    window.location.href = `/quiz/${id}-l`;
  };

  const loadNextPage = () => {
    setCurrPage(currPage + 1);
  };

  const loadPrevPage = () => {
    setCurrPage(currPage - 1);
  };

  return (
    <div className="w-full bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate overflow-x-hidden">
      <div
        style={{
          backgroundImage: `url(${repeatable1})`,
          backgroundSize: "600px 600px",
          backgroundPosition: "top right",
          backgroundRepeat: "repeat",
        }}
        className="flex min-h-screen h-full"
      >
        <div className="fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        <div className="h-full w-[380px]" />

        <div className="w-full h-full flex justify-center">
        {isPrivate ? (
            <div className="text-center flex flex-wrap p-8 w-full min-h-screen h-full justify-center items-center">
              <div className="flex flex-col w-[80%] h-full items-center justify-center bg-amber-500 p-4 border-4 border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex flex-col w-full h-full items-center justify-center bg-indigo-500 p-4 border-4 border-black">
                  <p className="text-3xl w-full font-bold font-silkscreen text-white">This quiz is private if you want to see its leaderboard you will have to play it first.</p>
                  <button className="font-silkscreen bg-white text-black hover:bg-gray-300 transition duration-300 mt-4 px-4 py-2 border-4 border-amber-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={goToQuiz}>Play Quiz</button>
                </div>
              </div>
            </div>
          ) : (
          <div className="bg-indigo-500 w-[70%] my-8 border-8 border-black shadow-[20px_13px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
            <div className="bg-indigo-500 border-[8px] border-black my-10 px-4 pb-4 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
              <img
                src={crown}
                alt="crown"
                className="h-[100px] hidden lg2:block"
              />
              <div className="w-[500px]">
                <p className="text-3xl mx-8 font-bold font-silkscreen mt-4 text-amber-300 select-none text-center" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2" }}>
                  Leaderboard for {responseData?.quizName}
                </p>
              </div>
              
              <img
                src={crown}
                alt="crown"
                className="h-[100px] hidden lg2:block"
              />
            </div>
            {responseData && responseData.rankings && (
              <div className="flex flex-col w-full h-full items-center justify-center">
                {responseData.pages > 1 && (
                  <div className="w-max h-[80px] mb-6 bg-indigo-500 flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {responseData.currentPage > 0 && (
                      <button
                        onClick={loadPrevPage}
                        className="p-[2px] text-2xl bg-slate-500 mx-2 font-silkscreen border-2 border-indigo-300 text-indigo-300"
                      >
                        {"<"}
                      </button>
                    )}
                    <p className="font-silkscreen text-2xl text-white px-4">
                      Page: {currPage + 1}
                    </p>
                    {responseData.currentPage < responseData.pages - 1 && (
                      <button
                        onClick={loadNextPage}
                        className="p-[2px] text-2xl bg-slate-500 mx-2 font-silkscreen border-2 border-indigo-300 text-indigo-300"
                      >
                        {">"}
                      </button>
                    )}
                  </div>
                )}
                <ul className="gap-6 w-[90%] flex flex-col items-center mb-[60px] font-silkscreen bg-slate-500 py-[40px] border-[6px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                  {responseData.rankings.map((ranking, index) => (
                    <li
                      key={index}
                      className={`p-6 w-[90%] border-4
                      ${
                          index === 0 && currPage === 0
                          ? 'border-amber-500 bg-amber-200 mb-8 shadow-[0_0_40px_10px_rgba(245,158,11,0.5)]'
                          : index === 1 && currPage === 0
                          ? 'border-purple-500 bg-purple-200 mb-8 shadow-[0_0_40px_10px_rgba(168,85,247,0.5)]'
                          : index === 2 && currPage === 0
                          ? 'border-indigo-500 bg-indigo-200 mb-8 shadow-[0_0_40px_10px_rgba(99,102,241,0.5)]'
                          : 'bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <div className="flex flex-row">
                        <div
                          className={`flex items-center justify-center border-4 mr-8 p-2 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                          ${
                                index === 0 && currPage === 0
                              ? 'border-amber-500 text-white bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate-fast'
                              : index === 1 && currPage === 0
                              ? 'border-purple-500 bg-purple-200'
                              : index === 2 && currPage === 0
                              ? 'border-indigo-500 bg-indigo-200'
                              : 'bg-slate-300 border-black'
                          }`}
                        >
                          <p className="text-4xl">{index + 1}</p>
                        </div>
                        <div>
                          <p
                            className="text-lg font-semibold mb-2 text-indigo-600 hover:cursor-pointer hover:underline hover:text-indigo-300 transition duration-300"
                            onClick={() =>
                              goToProfile(ranking.user.username)
                            }
                          >{`${ranking.user.username.toUpperCase()}`}</p>
                          <p className="text-gray-700">{`Total Points Scored: ${ranking.score}`}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizLeaderboard;