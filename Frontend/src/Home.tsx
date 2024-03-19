import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import customFetch from "./CustomFetch";
import repeatable1 from "./assets/maybe.png";
import AddQuizButton from "./AddQuizButton";
import AddQuestionButton from "./AddQuestionButton";
import QuickJoinGraphic from "./assets/button1.png";
import QuickJoinFilterGraphic from "./assets/button2.png";
import QuizCarousel from "./QuizCarousel";
import Slider from 'react-slider';
import Arrow from './assets/8arrow.png';
import SearchIcon from './assets/search-magnifying-glass-magnifier-svgrepo-com.png'

  interface QuizSearch {
    Name: string; // default value is a whitespace
    ExcludedId: number[] | null; // default value is null
    MainCategoryId: number | null; // default value is null
    LengthMin: number; // default value is 1
    LengthMax: number; // default value is 50
    IsPrivate: boolean | null; // default value is null
    ShowPlayed: boolean; // default value is true
  }

  interface Category {
    Id: number;
    Name: string;
  }

  interface Quiz {
    Id: number;
    Name: string;
    Description: string;
    IsPrivate: boolean;
    MainCategory: Category;
    Length: number;
    Owner: string;
  }

  interface ApiResponse {
    Quizzes: Quiz[];
    Pages: number;
    CurrentPage: number;
  }

