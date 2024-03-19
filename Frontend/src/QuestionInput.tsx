import React from "react";

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

interface QuestionInputProps {
  question: {
    text: string;
    points: number;
    category: Category;
    questionType: number;
    answer: AnswerArray[] | null;
    choices: Choice[];
  };
  onChange: (updatedQuestion: any) => void;
  onRemove: () => void;
  CategoryData: Category[];
}

const QuestionInput: React.FC<QuestionInputProps> = ({ question, onChange, onRemove, CategoryData }) => {

  const handlePointsChange = (value: number) => {
    let updatedValue = value;
  
    if (value < 1) {
      updatedValue = 1;
    } else if (value > 10) {
      updatedValue = 10;
    }
    onChange({ ...question, points: updatedValue });
  };

  const handleOptionChange = (optionIndex: number, value: string) => {
    const updatedChoices = [...question.choices];
    updatedChoices[optionIndex].Text = value.slice(0, 64);
    const updatedQuestion = {
      ...question,
      choices: updatedChoices,
    };
    onChange(updatedQuestion);
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

  const addOption = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const updatedChoices = [...question.choices, { Text: "" }];
    onChange({
      ...question,
      choices: updatedChoices,
    });
  }

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

  return (
    <div className="p-4 my-4 outline-none border-[6px] text-white border-black bg-slate-500 shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
      {/* Question Text */}
      <div className="mb-4">
        <div className="block">
          Question Text:
          <input
            type="text"
            value={question.text}
            onChange={(e) => onChange({ ...question, text: e.target.value.slice(0, 256) })}
            className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
          />
        </div>
        {question.text.length === 256 && <p className="text-amber-500 mt-2 ml-2">Character limit reached</p>}
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
            value={question.category?.Id || ''}
            onChange={(e) => {
              const categoryId = parseInt(e.target.value, 10);
              const selectedCategory = CategoryData.find(category => category.Id === categoryId) || null;
              onChange({ ...question, category: selectedCategory });
            }}
            className="mt-1 p-2 bg-white text-black outline-none border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
          >
            <option value="" disabled>Select a category</option>
            {CategoryData.map((category) => (
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
            value={question.questionType}
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
              value={question.answer !== null ? question.answer[0].Text : ''}
              onChange={(e) => onChange({ ...question, answer: [{ Text: e.target.value }] })}
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
            {question.choices.length < 10 && 
              <button className="bg-green-500 border-2 border-black text-white mb-[10px] p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]" onClick={addOption}>Add Option</button>
            }
          </div>
            {question.choices &&
              question.choices.map((option, index) => (
                <div key={index} className="mb-2 flex flex-col w-full">
                  <p >Option {String.fromCharCode(65 + index)}:</p>
                  <div className="w-full h-max flex">
                    <input
                      type="text"
                      value={option.Text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full max-w-[540px]"
                    />
                    <div
                      className={`mt-2 cursor-pointer border-2 border-black w-full max-w-max ml-4 inline option-selector mr-2 p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)] ${question.answer?.map(answer => answer.Text).includes(String.fromCharCode(65 + index)) ? 'bg-amber-500' : 'bg-indigo-500'}`}
                      onClick={() => handleCorrectOptionChange(index)}
                    >
                      Correct
                    </div>
                  </div>
                  
                  {option.Text.length === 64 && <p className="text-amber-500 mt-2 ml-2">Character limit reached</p>}
                </div>
              ))}
              {question.choices?.length !== 0 && (question.answer === null || question.answer.length === 0) && <p className="text-black mt-2 ml-2 bg-amber-500 w-max border-4 border-black p-2 mt-[20px]">Correct answer isn't selected!</p>}
          </div>
        </div>
      )}
      
        {/*Question type 2*/}
      {question.questionType === 2 && (
        <div className="mb-4">
          <div className="block">
            Answer:
            <input
              type="text"
              value={question.answer !== null ? question.answer[0].Text : ''}
              onChange={(e) => onChange({ ...question, answer: [{ Text: e.target.value }] })} 
              className="mt-1 p-2 outline-none text-black border-2 border-black shadow-[5px_5px_0_0_rgba(0,0,0,1)] w-full w-full"
            />
          </div>
        </div>
      )}

      {/* Remove question button */}
      <button type="button" onClick={onRemove} className="bg-buttonred border-2 border-black text-white p-2 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
        Remove Question
      </button>
    </div>
  );
};

export default QuestionInput;
