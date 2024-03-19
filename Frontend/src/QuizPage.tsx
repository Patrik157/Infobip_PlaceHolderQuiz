import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import customFetch from './CustomFetch';
import Sidebar from './Sidebar';
import repeatable1 from "./assets/maybe.png";
import LockIcon from './assets/lock.png';
import ButtonOutline from './assets/button1.png';
import checkmark from './assets/checkmark.png';

interface QuizData {
    Name: string;
    Questions: Question[];
    WillScore: boolean;
  }

  interface Choice {
    Id: number;
    Text: string;
  }
  
  interface AnswerArray {
    Text: string | null;
  }

  interface Question {
    Id: number;
    Text: string;
    Points: number;
    Category: {
      Id: number;
      Name: string;
    };
    QuestionType: number;
    Choices: Choice[];
    Answer: AnswerArray[];
    IsPrivate: boolean;
    IsValidated: boolean;
  }

  interface AnswerData {
    Points: number;
    CorrectAnswers: CorrectAnswer[];
  }
  
  interface CorrectAnswer {
    Id: number;
    Text: string;
    Points: number;
    Answer: AnswerArray[];
  }

const QuizPage: React.FC = () => {
    const location = useLocation();
    const match = location.pathname.match(/\/(\d+)-([a-zA-Z]+)$/);
    const quizId = match ? match[1] : null;
    const letter = match ? match[2] : null;

    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [userAnswers, setUserAnswers] = useState<any>({});
    const [newPassword, setPassword] = useState<string | null>(null);
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [incorrectPassword, setIncorrectPassword] = useState<boolean>(false);
    const [quizAnswers, setQuizAnswers] = useState<AnswerData | null>(null);
    const [showScore, setShowScore] = useState<boolean>(false);
    const [score, setScore] = useState<number | null>(null);

    const fetchQuizData = async () => {
        try {
            const response = await customFetch(`https://quizback-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Quiz/fetch`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: quizId,
                    password: newPassword,
                }),
            });

            if (!response.ok) {
                setIncorrectPassword(true);
                setTimeout(() => {
                    setIncorrectPassword(false);
                }, 700);

                return;
            }

            const data = await response.json();
            console.log(JSON.stringify(data, null, 2));
            setQuizData(data);
            setAuthenticated(true);
        } catch (error) {
            console.error('Error fetching quiz data:', (error as Error).message);
        }
    };


    useEffect(() => {
        if (letter === 'l' && newPassword === null) {
            return;
        }
        fetchQuizData();
    },[]);

    const handleRadioChange = (questionId: number, value: string) => {
        setUserAnswers((prevAnswers: any) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleTextChange = (questionId: number, value: string) => {
        setUserAnswers((prevAnswers: any) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    };

    const handleCheckboxChange = (questionId: number, value: string) => {
        setUserAnswers((prevAnswers: any) => {
            const prevAnswerArray = prevAnswers[questionId] || [];
            const updatedAnswers = prevAnswerArray.includes(value)
                ? prevAnswerArray.filter((ans: string) => ans !== value)
                : [...prevAnswerArray, value];
            return {
                ...prevAnswers,
                [questionId]: updatedAnswers,
            };
        });
    };

    const handleSubmit = async () => {
        const quizIdString = location.pathname.split('/').pop();
        const quizId = quizIdString ? parseInt(quizIdString, 10) : NaN;
        const formattedAnswers = quizData
        ? {
            id: quizId,
            name: quizData.Name,
            password: newPassword,
            questions: quizData.Questions.map((question: Question) => ({
                id: question.Id,
                text: question.Text,
                points: question.Points,
                category: {
                id: question.Category.Id,
                name: question.Category.Name,
                },
                questionType: question.QuestionType,
                answer: question.QuestionType === 1 // Check if question type is checkbox multiple choice
            ? (userAnswers[question.Id] || []).map((choice: string) => ({ Text: choice })) // Map each choice to an object with "Text" property
            : [{ Text: userAnswers[question.Id] || "" }], //non question type 1 choices have an array with one element
            })),
            }
        : null;

        console.log(JSON.stringify(formattedAnswers, null, 2));

        try {
            const response = await customFetch('https://quizback-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Quiz/check', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedAnswers),
            });

            if (response.ok) {
                const result = await response.json();
                console.log(JSON.stringify(result, null, 2));
                setQuizAnswers(result);
                setScore(result.Points);
                setShowScore(true);
            }else{
                console.log(response.text());
            }
        } catch (error) {
            console.error('Error submitting quiz answers:', (error as Error).message);
        }
    };

    const closeScore = () => {
        setShowScore(false);
        setScore(0);
    };

    const goToLeaderboard = () => {
        window.location.href = `/quiz/leaderboard/${quizId}`;
    };

    const getCorrectAnswerText = (questionId: number): string | null => {
        const correctAnswer = quizAnswers?.CorrectAnswers.find((answer) => answer.Id === questionId);
        if (!correctAnswer) return null;
    
        // For multiple-choice questions (question type 1)
        if (correctAnswer.Answer.length > 1) {
            const correctAnswersText = correctAnswer.Answer.map((ans) => ans.Text).join(', ');
            return correctAnswersText;
        }
    
        // For other question types (question type 0 and question type 2)
        return correctAnswer.Answer[0].Text || null;
    };

    if (letter === 'l' && !authenticated) {
        return (
            <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate">
                <div className="flex items-center justify-center h-screen"
                    style={{
                        backgroundImage: `url(${repeatable1})`,
                        backgroundSize: '600px 600px',
                        backgroundPosition: 'top right',
                        backgroundRepeat: 'repeat',
                    }}
                >
                    <div className="text-center h-[40%] w-[40%] flex flex-col bg-indigo-500 border-8 border-black p-2 rounded-md shadow-[45px_25px_0_3px_rgba(0,0,0,0.8)]">
                        <div className="flex flex-col w-full h-full bg-gray-500 p-4 border-8 rounded-md border-black">
                            <div className='flex flex-col flex-grow'>
                                <img
                                    src={LockIcon}
                                    alt="Lock Icon"
                                    className={`mx-auto mb-4 ${incorrectPassword ? 'shake' : ''} w-[15%] h-[160%]`}
                                />
                                <p className='font-silkscreen'>Enter Password:</p>
                                <input
                                    type="password"
                                    className='h-full mt-1 outline-none border-2 p-1 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] 2xl:text-4xl xl:text-3xl text-2xl'
                                    value={newPassword || ''}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={fetchQuizData}
                                className="h-[25%] mt-6 bg-buttonred border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] hover:cursor-pointer 2xl:text-3xl xl:text-2xl text-2xl font-black"
                            >
                                Submit Password
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
            
        );
    }

    return (
        <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate">
            <div className='flex w-full min-h-screen h-full'
                style={{
                    backgroundImage: `url(${repeatable1})`,
                    backgroundSize: '600px 600px',
                    backgroundPosition: 'top right',
                    backgroundRepeat: 'repeat',
                }}
            >
                <div className="fixed left-0 top-0 h-full">
                    <Sidebar />
                </div>
                <div className="h-full w-[400px]"/>
                <div className='w-full h-full flex flex-col items-center'>
                    <div className='flex flex-col w-[80%] p-2 bg-indigo-500 h-max rounded-md my-10 border-8 border-black shadow-[35px_25px_0_3px_rgba(0,0,0,0.8)]'>
                        <div className="p-4 bg-slate-500 h-max rounded-md border-8 border-white flex flex-col items-center">
                            <p className="text-2xl text-center text-white font-silkscreen font-bold mb-4">{quizData?.Name || 'no name received'}</p>
                            {quizData && quizData.Questions.map((question: Question) => (
                                <div key={question.Id} className="mb-4 border-4 border-black bg-gray-200 p-4 rounded-md shadow-[3px_3px_0_3px_rgba(0,0,0,1)] w-full">


                                    {question.QuestionType === 0 && (
                                        <div className='font-silkscreen'>
                                            <p className="mb-8 font-silkscreen" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2", wordBreak: "break-all" }}>{question.Text}</p>
                                            <div className="block mb-8 relative">
                                                <p className='inline font-silkscreen absolute top-[2px]'>TRUE</p>
                                                <div
                                                    className={`mt-2 ml-[80px] cursor-pointer border-2 border-black w-[20px] h-[20px] ml-4 inline option-selector mr-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${userAnswers[question.Id] === 'T' ? 'bg-green-500' : 'bg-indigo-500 text-white'}`}
                                                    onClick={() => handleRadioChange(question.Id, 'T')}
                                                >
                                                    {userAnswers[question.Id] === 'T' ? 
                                                    <img src={checkmark} className='w-[20px] h-[20px] inline'/>
                                                    
                                                    : 'X'}
                                                </div>
                                            </div>
                                            <div className="block relative mb-4">
                                            <p className='inline font-silkscreen absolute top-[2px] left-1'>FALSE</p>
                                                <div
                                                    className={`ml-[100px] cursor-pointer border-2 border-black w-[20px] h-[20px] ml-4 inline option-selector mr-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${userAnswers[question.Id] === 'F' ? 'bg-green-500' : 'bg-indigo-500 text-white'}`}
                                                    onClick={() => handleRadioChange(question.Id, 'F')}
                                                >
                                                    {userAnswers[question.Id] === 'F' ? 
                                                    <img src={checkmark} className='w-[20px] h-[20px] inline'/>
                                                    
                                                    : 'X'}
                                                </div>
                                            </div>
                                            {quizAnswers && quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <div className='flex flex-wrap'>
                                                    <p className="text-red-500 mr-10">Your answer was wrong!</p>
                                                    <div>
                                                        <p className="inline">The correct answer is </p>
                                                        <p className='inline text-indigo-500'>{getCorrectAnswerText(question.Id) === 'T' ? 'true' : 'false'}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {quizAnswers && !quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <p className="text-green-500 font-bold">Your answer was correct!</p>
                                            )}
                                        </div>
                                    )}

                                    {question.QuestionType === 1 && (
                                        <div className='font-silkscreen'>
                                            <p className="mb-8 font-silkscreen" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2", wordBreak: "break-all" }}>{question.Text.split('\n')[0]}</p>
                                            {question.Choices.map((choice: Choice, index: number) => (
                                                <div key={index} className="mb-2 flex relative">
                                                    <p className='inline font-bold text-sm font-silkscreen mr-2 absolute bottom-[17px]'>{String.fromCharCode(index + 65) + ')'}</p>
                                                    <div className="block ml-8 mb-4">
                                                        {choice.Text.trim()}
                                                        <div
                                                            className={`mt-2 cursor-pointer border-2 border-black text-white w-full max-w-max ml-4 inline option-selector mr-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${userAnswers[question.Id]?.includes(String.fromCharCode(65 + index)) ? 'bg-green-500' : 'bg-indigo-500'}`}
                                                            onClick={() => handleCheckboxChange(question.Id, String.fromCharCode(65 + index))}
                                                        >
                                                            {userAnswers[question.Id]?.includes(String.fromCharCode(65 + index)) ? 'Correct' : 'Incorrect'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {quizAnswers && quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <div className='flex flex-wrap'>
                                                    <p className="text-red-500 mr-10">Your answer was wrong!</p>
                                                    <div>
                                                        <p className="inline">The correct answer{getCorrectAnswerText(question.Id)?.includes(",") ? 's are ' : ' is '}</p>
                                                        <p className='inline text-indigo-500'>{getCorrectAnswerText(question.Id)}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {quizAnswers && !quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <p className="text-green-500">Your answer was correct!</p>
                                            )}
                                        </div>
                                    )}

                                    {question.QuestionType === 2 && (
                                        <div className='font-silkscreen'>
                                            <p className="mb-8 font-silkscreen" style={{ whiteSpace: "pre-line", overflowWrap: "break-word", lineHeight: "1.2", wordBreak: "break-all" }}>{question.Text}</p>
                                            <div className="block relative">
                                                <p className='font-silkscreen absolute top-[19px]'>Your Answer:</p>
                                                <input
                                                    type="text"
                                                    value={userAnswers[question.Id] || ''}
                                                    onChange={(e) => handleTextChange(question.Id, e.target.value)}
                                                    className="border-4 border-black p-2 outline-none focus:border-indigo-500 w-[50%] mt-2  font-silkscreen ml-[200px] mb-2"
                                                />
                                            </div>
                                            {quizAnswers && quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <div className='flex flex-wrap'>
                                                <p className="text-red-500 mr-10">Your answer was wrong!</p>
                                                <div>
                                                    <p className="inline">The correct answer is </p>
                                                    <p className='inline text-indigo-500'>{getCorrectAnswerText(question.Id)}</p>
                                                </div>
                                            </div>
                                            )}
                                            {quizAnswers && !quizAnswers.CorrectAnswers.some((correctAnswer: any) => correctAnswer.Id === question.Id) && (
                                                <p className="text-green-500">Your answer was correct!</p>
                                                
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className='flex w-full flex-grow'/>
                            {score === null &&
                                <div className='flex items-center'>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 focus:outline-none relative shadow-[10px_10px_0_3px_rgba(0,0,0,1)]"
                                    >
                                        <img src={ButtonOutline} alt="" className="w-[210px] h-[70px]"/>
                                        <p className='absolute top-[11px] font-silkscreen'>Submit Answers</p>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>

                    <div className={`h-max w-max max-w-[40%] ${!quizData?.WillScore ? 'bg-indigo-500' : 'bg-amber-500'}  rounded-md p-2 border-8 border-black shadow-[10px_10px_0_3px_rgba(0,0,0,1)] text-center`}>
                        {quizData && (
                            <div className="">
                                {quizData.WillScore ? (
                                    <div className="rounded-md border-8 border-black bg-gray-300">
                                        <p className="text-indigo-500 font-silkscreen m-2">This is your first time playing this quiz, You will score points!</p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border-8 border-black bg-gray-300">
                                        <p className="text-indigo-500 font-silkscreen m-2">You have already played this quiz, You will not score points.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div> 
                </div>
            </div>
            {/* Render the score div if showScore is true */}
            {showScore && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 font-silkscreen">
                    <div className="bg-white p-8 flex flex-col items-center justify-center border-8 border-black shadow-[0px_0px_0_8px_rgba(99,102,241,1)]">
                        <p className="text-3xl font-bold mb-4">Quiz Completed</p>
                        <p className="text-xl">{score === 0 ? "You didn't score any points :(" : `You scored ${score} ${score === 1 ? 'point' : 'points'}!`}</p>
                        <button
                            onClick={closeScore}
                            className="mt-4 px-6 border-4 border-black py-2 bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 focus:outline-none shadow-[5px_5px_0_0px_rgba(0,0,0,1)]"
                        >
                            Close
                        </button>
                        <button
                            onClick={goToLeaderboard}
                            className="mt-4 px-6 border-4 border-black py-2 bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 focus:outline-none shadow-[5px_5px_0_0px_rgba(0,0,0,1)]"
                        >
                            See Leaderboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;