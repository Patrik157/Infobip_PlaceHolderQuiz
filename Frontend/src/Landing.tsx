import React, { useState, useEffect } from 'react';
import logo from './assets/thelogo.png';
import landing from './assets/question_card_white.png';
import ans from './assets/answer_blank.png';
import shard from './assets/Rectangle 17.svg';
import LoginForm from './LoginForm';
import repeatable1 from "./assets/maybe.png";

interface responseData {
  text: string;
  answer: string;
}

const Landing: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  const [fetchCheck, setFetchCheck] = useState<boolean>(false);
  const [imgSource, setImgSource] = useState(landing);
  const [ansImg, setAnsImg] = useState<any>(null);
  const [landingImg, setLandingImg] = useState<any>(null);
  const [fetchedData, setFetchedData] = useState<responseData | null>(null);

  const imgClick = () => {
    setClicked(true);

    setTimeout(() => {
      if (imgSource === landing) {
        setImgSource(ans);
      }else{
        setFetchCheck(!fetchCheck);
        setImgSource(landing);
      }
    }, 500);

    setTimeout(() => {
      setClicked(false);
    }, 1000);
  };

  const fetchData = async () => {
    try {
        const response = await fetch(`https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Question/Landing`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        setFetchedData(data);
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchCheck]);

  

  useEffect(() => {
    const landingimgcached = new Image();
    landingimgcached.src = landing;
    landingimgcached.onload = () => {
      setLandingImg(landingimgcached);
    }
    const ansimgcached = new Image();
    ansimgcached.src = ans;
    ansimgcached.onload = () => {
      setAnsImg(ansimgcached);
    }
  }, []);
    
  const flippy = `w-[45%] max-w-[450px] h-max z-20 drop-shadow-[-60px_80px_0px_rgba(0,0,0,1)] hover:cursor-pointer ${clicked ? 'animate-rotate-y' : 'animate-left-right'}`

  return (
    <div className='bg-gradient-to-r from-yellow-500 via-purple-500 to-blue-500 background-animate'>
      <div 
        className='flex w-screen h-screen' 
        style={{
        backgroundImage: `url(${repeatable1})`,
        backgroundSize: '600px 600px',
        backgroundPosition: 'top right',
        backgroundRepeat: 'repeat',
      }}>

        <div className='h-screen w-1/2 relative flex items-center justify-center'>
          <img src={shard} className='absolute top-0 left-0 w-full h-full z-10' alt=""></img>
          <div className={flippy}>
            {<img className='w-full z-20' src={imgSource === ans && ansImg !== null ? ansImg.src : (imgSource === landing && landingImg !== null ? landingImg.src : imgSource)} onClick={clicked ? undefined : imgClick} alt="question card"/>}
            {imgSource === ans &&
            <div className='absolute flex items-center justify-center top-0 w-full h-[40%]' onClick={clicked ? undefined : imgClick}>
              <p className='font-silkscreen font-bold text-xl text-center text-black w-[80%]'>{fetchedData ? fetchedData.text : 'What is the least densely populated country in the world?'}</p>
            </div>}
            {imgSource === ans &&
            <div className='absolute flex items-center justify-center bottom-0 w-full h-[60%]' onClick={clicked ? undefined : imgClick}>
              <p className='font-silkscreen text-xl text-center text-black w-[80%]'>{fetchedData ? fetchedData.answer : 'Greenland!'}</p>
            </div>}
          </div>
          
        </div>

        <div className='h-screen self-end w-1/2 flex justify-center items-center flex-col space-y-0'>
          <div className='w-full h-auto flex justify-center items-center flex-col mb-20'>
            <p className='text-7xl 2xl:text-9xl font-semibold font-silkscreen text-buttonred outlined-text drop-shadow-[7px_7px_0px_rgba(0,0,0,1)]'>QuizMania</p>
            <p className='text-2xl text-white font-silkscreen mt-2'>Welcome to Quizmania</p>
          </div>

          <LoginForm />

        </div>
        <div className='absolute top-0 right-0 mt-4 mr-4'>
          <img src={logo} className='h-12 w-auto' alt="logo"></img>
        </div>

      </div>
    </div>
    
  );
};

export default Landing;
