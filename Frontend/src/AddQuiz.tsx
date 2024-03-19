import React, { useState, useEffect } from "react";
import QuestionInput from "./QuestionInput";
import customFetch from "./CustomFetch";
import repeatable1 from "./assets/maybe.png";
import Sidebar from "./Sidebar";

interface Category {
    Id: number;
    Name: string;
  }
  
  interface Choice {
    Text: string;
  }

  interface AnswerArray {
    Text: string;
  }
  
  interface Question {
    text: string;
    points: number;
    category: Category;
    questionType: number;
    answer: AnswerArray[] | null;
    choices?: Choice[];
  }

const AddQuiz: React.FC = () => {
  const [quizName, setQuizName] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState<null | string>(null);
  const [addToValidate, setAddToValidate] = useState(false);
  const [CategoryData, setCategoryData] = useState<Category[]>([]);
  const [questions, setQuestions] = useState([
    {
      text: "",
      points: 1,
      category: { Id: 1, Name: "Unknown" },
      questionType: 0,
      answer: [{ Text: "T" }],
      choices: []
    },
  ]);

  const MAX_NAME_LENGTH = 20;
  const MAX_DESCRIPTION_LENGTH = 200;

  const [isNameLimitReached, setIsNameLimitReached] = useState(false);
  const [isDescriptionLimitReached, setIsDescriptionLimitReached] = useState(false);

  const handleQuizNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value.slice(0, MAX_NAME_LENGTH);
    setQuizName(newName);
    setIsNameLimitReached(newName.length === MAX_NAME_LENGTH);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value.slice(0, MAX_DESCRIPTION_LENGTH);
    setDescription(newDescription);
    setIsDescriptionLimitReached(newDescription.length === MAX_DESCRIPTION_LENGTH);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (password !== null && /\s/.test(password)) {
      alert("Password should not contain whitespace.");
      return;
    }
  
    const quizData = {
        quiz: {
          name: quizName,
          description: description,
          password: password,
          questions: questions,
        },
        AddToValidate: addToValidate,
      };
    
      try {
        const response = await customFetch("https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Quiz/add", {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quizData),
        });
    
        console.log(JSON.stringify(quizData, null, 2));
        
        if (response.ok) {
          console.log('Quiz added successfully');
          window.location.href = '/';
        } else {
          console.error('Failed to add quiz');
        }
      } catch (error) {
        console.error('Error during the request:', error);
      }
    };

  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await customFetch("https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Question/Categories", {
            method: 'GET',
            credentials: 'include',
            headers: {
              "Content-Type": "application/json",
            },
          });
          const data: Category[] = await response.json();
          setCategoryData(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
    fetchData();
  }, []);

  const handleAddQuestion = () => {
    setQuestions((prevQuestions) => [
      ...prevQuestions,
      {
        text: "",
        points: 1,
        category: { Id: 1, Name: "Unknown" },
        questionType: 0,
        answer: [{ Text: "T" }],
        choices: []
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate">
      <div 
        className="min-h-screen h-full py-8 flex justify-center"
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
        <div className="w-[50%] h-max max-w-[1000px] font-silkscreen p-4 border-8 border-black bg-indigo-500 shadow-[50px_30px_0_0_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Quiz Name */}
            <div>
              <div className="block">
                <p className="text-white">Quiz Name:</p>
                <input
                  type="text"
                  value={quizName}
                  onChange={handleQuizNameChange}
                  className="mt-1 p-2 outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,0.8)] w-full"
                />
                {isNameLimitReached && <p className="text-amber-500 mt-2 ml-2">Character limit reached</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="block">
                <p className="text-white">Description:</p>
                <input
                  type="text"
                  value={description}
                  onChange={handleDescriptionChange}
                  className="mt-1 p-2 outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,0.8)] w-full"
                />
                {isDescriptionLimitReached && <p className="text-amber-500 mt-2 ml-2">Character limit reached</p>}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="block">
                <p className="text-white">Password:</p>
                <input
                  type="password"
                  value={password === null ? '' : password}
                  onChange={(e) => {
                    const newPassword = e.target.value.trim();
                    setPassword(newPassword === '' ? null : newPassword);
                  }}
                  className="mt-1 p-2 outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,0.8)] w-full"
                />
              </div>
            </div>

            {/* Add to Validate */}
            <div>
              <div className="block text-white w-full flex flex-wrap">
                <p className="inline border-2 border-black bg-slate-500 p-2 mr-2 mb-2 shadow-[5px_5px_0_0_rgba(0,0,0,0.8)]">Allow your questions to be used in other quizzes:</p>
                <div onClick={() => setAddToValidate(!addToValidate)} className={`w-max h-max border-2 border-black select-none p-[8px] hover:cursor-pointer inline shadow-[5px_5px_0_0_rgba(0,0,0,0.8)] ${addToValidate ? 'bg-green-500' : 'bg-amber-500'}`}>
                  <p>{addToValidate ? 'YES' : 'NO'}</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            {questions.map((question, index) => (
              <QuestionInput
                key={index}
                question={question}
                onChange={(updatedQuestion) => {
                  const updatedQuestions = [...questions];
                  updatedQuestions[index] = updatedQuestion;
                  setQuestions(updatedQuestions);
                }}
                onRemove={() => handleRemoveQuestion(index)}
                CategoryData={CategoryData}
              />
            ))}

            {/* Add Question button */}
            <button type="button" onClick={handleAddQuestion} className="bg-blue-500 border-2 border-black text-white px-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              Add Question
            </button>
            <br/>

            {/* Submit button */}
            <button type="submit" className="bg-green-500 border-2 border-black text-white px-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
    
    
  );
};

export default AddQuiz;
