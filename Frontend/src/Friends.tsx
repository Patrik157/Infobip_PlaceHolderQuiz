import React, { useEffect, useState } from "react";
import customFetch from "./CustomFetch";
import repeatable1 from "./assets/maybe.png";
import Sidebar from "./Sidebar";
import FriendRequestReceived from "./FriendRequestReceived";
import SearchIcon from "./assets/search-magnifying-glass-magnifier-svgrepo-com.png";
import Sword from "./assets/friendsicon.png";

interface SearchResponse {
    Users: User[];
    Pages: number;
    CurrentPage: number;
}

interface User {
    Id: number;
    Username: string;
}

const Friends: React.FC = () => {
    const [searchResponseData, setSearchResponseData] = useState<SearchResponse | null>(null);
    const [friendListData, setFriendListData] = useState<User[] | null>(null);
    const [username, setUsername] = useState<string>("");
    const [friendRequest, setFriendRequest] = useState<User[] | null>(null);
    const [emptySearch, setEmptySearch] = useState<boolean>(false);
    const currentPage = 0;


    useEffect(() => {
        fetchFriendRequest();
        fetchFriendListData();
      }, []);

      const fetchFriendListData = async () => {
        try {
          const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/friends`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          const data: User[] = await response.json();
          setFriendListData(data);
          console.log(JSON.stringify(data, null, 2));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
    

    const fetchFriendSearchData = async () => {
        try {
            const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/search/${username}/${currentPage}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data: SearchResponse = await response.json();
            console.log("submitted data is:", username, currentPage);
            console.log(JSON.stringify(data, null, 2));
            setSearchResponseData(data);
            if (data.Users.length === 0) {
                setEmptySearch(true);
            }else if (data.Users.length > 0){
                setEmptySearch(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchFriendRequest = async () => {
        try {
          const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/friendRequests`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data = await response.json();
          setFriendRequest(data);
          console.log("your friend requests are:", JSON.stringify(data, null, 2));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

    const navigateToUserProfile = (user: User) => {
        window.location.href = `/user/${user.Username}`;
    };

    const goToProfile = (name:string) => {
        window.location.href = `/user/${name}`;
    }

    const closeSearch = () => {
        setSearchResponseData(null);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
          fetchFriendSearchData();
        }
      };

    return (
        <div className="w-full bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate overflow-x-hidden">
            <div
            style={{
                backgroundImage: `url(${repeatable1})`,
                backgroundSize: '600px 600px',
                backgroundPosition: 'top right',
                backgroundRepeat: 'repeat',
                }}
                className="flex min-h-screen h-full"
            >
                <div className="fixed left-0 top-0 h-full">
                    <Sidebar />
                </div>
                <div className="h-full w-[434px]"/>
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <div className="w-[92%] max-w-[1800px] bg-gray-500 my-10 rounded-md border-8 border-black shadow-[60px_35px_0_0_rgba(0,0,0,0.7)]">
                        <div className="w-full flex flex-row justify-center">
                            <img src={Sword} className="w-[100px] inline" style={{ transform: 'scaleX(-1)' } as React.CSSProperties}/>
                            <p className="text-4xl mx-8 font-bold my-8 text-white text-center font-silkscreen inline">Friends</p>
                            <img src={Sword} className="w-[100px] inline"/>
                        </div>
                        <div className="flex items-center space-x-4 relative">
                            <input
                                type="text"
                                placeholder="Search for friends"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="mx-4 py-2 pr-[80px] pl-[10px] text-4xl w-full h-[80px] border-4 border-black outline-none bg-gray-300 focus:bg-indigo-500 focus:text-white shadow-[8px_8px_0_0_rgba(0,0,0,1)]"
                            />
                            <button
                                className="h-[70px] w-[70px] position absolute right-[21px]"
                                onClick={fetchFriendSearchData}
                            >
                                <img src={SearchIcon} alt="Search"/>
                            </button>
                        </div>

                        {searchResponseData && searchResponseData.Users && searchResponseData.Users.length > 0 ? (
                            <div className="w-full flex flex-col items-center my-6 font-silkscreen">
                                <div className="w-[92%] max-w-[1200px] flex flex-col bg-indigo-500 px-10 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative">
                                    <p className="text-2xl text-white my-4 text-center">Users:</p>
                                    <button className="w-[50px] h-[50px] border-4 p-1 border-black flex items-center justify-center bg-buttonred hover:bg-red-800 transition duration-300 text-4xl absolute top-2 right-2 shadow-[3px_4px_0_0_rgba(0,0,0,0.8)]" onClick={closeSearch}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-12 h-12">
                                        <path strokeLinecap="square" strokeLinejoin="bevel" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <ul className="w-full mb-4 border-4 border-black bg-white p-6 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                                        {searchResponseData.Users.map((user) => (
                                            <li
                                                key={user.Id}
                                                onClick={() => navigateToUserProfile(user)}
                                                className="cursor-pointer bg-gray-500 border-4 hover:border-indigo-500 transition duration-300 border-black p-2 my-2 shadow-[8px_5px_0_0_rgba(0,0,0,1)]"
                                            >
                                                <span className="text-white">{user.Username}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            emptySearch && (
                                <div className="w-full flex flex-col items-center my-6 font-silkscreen">
                                    <div className="w-[92%] max-w-[1200px] flex flex-col bg-indigo-500 px-10 py-2 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                                        <p className="text-white text-center text-2xl my-4">No matches found.</p>
                                    </div>
                                </div>
                            )
                        )}

                        {friendRequest && friendRequest.length > 0 && (
                            <div className="mx-4 p-4 bg-indigo-500 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col items-center mt-4 mb-6">
                                <p className="text-3xl font-bold mb-4 font-silkscreen text-center bg-white text-indigo-500 py-2 px-10 border-[6px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">Friend Requests</p>
                                <div className="space-y-4 w-max">
                                    {friendRequest.map((friendData) => (
                                        <FriendRequestReceived key={friendData.Id} friendData={friendData} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {friendListData && friendListData.length > 0 ? (
                            <div className="my-8 mx-4 p-4 bg-indigo-500 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col items-center">
                                <p className="text-3xl font-bold mb-8 font-silkscreen text-center bg-white text-indigo-500 py-2 px-10 border-[6px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">Your Friends</p>
                                <div className="flex flex-wrap justify-center">
                                    {friendListData.map((friend) => (
                                        <div
                                            key={friend.Id}
                                            className="flex justify-center items-center py-6 px-8 m-2 text-black bg-gray-300 hover:bg-indigo-500 hover:border-white hover:text-white transition duration-300 border-4 border-black cursor-pointer select-none shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]"
                                            onClick={() => goToProfile(friend.Username)}
                                        >
                                            <p className="text-xl font-bold font-silkscreen">{friend.Username}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="my-8 mx-4 p-4 bg-indigo-500 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col items-center">
                                <p className="text-3xl font-bold mb-8 font-silkscreen text-center bg-white text-indigo-500 py-2 px-10 border-[6px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.8)]">Your Friends</p>
                                <div className="flex flex-wrap justify-center">
                                    <p className="font-silkscreen bg-white border-4 border-black p-4">{`YOU DON'T HAVE ANY FRIENDS :(`} </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div> 
        </div>
    );
};

export default Friends;
