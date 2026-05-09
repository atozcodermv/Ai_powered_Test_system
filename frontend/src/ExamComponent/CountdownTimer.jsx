import React, { useState, useEffect } from "react";
  const CountdownTimer = ({ endTime, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(endTime * 60);
    console.log('Duration : ', endTime) ; 
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
             clearInterval(timer);
             if (onComplete) {
                onComplete();
             }
             return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }, [onComplete]); 
  
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
      <div>

     <p>
        
        Time Remaining: {minutes}{" "}
        minutes, {seconds} seconds
       </p>
        
       
      </div>
    );
  };
  
export default CountdownTimer;
