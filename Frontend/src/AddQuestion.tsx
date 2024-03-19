import React, { useState, useEffect } from "react";
import customFetch from "./CustomFetch";
import repeatable1 from "./assets/maybe.png";
import Sidebar from "./Sidebar";

interface Category {
  Id: number;
  Name: string;
}

interface Answer {
  Text: string;
}

interface Question {
  text: string | null;
  points: number;
  category: Category | null;
  questionType: number | null;
  answer: Answer[] | null;
  choices?: Answer[] | null;
}

const AddQuestion: React.FC = () => {
  const [categoryData, setCategoryData] = useState<Category[] | null>(null);
  const [question, setQuestion] = useState<Question>({
    text: null,
    points: 1,
    category: null,
    questionType: 0,
    answer: [{ Text: "T" }],
    choices: [{ Text: "" }, { Text: "" }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch(
          "https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Question/Categories",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        const data: Category[] = await response.json();
        setCategoryData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const onChange = (updatedQuestion: Partial<Question>) => {
    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      ...updatedQuestion
    }));
  };

  const handlePointsChange = (value: number) => {
    let updatedValue = value;
  
    if (value < 1) {
      updatedValue = 1;
    } else if (value > 10) {
      updatedValue = 10;
    }
    onChange({ ...question, points: updatedValue });
  };

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuestionType = parseInt(e.target.value, 10);
    const updatedQuestion = {
      ...question,
      questionType: newQuestionType,
      choices: newQuestionType === 1 ? [{ Text: "" }, { Text: "" }] : [], // Set choices array to default value when question type changes 
      answer: newQuestionType === 0 ? [{ Text: "T" }] : (newQuestionType === 2 ? [{ Text: "" }] : [{ Text: "A" }]), // Initialize answer array
    };
    onChange(updatedQuestion);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (question.choices) {
      const updatedChoices = [...question.choices];
      updatedChoices[index] = { Text: value };
      onChange({ choices: updatedChoices });
    }
  };

  const handleCorrectOptionChange = (index: number) => {
    const letter = String.fromCharCode(65 + index);
    const currentAnswers = question.answer?.map(answer => answer.Text);
    const isAnswerSelected = currentAnswers?.includes(letter);

    let updatedAnswers;
    if (isAnswerSelected) {
      updatedAnswers = question.answer?.filter(answer => answer.Text !== letter);
    } else {
      const answersArray = question.answer || [];
      updatedAnswers = [...answersArray, { Text: letter }];
    }

    onChange({
      ...question,
      answer: updatedAnswers,
    });
  };

  const addOption = () => {
    if (question.choices) {
      const updatedChoices = [...question.choices, { Text: "" }];
      onChange({ choices: updatedChoices });
    }
  };

  const handleSubmit = async () => {
      console.log(JSON.stringify(question, null, 2));
      try {
        const response = await customFetch("https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Question/addQuestion", {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(question),
        });
        if (response.ok) {
          console.log('Question added successfully');
          window.location.href = '/';
        } else {
          console.error('Failed to add quiz', response.text());
        }
      } catch (error) {
        console.error('Error during the request:', error);
      }
    };

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate">
      <div
        className="min-h-screen h-full py-8 flex justify-center"
        style={{
          backgroundImage: `url(${repeatable1})`,
          backgroundSize: "600px 600px",
          backgroundPosition: "top right",
          backgroundRepeat: "repeat"
        }}
      >
        <div className="fixed left-0 top-0 h-full">
          <Sidebar />
        </div>
        <div className="h-full w-[400px]" />
        <div className="w-[50%] h-max max-w-[1000px] font-silkscreen p-4 border-8 border-black bg-indigo-500 shadow-[50px_30px_0_0_rgba(0,0,0,1)]">
            <div className="w-full h-max flex items-center justify-center bg-slate-500 py-4 border-[6px] border-black shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                <p className="text-2xl text-amber-400">ADD QUESTION</p>
            </div>
            
          <div className="p-4 my-4 outline-none border-[6px] text-white border-black bg-slate-500 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
            {/* Question Text */}
            <div className="mb-4">
              <div className="block">
                Question Text:
                <input
                  type="text"
                  value={question.text || ""}
                  onChange={(e) =>
                    onChange({ text: e.target.value.slice(0, 256) })
                  }
                  className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
                />
              </div>
              {question.text && question.text.length === 256 && (
                <p className="text-amber-500 mt-2 ml-2">
                  Character limit reached
                </p>
              )}
            </div>

            {/* Points */}
            <div className="mb-4">
                <div className="block">
                Points:
                <input
                    type="number"
                    value={question.points}
                    onChange={(e) => handlePointsChange(parseInt(e.target.value, 10))}
                    className="mt-1 p-2 outline-none border-2 text-black border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full no-arrows"
                />
                </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <div className="block">
                Category:
                <select
                  value={question.category?.Id || ""}
                  onChange={(e) => {
                    const categoryId = parseInt(e.target.value, 10);
                    const selectedCategory = categoryData?.find(
                      (category) => category.Id === categoryId
                    );
                    onChange({ category: selectedCategory });
                  }}
                  className="mt-1 p-2 bg-white text-black outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categoryData?.map((category) => (
                    <option key={category.Id} value={category.Id}>
                      {category.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Type input */}
            <div className="mb-4">
              <div className="block">
                Question Type:
                <select
                  value={question.questionType || ""}
                  onChange={handleQuestionTypeChange}
                  className="mt-1 p-2 bg-white outline-none border-2 text-black border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
                >
                  <option value={0}>True / False</option>
                  <option value={1}>Multiple choice</option>
                  <option value={2}>Text input</option>
                </select>
              </div>
            </div>

            {/* Question Type 0*/}
            {question.questionType === 0 && (
              <div className="mb-4">
                <div className="block">
                  Answer:
                  <select
                    value={question.answer ? question.answer[0].Text : ""}
                    onChange={(e) =>
                      onChange({ answer: [{ Text: e.target.value }] })
                    }
                    className="mt-1 p-2 bg-white text-black outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
                  >
                    <option value="T">True</option>
                    <option value="F">False</option>
                  </select>
                </div>
              </div>
            )}

            {/* Question Type 1 */}
            {question.questionType === 1 && (
              <div className="mb-4 w-full">
                <div className="block w-full">
                  <div className="w-full h-max flex items-center justify-center">
                    {question.choices &&
                      question.choices.length < 10 && (
                        <button
                          className="bg-green-500 border-2 border-black text-white mb-[10px] p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]"
                          onClick={addOption}
                        >
                          Add Option
                        </button>
                      )}
                  </div>
                  {question.choices &&
                    question.choices.map((option, index) => (
                      <div key={index} className="mb-2 flex flex-col w-full">
                        <p>Option {String.fromCharCode(65 + index)}:</p>
                        <div className="w-full h-max flex">
                          <input
                            type="text"
                            value={option.Text || ""}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full max-w-[540px]"
                          />
                          <div
                            className={`mt-2 cursor-pointer border-2 border-black w-full max-w-max ml-4 inline option-selector mr-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${
                              question.answer &&
                              question.answer
                                .map((answer) => answer.Text)
                                .includes(String.fromCharCode(65 + index))
                                ? "bg-amber-500"
                                : "bg-indigo-500"
                            }`}
                            onClick={() => handleCorrectOptionChange(index)}
                          >
                            Correct
                          </div>
                        </div>

                        {option.Text && option.Text.length === 64 && (
                          <p className="text-amber-500 mt-2 ml-2">
                            Character limit reached
                          </p>
                        )}
                      </div>
                    ))}
                  {question.choices?.length !== 0 &&
                    (!question.answer || question.answer.length === 0) && (
                      <p className="text-black mt-2 ml-2 bg-amber-500 w-max border-4 border-black p-2 mt-[20px]">
                        Correct answer isn't selected!
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Question type 2*/}
            {question.questionType === 2 && (
              <div className="mb-4">
                <div className="block">
                  Answer:
                  <input
                    type="text"
                    value={question.answer ? question.answer[0].Text : ""}
                    onChange={(e) =>
                      onChange({ answer: [{ Text: e.target.value }] })
                    }
                    className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
                  />
                </div>
              </div>
            )}
          </div>
          <div onClick={handleSubmit} className="bg-green-500 w-max border-2 border-black text-white px-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">Submit question</div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
