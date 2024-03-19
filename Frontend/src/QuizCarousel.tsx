import React from 'react';
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import QuizComponent from './QuizComponent';

interface Quiz {
  Id: number;
  Name: string;
  Description: string;
  IsPrivate: boolean;
  MainCategory: Category;
  Length: number;
  Owner: string;
}

interface Category {
  Id: number;
  Name: string;
}

interface QuizCarouselProps {
  quizzes: Quiz[];
  scores?: number[] | null;
}

const QuizCarousel: React.FC<QuizCarouselProps> = ({ quizzes, scores = null }) => {
    const responsive = {
        ultrawide: {
            breakpoint: { max: 9999999, min: 3300 },
            items: 5,
            slidesToSlide: 5
          },
        highres: {
            breakpoint: { max: 3299, min: 2700 },
            items: 4,
            slidesToSlide: 4
          },
        desktop: {
          breakpoint: { max: 2699, min: 1920 },
          items: 3,
          slidesToSlide: 3
        },
        tablet: {
          breakpoint: { max: 1919, min: 1300 },
          items: 2,
          slidesToSlide: 2
        },
        mobile: {
          breakpoint: { max: 1299, min: 0 },
          items: 1,
          slidesToSlide: 1
        }
      };
   
    return (
        
        <Carousel
            swipeable={false}
            draggable={true}
            showDots={true}
            responsive={responsive}
            ssr={true}
            infinite={false}
            autoPlaySpeed={1000}
            keyBoardControl={true}
            containerClass="carousel-container"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style"
            itemClass="carousel-item-padding-40-px"
        >
        {quizzes.map((quiz, index) => (
          <div key={quiz.Id} className="flex mx-1 mb-4 h-min justify-center">
            <QuizComponent quiz={quiz} score={scores ? scores[index] : null} />
          </div>
        ))}
      </Carousel>
    );
  };

export default QuizCarousel;