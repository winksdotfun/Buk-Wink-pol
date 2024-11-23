
import first from '../assets/updated/bg.png';
import buk from '../assets/updated/buk.png';
import step from '../assets/updated/step.png'
import step1 from '../assets/updated/step1.png'
import arrow from '../assets/updated/arrow.png'
import step2 from '../assets/updated/step2.png'
// import WalletConnect from './Signer';
import { useEffect, useState } from "react";
import axios from "axios";

const StepTwo = ({ onNavigate, onBack, bookingData, nftData, optionHash, setQuoteHash, selectedRate }) => {
  const [quoteData, setQuoteData] = useState(null);
  const [roomImage, setRoomImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    const fetchBookingData = async () => {
      if (nftData) {
        try {
          const response = await axios.get(
            `https://api.prawasa.com/v2/hotel/getNFTBooking?tokenId=${nftData}`
          );
          const data = response.data;
          console.log("getNFTBooking 2 ",data);

          const tokenID = nftData;

          if (data && data.status === true) {
            // Find the image with mainImage set to true and set roomImage
            const mainImage = data.data.booking.property.images.find(
              (image) => image.mainImage === true
            );
            if (mainImage) {
              setRoomImage(mainImage.hdUrl); // Set the roomImage to the hdUrl
              console.log(roomImage);
            }
          }
        } catch (error) {
          console.error("Error fetching NFT booking details:", error);
        }
      }
    };

    fetchBookingData();
  }, [nftData]);

  console.log('====================================');
  console.log(optionHash);
  console.log('====================================');


  useEffect(() => {
    const fetchQuoteData = async () => {
      const token = localStorage.getItem("accessToken");
      console.log("access token", token)


      console.log("before checking quote", token );
      console.log("before checking quote", bookingData?.hash );
      console.log("before checking quote", optionHash );
      

      // Check that all required data is present before proceeding
      if (
        token &&
        bookingData?.hash &&
        optionHash
      ) {
        const { hash } = bookingData;
        sessionStorage.setItem("bookingHash", hash);
        console.log("ertyui", hash)

        // const optionHash = bookingData.rooms[0].rates[0].optionHash;
        const OptHash = optionHash
        sessionStorage.setItem("optionHash", OptHash)

        const discountCoupon = selectedRate?.discount?.discountCoupon;
        sessionStorage.setItem("discountCoupon", discountCoupon)

        try {
          const response = await axios.get(
            `https://api.prawasa.com/v2/hotel/getQuote?hash=${hash}&optionHash=${OptHash}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data;
          console.log('====================================');
          console.log("get Quote", data);
          console.log('====================================');

          const hotelCode = data?.hotelCode;
          sessionStorage.setItem("hotelCode", hotelCode)
          console.log("hotelcode", hotelCode)
          // const totalPrice = data.price?.totalWithDiscount;
          // console.log("Total:", totalPrice)
          setQuoteData("quote res",data);
          // setTotalPrice(totalPrice);
          const QuoteHash = data.hash;
          console.log("quotehash", QuoteHash)
          setQuoteHash("hash", QuoteHash);
          sessionStorage.setItem("quoteHash", QuoteHash);

        } catch (error) {
          console.error("Error fetching hotel quote:", error); // Handle errors
        }
      } else {
        console.warn("Access token is missing or booking data is incomplete.");
      }
    };

    // Call the function to fetch data once when conditions are met
    fetchQuoteData();
  }, [bookingData]);

  const handleNext = () => {
    // Reset the error message
    setErrorMessage('');

    // Validate inputs
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Please enter your First Name and Last Name.');
      return; // Stop if validation fails
    }

    // Call onNavigate if validation passes
    onNavigate();
  };

  useEffect(() => {
    const storedFirstName = sessionStorage.getItem("firstName");
    const storedLastName = sessionStorage.getItem("lastName");

    if (storedFirstName) setFirstName(storedFirstName);
    if (storedLastName) setLastName(storedLastName);
  }, []);

  // Update sessionStorage whenever firstName or lastName changes
  useEffect(() => {
    sessionStorage.setItem("firstName", firstName);
  }, [firstName]);

  useEffect(() => {
    sessionStorage.setItem("lastName", lastName);
  }, [lastName]);





  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] sm:w-[300px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
        {/* Background Image Division */}
        <div
          className="relative md:w-[485px] md:h-[230px] sm:h-[120px] sm:w-[280px] p-6 flex flex-col justify-between rounded-md border border-red-600/70 shadow-red-600/80 shadow-sm"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="md:ml-[330px] sm:ml-[200px]">
            <img
              src={buk}
              alt="buk"
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[20px]"
            />
          </div>
        </div>

        {/* Content Division */}
        <div className="bg-[#161616] w-full flex flex-col items-center sm:pt-3">
          {/* Progress Steps */}
          <div className="">
            <div className="flex">
              <div className="flex ml-[-15px]">
                <div className="text-white flex">
                  <img
                    src={step2}
                    alt="step 1"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 1
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step}
                    alt="step 2"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 2
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step1}
                    alt="step 3"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2 text-[#B1B1B1]">
                    Step 3
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col items-center md:mt-2 sm:mt-2 w-full">
            {/* <WalletConnect /> */}

            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-[#373737] bg-[#222222] sm:text-xs md:text-md rounded-md md:p-2 md:py-2 sm:py-1 mb-2 w-[70%] max-w-[400px] focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-[#373737] bg-[#222222] sm:text-xs md:text-md rounded-md md:p-2 md:py-2 sm:py-1 md:mb-2 sm:mb-0 w-[70%] max-w-[400px] focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center"
            />
            {errorMessage && (
              <p className="text-red-500 text-xs">{errorMessage}</p>
            )}
            <ul className="list-disc list-inside text-[#FFC4BB] md:text-xs sm:text-[10px] md:mb-2 sm:mb-2">
              <li>
                <span className="ml-[-6px]">
                  Name should match govt ID proof
                </span>
              </li>
            </ul>
            <div className="flex w-full items-center justify-center pb-2">
              <img
                src={arrow}
                alt="arrow"
                className="md:w-9 md:h-9 sm:w-6 sm:h-6 mr-4 cursor-pointer"
                onClick={onBack}
              />
              <button
                className="bg-[#CA3F2A] sm:text-xs text-white md:px-[110px] sm:px-[68px] md:py-1 sm:py-1 rounded-md md:text-lg border-[#FFE3E3] border border-opacity-50"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo