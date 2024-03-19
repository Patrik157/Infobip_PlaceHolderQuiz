import React, { useState } from "react";
import customFetch from "./CustomFetch";

interface UserData {
    Id: number;
    Username: string;
}

interface FriendRequestProps {
    friendData: UserData;
}

const FriendRequestReceived: React.FC<FriendRequestProps> = ({ friendData }) => {
    const [completed, setCompleted] = useState(false);

    const acceptFriendRequest = async () => {
        const format = {
            Receiver: friendData.Id
        };
        try {
            const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/acceptFriendRequest`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(format),
            });

            if (response.ok) {
                setCompleted(true);
            }
            console.log(response);
            console.log(JSON.stringify(format, null, 2));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const rejectFriendRequest = async () => {
        const format = {
            Receiver: friendData.Id
        };
        try {
            const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/rejectFriendRequest`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(format),
            });
            if (response.ok) {
                setCompleted(true);
            }
            console.log(response);
            console.log(JSON.stringify(format, null, 2));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const goToOwner = () => {
        window.location.href = `/user/${friendData.Username}`;
    };

    return (
        !completed ?
        (
            <div className="w-max h-max flex flex-col items-center bg-white border-black border-8 p-2 text-black bg-white rounded-md p-4 mb-4 border-black shadow-[3px_3px_0_3px_rgba(0,0,0,0.8)]">
                <p className="font-silkscreen">New friend request from</p>
                <p className="font-silkscreen" onClick={goToOwner}>{friendData.Username}</p>
                <div className="flex flex-col">
                    <button onClick={acceptFriendRequest} className="bg-green-500 m-2 p-1 font-silkscreen hover:bg-green-800">ACCEPT FRIEND REQUEST</button>
                    <button onClick={rejectFriendRequest} className="bg-red-500 m-2 p-1 font-silkscreen hover:bg-red-800">REJECT FRIEND REQUEST</button>
                </div>
            </div>
        ) :
        (
            <div></div>
        )
    );
};

export default FriendRequestReceived;
