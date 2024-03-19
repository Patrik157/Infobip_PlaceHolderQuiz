import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import eyeIconOpen from './assets/eyeOpen.svg';
import eyeIconClosed from './assets/eyeClosed.svg';

interface FormInput {
  Username?: string;
  Email: string;
  Password: string;
  ConfirmPassword?: string;
}


const LoginForm: React.FC = () => {
  const [showEye, setShowEye] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [buttonText, setButtonText] = useState('SIGN IN');
  const [endpoint, setEndpoint] = useState('https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/login');
  const [divHeight, setDivHeight] = useState('30%');
  const [verifyEmail, setVerifyEmail] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, handleSubmit, reset, watch } = useForm<FormInput>();

  const divRef = useRef<HTMLDivElement>(null);

  const submitVerify = async (data: string) => {
    try {
      const requestData = {
        ConfirmationCode: data,
      };

      console.log('Submitting Form Data:', requestData);

      const response = await fetch('https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/verifyEmail', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 200) {
        console.log('verified');
        setVerifyEmail(false);
      } else {
        console.log('verify issue');
        alert('the code is incorrect');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const submitForm = async (data: FormInput) => {
    try {
      const requestData: FormInput = {
        Email: data.Email,
        Password: data.Password,
      };

      if (showExtraFields) {
        requestData.Username = data.Username;
      }

      console.log('Submitting Form Data:', requestData);

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const logResponse = await response.text();

      console.log(logResponse, response.status);

      if ((endpoint === 'https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/register' && response.status === 200) || logResponse === 'verify') {
        setVerifyEmail(true);
      } else if (response.status === 200 && endpoint === 'https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/login') {
        console.log('Authentication successful:', logResponse);
        window.location.href = '/';
      } else {
        console.log('Authentication failed:', logResponse);
        alert('nope');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowEye(!showEye);
    setShowPassword(!showPassword);
  };

  const toggleFieldsAndButtonText = () => {
    reset();
    setShowExtraFields(!showExtraFields);
    setButtonText(showExtraFields ? 'SIGN IN' : 'SIGN UP');
    setEndpoint(
      showExtraFields
        ? 'https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/login'
        : 'https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/register'
    );
  };

  useEffect(() => {
    setDivHeight(showExtraFields ? '45%' : '30%');
  }, [showExtraFields]);

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };

  const submitVerificationCode = async () => {
    if (verificationCode.length === 6) {
      await submitVerify(verificationCode);
    } else {
      alert('Please enter a 6-character verification code.');
    }
  };

  const renderVerificationForm = () => (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-70 z-50">
      <div className="flex bg-indigo-500 p-8 rounded-md shadow-md w-full h-full max-h-[200px] max-w-[800px] border-8 border-slate-300">
        <input
          className='h-full text-2xl w-full outline-none border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]'
          placeholder='Enter 6-character verification code'
          value={verificationCode}
          onChange={handleVerificationCodeChange}
        />
        <button
          type='button'
          onClick={submitVerificationCode}
          className='h-full bg-buttonred border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] hover:cursor-pointer text-3xl font-bold'
        >
          Verify Email
        </button>
      </div>
    </div>
  );

  return (
    <div id='parent' className='flex flex-col items-center w-[55%] 2xl:w-[45%]' style={{ height: divHeight }}>
      {verifyEmail ? (
        renderVerificationForm()
      ) : (
        <div className='flex flex-col items-center w-full h-full'>
            <form
                className='flex flex-col w-full h-full bg-white border-4 border-black p-2 rounded-md shadow-[3px_3px_0_3px_rgba(0,0,0,0.8)]'
                onSubmit={handleSubmit(submitForm)}
            >
              {showExtraFields && (
                <input
                  className='h-[30%] my-1 outline-none p-1 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] 2xl:text-2xl xl:text-xl text-lg'
                  {...register('Username', { required: true })}
                  placeholder='username'
                />
                )}
                <input
                    className='h-[30%] mt-1 p-1 outline-none border-2  border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] 2xl:text-2xl xl:text-xl text-lg'
                    {...register('Email', { required: true })}
                    placeholder='email@email.com'
                />

                <div className='relative mt-2 h-[30%]'>
                    <input
                    className='h-full w-full outline-none eyegone p-1 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] 2xl:text-2xl xl:text-xl text-lg pr-[9%]'
                    type={showPassword ? 'text' : 'password'}
                    {...register('Password', { required: true })}
                    placeholder='password'
                    />
                    <button type='button' className='absolute inset-y-[25%] right-0 mx-3 w-[7%] h-1/2' onClick={togglePasswordVisibility}>
                    <img src={showEye ? eyeIconOpen : eyeIconClosed} alt='toggle password visibility icon' className='h-full w-full' />
                    </button>
                </div>

                {showExtraFields && (
                    <div ref={divRef} className='h-[30%] w-full mt-2 relative'>
                      <input
                        className='h-full w-full outline-none no-arrows p-1 border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)] 2xl:text-2xl xl:text-xl text-lg'
                        type='password'
                        {...register('ConfirmPassword', { required: true })}
                        placeholder='confirm password'
                        onChange={handleConfirmPasswordChange}
                      />
                      {confirmPassword !== '' && watch('Password') !== confirmPassword && (
                        <div className='absolute flex items-center bottom-[2px] left-[-470px] bg-indigo-500 px-4 border-4 border-gray-200 shadow-[8px_8px_0_2px_rgba(0,0,0,1)]'
                          style={{height: divRef.current?.offsetHeight}}
                        >
                          <p className='text-gray-200 font-silkscreen text-lg'>Passwords do not match</p>
                        </div>
                      )}
                    </div>
                )}
            <input
              className={`h-[30%] mt-6 ${confirmPassword !== '' && watch('Password') !== confirmPassword ? 'bg-gray-400 hover:cursor-not-allowed' : 'bg-buttonred hover:cursor-pointer hover:bg-red-800 transition duration-300'} border-2 border-black shadow-[3px_3px_0_2px_rgba(0,0,0,0.8)]  2xl:text-3xl xl:text-2xl text-xl font-bold`}
              type='submit'
              value={buttonText}
              disabled={confirmPassword !== '' && watch('Password') !== confirmPassword}
            />
            </form>
            <p onClick={toggleFieldsAndButtonText} className='underline pt-3 cursor-pointer text-xl font-bold text-white'>
                {showExtraFields ? 'Already have an account? Sign in!' : "Don't have an account? Sign up!"}
            </p>
        </div>
      )}
    </div>
  );
};

export default LoginForm;