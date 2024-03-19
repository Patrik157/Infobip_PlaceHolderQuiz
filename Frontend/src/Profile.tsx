import React, { useEffect, useState, useRef } from "react";
import customFetch from "./CustomFetch";
import { useParams } from 'react-router-dom';
import Sidebar from "./Sidebar";
import QuizCarousel from "./QuizCarousel";
import SendFriendRequest from "./SendFriendRequest";
import backimg from "./assets/maybe.png";

interface ProfileData {
    IsYou: boolean;
    IsFriend: boolean;
    SentFriendRequest: boolean;
    ReceivedFriendRequest: boolean;
    User: UserData;
    Friends: UserData[];
}

interface UserData {
    Id: number;
    Username: string;
}


interface QuizData {
    Id: number;
    Name: string;
    Description: string;
    MainCategory: MainCategoryData;
    Length: number;
    IsPrivate: boolean;
    Owner: string;
}

interface HistoryData {
    UserQuizScores: {
      Quiz: QuizData;
      Score: number;
    }[];
    Pages: number;
    CurrentPage: number;
}

interface OwnedData {
    OwnedQuizzes: QuizData[];
    Pages: number;
    CurrentPage: number;
}

interface MainCategoryData {
    Id: number;
    Name: string;
}

const Profile: React.FC = () => {
  const [responseData, setResponseData] = useState<ProfileData | null>(null);
  const [userHistory, setUserHistory] = useState<HistoryData | null>(null);
  const [userOwned, setUserOwned] = useState<OwnedData | null>(null);
  const [currentPageHistory, setCurrentPageHistory] = useState<number>(0);
  const [currentPageOwned, setCurrentPageOwned] = useState<number>(0);
  const { name } = useParams<{ name: string }>();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/profile/${name}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data: ProfileData = await response.json();
        setResponseData(data);
        console.log(JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (responseData) {
      fetchUserHistory();
      fetchUserOwned();
    }
  }, [responseData]);

  const fetchUserHistory = async (page: number = 0) => {
    try {
      const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/history/${responseData?.User.Id}/${page}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: HistoryData = await response.json();

      setUserHistory((prevData) => ({
        UserQuizScores: [...(prevData?.UserQuizScores || []), ...(data.UserQuizScores || [])],
        Pages: data.Pages,
        CurrentPage: data.CurrentPage,
      }));
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  

  const fetchUserOwned = async (page: number = 0) => {
    try {
      const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/owned/${responseData?.User.Id}/${page}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data: OwnedData = await response.json();

      setUserOwned((prevData) => ({
        OwnedQuizzes: [...(prevData?.OwnedQuizzes || []), ...(data.OwnedQuizzes || [])],
        Pages: data.Pages,
        CurrentPage: data.CurrentPage,
      }));
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLoadMoreHistory = () => {
    const nextPage = currentPageHistory + 1;
    fetchUserHistory(nextPage);
    setCurrentPageHistory(nextPage);
  };

  const handleLoadMoreOwned = () => {
    const nextPage = currentPageOwned + 1;
    fetchUserOwned(nextPage);
    setCurrentPageOwned(nextPage);
  };

  const goToProfile = (name:string) => {
    window.location.href = `/user/${name}`;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate">
      <div className="min-h-screen h-full flex w-screen" style={{
        backgroundImage: `url(${backimg})`,
        backgroundSize: '600px 600px',
        backgroundPosition: 'top right',
        backgroundRepeat: 'repeat',
      }}>
        <div className="fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        <div className="h-full w-[440px]"/>
        <div ref={divRef} className="flex flex-col items-center p-4 w-full ml-2">
          {responseData && (
            <div className="text-center flex flex-col items-center">
              <div className="bg-indigo-700 border-[8px] border-black mt-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-6xl font-bold font-silkscreen border-[6px] border-indigo-300 p-6 text-white select-none">{responseData.User.Username.toUpperCase()}</p>
              </div>
              {(!responseData.IsYou && !responseData.IsFriend && !responseData.ReceivedFriendRequest && !responseData.SentFriendRequest) ? 
              (
                <div className="my-10">
                  <SendFriendRequest friendData={responseData.User}/>
                </div>
              ) 
              :
              (
                <div className="mb-[60px]"/>
              )}

            </div>
          )}

          {responseData?.Friends && (
              <div className="w-max flex flex-col p-4 bg-indigo-500 relative border-[6px] border-black drop-shadow-[15px_15px_0_rgba(0,0,0,1)]"  style={{width:  divRef.current ? divRef.current.offsetWidth - 100 : ''}}>
                <p className="text-3xl position absolute top-[-40px] left-[-40px] font-bold mb-4 font-silkscreen bg-gray-200 p-2 border-8 border-black text-center w-max px-16 py-4 rounded-md">Friends</p>
                <div className="flex w-full flex-wrap h-max mt-[40px]">
                  {responseData.Friends.map((friend) => (
                    <div key={friend.Id} className="flex justify-center p-2 mx-4 my-2 w-max bg-gray-200 border-4 border-black hover:cursor-pointer hover:bg-indigo-300 hover:text-white transition duration-300 shadow-[5px_5px_0_0px_rgba(0,0,0,1)] select-none" onClick={() => goToProfile(friend.Username)}> 
                      <p className="text-2xl font-semibold font-silkscreen">{friend.Username}</p>
                    </div>
                  ))}
                </div>
              </div>
          )}

          {userHistory && (
            <div className="w-max flex flex-col p-4 bg-gray-200 relative border-[6px] border-black drop-shadow-[15px_15px_0_rgba(0,0,0,1)] mt-[80px]">
              <p className="text-3xl position absolute top-[-40px] left-[-20px] font-bold mb-4 font-silkscreen bg-indigo-500 p-2 border-8 border-black text-center text-white w-max px-16 py-4 rounded-md">Recently played</p>
              <div className="mt-[50px] bg-indigo-500 py-3 mb-6 border-4 border-black shadow-[5px_5px_0_0px_rgba(0,0,0,1)]" style={{width:  divRef.current ? divRef.current.offsetWidth - 100 : ''}}>
                {userHistory.UserQuizScores.length > 0 ? (
                  <QuizCarousel quizzes={userHistory.UserQuizScores.map((quizScore) => quizScore.Quiz)} scores={userHistory.UserQuizScores.map((quizScore) => quizScore.Score)} />
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <p className="font-silkscreen text-white text-2xl py-[100px] w-[90%] text-center">THIS USER DIDN'T PLAY ANY QUIZZES</p>
                  </div>
                )}
              </div>
              {(userHistory.Pages - 1) > userHistory.CurrentPage && (
                <div className="flex justify-center">
                  <div onClick={handleLoadMoreHistory} className="hover:cursor-pointer hover:bg-amber-500 transition duration-300 font-silkscreen font-bold m-1 p-2 h-max rounded-md bg-indigo-500 border-4 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]">
                    <p className="border-4 border-black p-2 bg-gray-200 select-none">Load more</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {userOwned && (
            <div className="w-max flex flex-col p-4 bg-gray-200 relative border-[6px] border-black drop-shadow-[15px_15px_0_rgba(0,0,0,1)] mt-[80px]">
              <p className="text-3xl position absolute top-[-40px] left-[-20px] font-bold mb-4 font-silkscreen bg-indigo-500 p-2 border-8 border-black text-center text-white w-max px-16 py-4 rounded-md">Created by {name}</p>
              <div className="mt-[50px] bg-indigo-500 py-3 mb-6 border-4 border-black shadow-[5px_5px_0_0px_rgba(0,0,0,1)]" style={{width:  divRef.current ? divRef.current.offsetWidth - 100 : ''}}>
                {userOwned.OwnedQuizzes.length > 0 ? (
                  <QuizCarousel quizzes={userOwned.OwnedQuizzes} />
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <p className="font-silkscreen text-white text-2xl py-[100px] w-[90%] text-center">THIS USER DIDN'T CREATE ANY QUIZZES</p>
                  </div>
                )}
              </div>
              {(userOwned.Pages - 1) > userOwned.CurrentPage && (
                <div className="flex justify-center">
                  <div onClick={handleLoadMoreOwned} className="hover:cursor-pointer hover:bg-amber-500 transition duration-300 font-silkscreen font-bold m-1 p-2 h-max rounded-md bg-indigo-500 border-4 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]">
                    <p className="border-4 border-black p-2 bg-gray-200 select-none">Load more</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    
    
  );
};

export default Profile;
