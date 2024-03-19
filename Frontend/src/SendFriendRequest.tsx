import React, { useState } from "react";
import customFetch from "./CustomFetch";

interface UserData {
    Id: number;
    Username: string;
}

interface FriendRequestProps {
    friendData: UserData;
}

const SendFriendRequest: React.FC<FriendRequestProps> = ({ friendData }) => {
    const [completed, setCompleted] = useState(false);

    const makeFriendRequest = async () => {
        const format = {
            Receiver: friendData.Id
        };
        try {
            const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Friend/sendFriendRequest`, {
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
    };

    return (
        !completed ?
        (
            <div className="w-max h-max border-black border-8 text-black bg-white rounded-md border-black shadow-[3px_3px_0_3px_rgba(0,0,0,0.8)]">
                <button onClick={makeFriendRequest} className="bg-blue-500 h-full w-full font-silkscreen p-10 hover:bg-blue-800">SEND FRIEND REQUEST</button>
            </div>
        ) :
        (
            <div></div>
        )
    );
};

export default SendFriendRequest;