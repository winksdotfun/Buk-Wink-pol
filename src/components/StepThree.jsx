import React, { useState, useEffect } from "react";
import first from "../assets/updated/bg.png";
import buk from "../assets/updated/buk.png";
import step from "../assets/updated/step.png";
import arrow from "../assets/updated/arrow.png";
import step2 from "../assets/updated/step2.png";
import { buyRoom } from "../ContractIntegration";
import axios from "axios";
import SucessConfirmation from "./SucessConfirmation";
import Cancelled from "./Cancelled";
import Resold from "./Resold";

const StepThree = ({ onNavigate, onBack, totalPrice, tokenID, nftData, propertyId, quoteHash, userInfo }) => {
  const [isLoading, setIsLoading] = useState(false);
  const _tokenId = tokenID;
  const [roomImage, setRoomImage] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [navigateTo, setNavigateTo] = useState(null); // New navigation state

  const QuoteHash = sessionStorage.getItem("quoteHash");

  const hotelCode = sessionStorage.getItem("hotelCode");

  const firstName = sessionStorage.getItem("firstName");

  const surName = sessionStorage.getItem("lastName");

  const userMail = sessionStorage.getItem("email");

  const countryCode = sessionStorage.getItem('countryCode');

  const phoneNumber = sessionStorage.getItem('phone');

  const hash = sessionStorage.getItem("Hash");

  const remark = sessionStorage.getItem("remarks")


  const user = localStorage.getItem("user");

  const discountCoupon = sessionStorage.getItem("discountCoupon");

  const checkIn = sessionStorage.getItem("checkIn");
  const checkOut = sessionStorage.getItem("checkOut");
  
  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString); // Convert the string to Date object
    const formattedDate = new Intl.DateTimeFormat('en-CA').format(date); // Format it to YYYY-MM-DD
    return formattedDate;
  };
  
  // Apply the formatDate function
  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);
  
  console.log("Formatted Check-In Date:", formattedCheckIn); // 2024-11-20
  console.log("Formatted Check-Out Date:", formattedCheckOut); // 2024-11-20
  
  const occupancyId = sessionStorage.getItem("occuId")

  const token = localStorage.getItem("accessToken"); 
  
  const optionHash = sessionStorage.getItem("optionHash");
  const bookingHash = sessionStorage.getItem("bookingHash")
  const CheckIn = sessionStorage.getItem("CheckIn")
  const CheckOut = sessionStorage.getItem("CheckOut")

  // const checkInDat = sessionStorage.getItem("checkInDate")

  console.log('====================================');
  console.log("prop", hotelCode);
  console.log("quotehash", QuoteHash);
  console.log("holder", "fname", firstName, "surname", surName);
  console.log("usermail", userMail);
  console.log("country code", countryCode);
  console.log("phNumber", phoneNumber);
  console.log("hash", hash);
  console.log("remark", remark);
  console.log("user", user);
  console.log("coupon", discountCoupon);
  console.log("checkin", formattedCheckIn);
  console.log("checkout", formattedCheckOut);
  console.log(userInfo);
  console.log(nftData);
  console.log("occId",occupancyId);
  console.log(token);
  // console.log("txId", txId);
  console.log("optid",optionHash);
  console.log("hash",bookingHash);
  console.log('====================================');


  useEffect(() => {
    const fetchBookingData = async () => {
      if (nftData) {
        try {
          const response = await axios.get(
            `https://api.polygon.dassets.xyz/v2/hotel/getNFTBooking?tokenId=${nftData}`
          );
          const data = response.data;
          console.log(data);

          const tokenID = nftData;

          const remarks = data.data.roomRemarks.specialInstructions || "nil";
          sessionStorage.setItem("remarks", remarks);

          const user = data.data.booking.user;
          localStorage.setItem("user", user);

          const hash = data.data.booking.hash;
          sessionStorage.setItem("Hash", hash)

          if (data && data.status === true) {
            setBookingData(data);
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


  const checkInDate = bookingData?.data?.checkIn
    ? new Date(bookingData.data.checkIn)
    : null;
  const formattedDateCheckIn = checkInDate
    ? checkInDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "";

  const checkOutDate = bookingData?.data?.checkOut
    ? new Date(bookingData.data.checkOut)
    : null;
  const formattedDateCheckOut = checkOutDate
    ? checkOutDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    : "";



// Main function to handle booking
const handleBuyRoom = async () => {
  if (isLoading) return; // Prevent duplicate requests
  setIsLoading(true);
  console.log("Processing...");

  // Retrieve the token from localStorage
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("Authorization token is missing.");
    setIsLoading(false);
    return;
  }

  if (_tokenId) {
    try {
      // Call the buyRoom function (presumed to interact with blockchain separately)
      console.log("tokenid",_tokenId);
      const buyRoomSuccess = await buyRoom(_tokenId);
      const userAddress = sessionStorage.getItem("userAddress");
      const txId = sessionStorage.getItem('transactionId');

      console.log("buy room success || tx id",buyRoomSuccess)
      // console.log("buy room succses", buyRoomSuccess);
      
      if (!buyRoomSuccess) {
        throw new Error("Failed to complete buyRoom transaction.");
      }

      // If buyRoom transaction succeeds, prepare booking parameters
      const bookingParams = {
        propertyId: hotelCode,
        quoteHash: QuoteHash,
        holder: {
          name: firstName,
          surname: surName,
        },
        remarks: "",
        rooms: [
          {
            occupancyId: Number(nftData),
            bookingId: Number(nftData),
            paxes: [
              {
                "age": 99,
                "name": "Cypher",
                "surname": "Punk",
                "title": "Mr"
            },
            {
                "age": 99,
                "name": "Byte",
                "surname": "Ziro",
                "title": "Mrs"
            }
            ],
          },
        ],
        email: userMail,
        checkIn: formattedCheckIn,
        checkOut: formattedCheckOut,
        phone: {
          countryCode: countryCode,
          number: phoneNumber,
        },
        // hash and user address of current buyer
        hash: txId,
        user: userAddress,
        // hash and user address of seller
        // hash: hash,
        // user: user,
        discountCoupon: "",
        ip: "",
      };

      // Set headers with the token
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Call the createBooking API
      const response = await axios.post(
        "https://api.polygon.dassets.xyz/v2/hotel/createBooking",
        bookingParams,
        { headers }
      );

      console.log("Booking created successfully:", response.data);
      setNavigateTo("success");
    } catch (error) {
      console.error("Error in buyRoom or createBooking:", error);
      setNavigateTo("resold");
    } finally {
      setIsLoading(false);
    }
  } else {
    console.error("Token ID is not set.");
    setIsLoading(false);
  }
};

const handleBuyRoomClick = () => {
  if (!isLoading) {
    handleBuyRoom();
  }
};



  // Conditional redirection based on navigateTo state
  if (navigateTo === "success") {
    return <div><SucessConfirmation nftData={nftData} tokenID={tokenID} /></div>; // Replace with your success component
  } else if (navigateTo === "resold") {
    return <div><Resold nftData={nftData} tokenID={tokenID} /></div>; // Replace with your error/resold component
  }

  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] md:h-[500px] sm:h-[350px] sm:w-[300px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
        <div
          className="relative md:w-[485px] md:h-[230px] sm:h-[120px] sm:w-[280px]  p-6 flex flex-col justify-between rounded-md border border-red-600/70 shadow-red-600/80 shadow-sm"
          style={{
            backgroundImage: `url(${roomImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="md:ml-[330px] sm:ml-[200px]">
            <img
              src={buk}
              alt=""
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[20px]"
            />
          </div>

          <div className="md:mt-48 sm:mt-24">
            <div className="flex">
              <div className="flex ml-[-15px]">
                <div className="text-white flex">
                  <img
                    src={step2}
                    alt=""
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
                    src={step2}
                    alt=""
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
                    src={step}
                    alt=""
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 3
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:mt-9 sm:mt-2">
              <p className="text-center text-white md:text-sm sm:text-xs font-light md:mb-5 sm:mb-1">
                You're purchasing Superior room at the{" "}
                {bookingData?.data?.booking?.property?.address?.address ||
                  "unknown address"}
                ,{" "}
                {bookingData?.data?.booking?.property?.address?.city ||
                  "unknown city"}
                ,{" "}
                {bookingData?.data?.booking?.property?.address?.country ||
                  "unknown country"}{" "}
                from <br />
                {formattedDateCheckIn} to {formattedDateCheckOut} <br /> for
                USDC {totalPrice} for 2 guests.
              </p>

              <div className="flex w-full items-center justify-center pb-2 sm:mt-2">
                <img
                  src={arrow}
                  alt=""
                  className="md:w-9 md:h-9 sm:w-6 sm:h-6 mr-4 cursor-pointer"
                  onClick={onBack}
                />
                <button
                  className="bg-[#CA3F2A] sm:text-xs text-white md:px-[110px] sm:px-[68px] md:py-1 sm:py-1 rounded-md md:text-lg border-[#FFE3E3] border border-opacity-50"
                  onClick={handleBuyRoomClick}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepThree;