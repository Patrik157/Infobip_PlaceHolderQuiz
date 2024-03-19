import React, { useEffect, useState } from 'react';
import leaderboardicon from './assets/leaderboard.png';
import homeicon from './assets/homeicon.png';
import friendsicon from './assets/friendsicon.png';
import customFetch from './CustomFetch';

interface UserData {
  Username: string;
  Email: string;
  Role: {
    Id: number;
    RoleName: string;
  }
  HasFriendRequests: boolean;
}

const Sidebar: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await customFetch("https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/User", {
          method: 'GET',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Error fetching user data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const goToHome = () => {
    window.location.href = '/';
  }

  const goToLeaderboard = () => {
    window.location.href = '/leaderboard';
  }

  const goToProfile = () => {
    window.location.href = `/user/${userData?.Username}`;
  }

  const goToFriends = () => {
    window.location.href = '/friends';
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/logout", {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Logout response:", response);
      window.location.href = '/landing';
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="h-full w-[340px] flex-col flex items-center bg-indigo-500 shadow-lg p-[8px] border-8 border-black">
      <div className='h-full w-full flex flex-col items-center p-2 bg-slate-500 border-8 border-black'>
        <div className='h-[10%] w-max flex items-center justify-center'>
          <div className='text-white text-2xl font-bold m-3 hover:cursor-pointer font-silkscreen' onClick={goToProfile}>{userData?.Username?.toUpperCase()}</div>
        </div>
        <div className='flex flex-col flex-grow items-center'>
          <button className='mb-2 p-2 bg-indigo-500 border-2 border-black w-full flex flex-col items-center justify-center transition duration-300 hover:bg-indigo-800 shadow-[4px_2px_0_0_rgba(0,0,0,1)]' onClick={goToHome}>
            <img src={homeicon} alt='' className='w-[35px] h-[35px]'></img>
            <p className='font-silkscreen text-white'>Home</p>
          </button>
          <button className='mb-2 p-2 bg-indigo-500 border-2 border-black w-full flex flex-col items-center justify-center transition duration-300 hover:bg-indigo-800 shadow-[4px_2px_0_0_rgba(0,0,0,1)]' onClick={goToLeaderboard}>
            <img src={leaderboardicon} alt='' className='w-[35px] h-[35px]'></img>
            <p className='font-silkscreen text-white'>Leaderboard</p>
          </button>
          <button className='mb-2 p-2 bg-indigo-500 border-2 border-black w-full flex flex-col items-center justify-center transition duration-300 hover:bg-indigo-800 shadow-[4px_2px_0_0_rgba(0,0,0,1)] relative' onClick={goToFriends}>
            <img src={friendsicon} alt='' className='w-[35px] h-[35px]'></img>
            <p className='font-silkscreen text-white'>Friends</p>
            {userData?.HasFriendRequests ? (<div className='absolute w-[24px] h-[24px] bg-amber-500 right-[-12px] top-[-12px] animate-pinger rounded-full'/>) : (<div/>)}
          </button>
        </div>
        <button className='w-full mt-2 py-2 font-silkscreen bg-indigo-500 text-white hover:bg-indigo-800 transition duration-300 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]' onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
};

export default Sidebar;