const Home: React.FC = () => {
  const [responseData, setResponseData] = useState<ApiResponse>({
    Quizzes: [],
    Pages: 0,
    CurrentPage: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [searchFormData, setSearchFormData] = useState<QuizSearch>({
    Name: '',
    ExcludedId: null,
    MainCategoryId: null,
    LengthMin: 1,
    LengthMax: 25,
    IsPrivate: null,
    ShowPlayed: true,
  });
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [showBottomFilter, setShowBottomFilter] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  
  //the only way to make the carousel div width  dynamic without it breaking the carousel
  const divRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const response = await customFetch(
        `https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/quiz/search/${currentPage}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchFormData),
        }
      );
      const data: ApiResponse = await response.json();
      //console.log(JSON.stringify(searchFormData, null, 2), `current page is ${currentPage}`);
      console.log(JSON.stringify(data, null, 2));
      
      setResponseData((prevData) => ({
        Quizzes: [...prevData.Quizzes, ...data.Quizzes],
        Pages: data.Pages,
        CurrentPage: data.CurrentPage,
      }));
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategoryData();
  }, [currentPage]);

  const loadMoreQuizzes = () => {
    setCurrentPage(currentPage + 1);
  };

  const fetchCategoryData = async () => {
    try {
        const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Question/Categories`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        setCategories(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
  
    setSearchFormData((prevState) => ({
      ...prevState,
      [name]:
        name === 'IsPrivate'
          ? value === 'true'
          : type === 'checkbox'
          ? (e as React.ChangeEvent<HTMLInputElement>).target.checked
          : name === 'MainCategoryId' && value === ''
          ? null
          : value === 'all'
          ? null
          : name === 'ExcludedId'
          ? value.split(',').map((id) => parseInt(id))
          : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSearchFormData((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSliderChange = (values: number[]) => {
    setSearchFormData({
      ...searchFormData,
      LengthMin: values[0],
      LengthMax: values[1],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    setShowMoreFilters(false);
    e.preventDefault();
    setResponseData({
      Quizzes: [],
      Pages: 0,
      CurrentPage: 0,
    });
    setCurrentPage(0);
    fetchData();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  const toggleShowMoreFilters = (bottom?: boolean) => {
    if (showMoreFilters) {
      setSearchFormData({
        Name: '',
        ExcludedId: null,
        MainCategoryId: null,
        LengthMin: 1,
        LengthMax: 25,
        IsPrivate: null,
        ShowPlayed: true,
      });
    }

    bottom !== undefined && setShowBottomFilter(bottom);
    setShowMoreFilters(!showMoreFilters);
  };

  const handleExcludedIdChange = (selectElement: HTMLSelectElement) => {
    const { options } = selectElement;
    const selectedOptions = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => parseInt(option.value));
  
    setSearchFormData((prevState) => {
      const updatedExcludedId = removeDuplicates([...(prevState.ExcludedId || []), ...selectedOptions]);
  
      const updatedMainCategoryId =
        prevState.MainCategoryId !== null && updatedExcludedId.includes(Number(prevState.MainCategoryId))
          ? null
          : prevState.MainCategoryId;
  
      const finalExcludedId =
        updatedExcludedId.length === categories.length ? prevState.ExcludedId : updatedExcludedId;

      return {
        ...prevState,
        ExcludedId: finalExcludedId,
        MainCategoryId: updatedMainCategoryId,
      };
    });
  };

  const removeDuplicates = (array: number[]): number[] => {
    return array.filter((value, index, self) => self.indexOf(value) === index);
  };

  const handleRemoveExcludedCategory = (categoryId: number) => {
    setSearchFormData((prevState) => ({
      ...prevState,
      ExcludedId: prevState.ExcludedId?.filter((id) => id !== categoryId) || [],
    }));
  };

  const handleQuickJoin = () => {
    const fetchQuickJoinData = async () => {
      try {
        const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/quiz/quickjoin`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchFormData),
        });
        console.log(JSON.stringify(searchFormData, null, 2));
        const data: string = await response.text();
        
        if (response.ok) {
          window.location.href = `/quiz/${data}-u`;
        }else if(response.status === 400){
          setAutoGenerate(true);
        }else{
          console.log(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchQuickJoinData();
  };

  const closePopup = () => {
    setAutoGenerate(false);
  }

  const generateQuiz = () => {
    const fetchAutogenData = async () => {
      const autogenData = {
        Name: "Generated " + Math.trunc(Date.now() / 1000),
        ExcludedId: searchFormData.ExcludedId !== null ? searchFormData.ExcludedId : [],
        Length: searchFormData.LengthMin
      };
      try {
          console.log(JSON.stringify(autogenData, null, 2));
          const response = await customFetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/quiz/generateQuiz`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                  "Content-Type": "application/json",
              },
              body: JSON.stringify(autogenData),
          });
          const data = await response.json();
          if (response.status === 400) {
            console.log("error", response.text());
          }else if (response.ok){
            window.location.href = `/quiz/${data.Id}-u`
          }
          console.log(JSON.stringify(data, null, 2));
      } catch (error) {
          console.error("Error fetching data:", error);
      }
    };
    fetchAutogenData();
  }
  
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
      <div className="h-full w-[400px]"/>
        

        <div  className="w-full flex flex-col items-center">
            {/*FILTER FORM*/}

          <div className="w-full px-8">
            <form onSubmit={handleSubmit} className="my-4 h-min w-full">

              <div ref={divRef} className="drop-shadow-[20px_13px_0px_rgba(0,0,0,1)]">
                <div className="relative">
                  {/*QUIZ NAME SEARCH BAR*/}
                  <div className="text-sm font-bold bg-slate-500 w-full">
                    <input
                      type="text"
                      name="Name"
                      value={searchFormData.Name}
                      onKeyDown={handleKeyDown}
                      onChange={handleInputChange}
                      className="p-8 text-2xl border-8 border-black bg-slate-500 h-full w-full placeholder-white text-white font-silkscreen outline-none"
                      placeholder="SEARCH"
                    />
                  </div>


                  <div onClick={handleSubmit} className="hover:cursor-pointer w-max position absolute top-[13px] right-4">
                    <img className="w-[85px] h-[85px]" src={SearchIcon}/>
                  </div>

                </div>

                {/*FILTER VISIBILITY TOGGLE*/}
                {!showMoreFilters && (
                  <div onClick={() => toggleShowMoreFilters(false)} className="p-2 hover:cursor-pointer hover:bg-indigo-500 transition duration-300 w-max bg-slate-500 border-8 border-black mt-2 flex items-center justify-center">
                    <p className="text-xl text-black text-white font-silkscreen pr-2">FILTERS</p>
                    <img className="rotate-180 w-[50px] h-[50px] mx-2" src={Arrow} alt=""/>
                  </div>
                )}
              </div>

              {/*DROPDOWN FILTERS*/}

              {showMoreFilters && (
                
                <div 
                  className='my-8 border-8 border-black p-4 shadow-[20px_13px_0_3px_rgba(0,0,0,1)] font-silkscreen relative' 
                  style={{
                    bottom: showBottomFilter === true && window.innerHeight > 850 ? -window.innerHeight + 850 : 0,
                    backgroundColor: showBottomFilter ? '#6366f1' : '#64748B'
                    }}>

                  {/*CHOOSE A MAIN CATEGORY*/}
                  <div className="mb-4">
                    <div className="block text-lg font-bold mb-2">
                      <p className="text-white">Choose a main category:</p>
                      
                      <select
                        name="MainCategoryId"
                        value={searchFormData.MainCategoryId || ''}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border-4 border-black rounded-md w-full shadow-[8px_4px_0_0_rgba(0,0,0,1)]"
                      >
                        <option value="">Select a category</option>
                        {categories
                          .filter((category) => !searchFormData.ExcludedId?.includes(category.Id)) // Filter out excluded categories
                          .map((category) => (
                            <option key={category.Id} value={category.Id}>
                              {category.Name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>


                  {/*EXCLUDE CATEGORY*/}
                  <div>
                    <div className="block text-black text-lg font-bold mb-2">
                      <p className="text-white">Choose categories to exclude:</p>
                      <select
                        name="ExcludedId"
                        value={[]}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleExcludedIdChange(e.target)}
                        multiple
                        className="my-1 px-4 py-2 border-4 border-black rounded-md w-full shadow-[8px_4px_0_0_rgba(0,0,0,1)]"
                      >
                        {categories.map((category) => (
                          <option
                            className="my-1"
                            key={category.Id}
                            value={category.Id}
                            disabled={
                              searchFormData.ExcludedId?.includes(category.Id) || 
                              (searchFormData.MainCategoryId !== null && category.Id === searchFormData.MainCategoryId)
                            }
                            style={{
                              color: (searchFormData.ExcludedId?.includes(category.Id) || 
                                (searchFormData.MainCategoryId !== null && category.Id === searchFormData.MainCategoryId)) ? '#d3d3d3' : '',
                            }}
                          >
                            {category.Name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/*REMOVE EXCLUDED CATEGORY LIST*/}
                    <div className="flex flex-wrap">
                      {searchFormData.ExcludedId?.map((categoryId) => (
                        <div key={categoryId} className="flex flex-col items-center mr-2 mb-2 rounded-md text-black border-4 border-black bg-gray-300 p-2 font-bold shadow-[3px_4px_0_0_rgba(0,0,0,0.8)]">
                          <span className="mr-2">{categories.find((c) => c.Id === categoryId)?.Name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExcludedCategory(categoryId)}
                            className="text-buttonred hover:text-red-400 transition duration-300 underline"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/*LENGTH INPUT*/}
                  <p className="text-white font-bold text-xl">Number of questions:</p>
                  <div className="w-full flex justify-center items-center">
                    <Slider
                      className="mt-2 p-2 mx-2 rounded-md w-[98%] h-[70px]  items-center flex max-w-[2500px]"
                      value={[searchFormData.LengthMin, searchFormData.LengthMax]}
                      onChange={handleSliderChange}
                      renderThumb={(props, state) => (
                        <div {...props} className="bg-white border-2 rounded-md border-black p-1 w-[60px] h-[50px] text-2xl shadow-[3px_4px_0_0_rgba(0,0,0,0.8)] outline-none hover:cursor-grab flex items-center justify-center">
                          {state.valueNow}
                        </div>
                      )}
                      renderTrack={(props, state) => (
                        <div
                          {...props}
                          className={`${state.index === 0 ? 'bg-yellow-500 border-4 border-black ' : ''} h-[25px] w-full`}
                        />
                      )}
                      min={1}
                      max={25}
                    />
                    
                  </div>
                  

                {/*QUIZ PASSWORD TOGGLE*/}
                {!showBottomFilter && (
                  <div className="block text-sm font-bold mb-2">
                    <p className="text-white text-xl">Private:</p>
                    <select
                      name="IsPrivate"
                      value={searchFormData.IsPrivate === null ? 'all' : searchFormData.IsPrivate.toString()}
                      onChange={handleInputChange}
                      className="mt-1 p-2 border-4 border-black rounded-md w-full shadow-[3px_4px_0_0_rgba(0,0,0,0.8)] bg-white text-xl"
                    >
                      <option value="all">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                )}

                {/*SHOW PREVIOUSLY PLAYED QUIZZES*/}
                  <div className="block text-sm font-bold my-5 flex">
                    <p className="text-white text-xl inline my-1">{!showBottomFilter ? 'Show previously played quizzes:' : 'Quick join previously played quizzes:'}</p>
                    <div
                      onClick={() =>
                        handleCheckboxChange({
                          target: { name: 'ShowPlayed', checked: !searchFormData.ShowPlayed },
                        } as React.ChangeEvent<HTMLInputElement>)
                      }
                      className={`text-xl border-4 border-black px-2 bg-white hover:cursor-pointer select-none shadow-[3px_4px_0_0_rgba(0,0,0,0.8)] rounded-md w-[230px] text-center ${
                        searchFormData.ShowPlayed ? 'text-indigo-500' : 'text-buttonred'
                      }`}
                    >
                      {searchFormData.ShowPlayed === true ?
                        (showBottomFilter ? "join" : "show") 
                        : 
                        (showBottomFilter ? "don't join" : "don't show")
                      }
                    </div>
                  </div>


                {/*CLOSE FILTER DROPDOWN*/}
                  <div 
                    onClick={() => toggleShowMoreFilters()} 
                    className="p-2 hover:cursor-pointer hover:bg-red-800 transition duration-300 w-min bg-buttonred border-4 border-black position absolute right-4 bottom-2 shadow-[3px_4px_0_0_rgba(0,0,0,0.8)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="square" strokeLinejoin="bevel" d="M6 18 18 6M6 6l12 12" />
                    </svg>

                  </div>
                      {!showBottomFilter &&
                        <button
                          type="submit"
                          className="bg-white hover:bg-gray-300 transition duration-300 text-black border-4 border-black font-bold py-2 px-4 rounded-md shadow-[3px_4px_0_0_rgba(0,0,0,0.8)]"
                        >
                          Search
                        </button>
                      }
                  </div>
              )}

              {/*SUBMIT FORM BUTTON*/}
              
            </form>
          </div>
          

          {/*END OF FILTER FORM*/}

            {/*MAIN CONTENT DIV*/}
            {!showMoreFilters && (
            <div className="mr-1">

              

                {/*QUIZ  COMPONENT RENDERING*/}

                <div style={{width:  divRef.current ? divRef.current.offsetWidth : ''}}>
                  {responseData && <QuizCarousel quizzes={responseData.Quizzes}></QuizCarousel>}
                </div>

                {/*LOAD MORE BUTTON*/}

              {responseData && (responseData.Pages - 1) > responseData.CurrentPage && (
                <div className="w-full flex justify-center mt-2">
                  <div onClick={loadMoreQuizzes} className="hover:cursor-pointer hover:bg-amber-500 transition duration-300 font-silkscreen font-bold m-1 p-2 h-max rounded-md bg-indigo-500 border-4 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]">
                    <p className="border-4 border-black p-2 bg-gray-200 select-none">Load more</p>
                  </div>
                </div>
              )}

            </div>
            )}

              {autoGenerate && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 font-silkscreen z-10">
                    <div className="bg-white max-w-[65%] p-8 flex flex-col items-center justify-center border-8 border-black shadow-[0px_0px_0_8px_rgba(99,102,241,1)]">
                        <p className="text-3xl font-bold mb-4 text-center">No quizzes match your parameters</p>
                        <p className="text-xl text-center">Would you like to automatically generate a quiz with these parameters?</p>
                        <button
                            onClick={generateQuiz}
                            className="mt-4 px-6 border-4 border-black py-2 bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 focus:outline-none shadow-[5px_5px_0_0px_rgba(0,0,0,1)]"
                        >
                            Yes, generate it!
                        </button>
                        <button
                            onClick={closePopup}
                            className="mt-4 px-6 border-4 border-black py-2 bg-indigo-500 text-white hover:bg-indigo-700 transition duration-300 focus:outline-none shadow-[5px_5px_0_0px_rgba(0,0,0,1)]"
                        >
                            No thanks.
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-grow"/>

            {/*QUICK JOIN*/}

              <div className="justify-center flex my-4 bg-indigo-500 drop-shadow-[20px_13px_0px_rgba(0,0,0,0.8)] relative">
              {!showMoreFilters && (
                <button className="w-[100px] h-[100px] bg-indigo-500 hover:bg-amber-500 transition duration-300 absolute left-[-110px] bottom-[15px]" onClick={() => toggleShowMoreFilters(true)}>
                  <img className="top-[23px] left-[17px] w-[50px] h-[50px] mx-2 absolute" src={Arrow} alt=""/>
                  <img
                      src={QuickJoinFilterGraphic}
                      alt="Quick Join Filters"
                      className="w-[100px] h-[100px]"
                    />
                  
                </button>
              )}
                <button onClick={handleQuickJoin} className="h-max relative hover:bg-amber-500 text-white hover:text-black transition duration-300">
                  <div className="relative">
                    <img
                      src={QuickJoinGraphic}
                      alt="Quick Join"
                      className="w-[360px] h-[130px]"
                    />
                    <p className="font-silkscreen absolute inset-0 flex items-center justify-center text-2xl">Quick Join</p>
                  </div>
                </button>
              </div>



            {/*ADD QUIZ BUTTON*/}
          <AddQuizButton />
          <AddQuestionButton />

          
        </div>
        
      </div>
    </div>
  );
};

export default Home;
