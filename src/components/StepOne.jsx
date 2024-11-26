import React, { useState, useEffect } from "react";
import axios from "axios";
import first from "../assets/updated/bg.png";
import buk from "../assets/updated/buk.png";
import step from "../assets/updated/step.png";
import step1 from "../assets/updated/step1.png";
import arrow from "../assets/updated/arrow.png";
import { BrowserProvider } from "ethers";
import { logAnalyticsEvent } from '../firebase';

const StepOne = ({ bookingData, onNavigate, onBack, setData, nftData, setSelectedRate, selectedRate, setOptionHash, optionHash, setPropertyId, propertyId, setUserInfo, userInfo }) => {
  const [email, setEmail] = useState("");
  const [navigateAfterUpdate, setNavigateAfterUpdate] = useState(false);
  const [phone, setPhone] = useState("");
  const [hashCode, setHashCode] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomImage, setRoomImage] = useState(null);
  const [countryCode, setCountryCode] = useState('');
  // const [data, setData] = useState(null);
  const [optionID, setOptionID] = useState(null);

  useEffect(() => {
    console.log("HashCode updated:", hashCode); // Log the new value after the state updates
  }, [hashCode]);

  useEffect(() => {
    if (navigateAfterUpdate) {
      onNavigate(); // Navigate after the state has been updated
      setNavigateAfterUpdate(false); // Reset the flag
    }
  }, [navigateAfterUpdate]);

  useEffect(() => {
    // Log page view when component mounts
    logAnalyticsEvent('page_view', {
      page_title: 'Step One',
      page_location: window.location.href
    });
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError("");
      // Log when user fixes email error
      logAnalyticsEvent('form_error_resolved', {
        field: 'email',
        screen: 'step_one'
      });
    }
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (phoneError) {
      setPhoneError("");
      // Log when user fixes phone error
      logAnalyticsEvent('form_error_resolved', {
        field: 'phone',
        screen: 'step_one'
      });
    }
  };

  const handleCountryCodeChange = (e) => {
    let code = e.target.value;
  
    // Remove '+' symbol if it exists
    code = code.replace(/\+/g, '');
  
    setCountryCode(code); // Update the state immediately
  
    // Validate the country code
    if (code && validateCountryCode(code)) {
      setPhoneError('');
      sessionStorage.setItem('countryCode', code);
    }
  };
  

  const PropertyID = propertyId;
  console.log('====================================');
  console.log("prop", PropertyID);
  console.log('====================================');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (nftData) {
        try {
          const response = await axios.get(
            `https://api.prawasa.com/v2/hotel/getNFTBooking?tokenId=${nftData}`
          );
          const data = response.data;
          console.log(data);
          console.log("gettNft data" , data);

          const tokenID = nftData;

          if (data && data.status === true) {
            // Find the image with mainImage set to true and set roomImage
            const mainImage = data.data.booking.property.images.find(
              (image) => image.mainImage === true
            );
            if (mainImage) {
              setRoomImage(mainImage.hdUrl); // Set the roomImage to the hdUrl
              console.log(roomImage)
            }
          }
        } catch (error) {
          console.error("Error fetching NFT booking details:", error);
        }
      }
    };

    fetchBookingData();
  }, [nftData]);

  useEffect(() => {
    // Set initial values from bookingData
    if (bookingData) {
      setPropertyId(bookingData?.data.booking.property?._id || "");
      setUserInfo(bookingData?.data.userInfo || "");
      setCheckIn(formatDate(bookingData?.data.checkIn));
  sessionStorage.setItem("CheckIn", formatDate(bookingData?.data.checkIn))

      sessionStorage.setItem("checkInDate", setCheckIn)
      setCheckOut(formatDate(bookingData?.data.checkOut));
      
    }
  }, [bookingData]);



  console.log(bookingData);
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const userDetails = userInfo;
  sessionStorage.setItem("userInformation", userDetails);

  const fetchHotelData = async () => {
    const occupancyDetails = encodeURIComponent(
      JSON.stringify([{ paxes: [{ age: 21 }, { age: 20 }] }])
    );
    const url = `https://api.prawasa.com/v2/hotel/getHotel?id=${PropertyID}&occupancyDetails=${occupancyDetails}&checkIn=${checkIn}&checkOut=${checkOut}`;

    try {
      const response = await axios.get(url);
      console.log("Hotel data:", response.data);

      console.log("get hotel successs", response.data)

      setData(response.data);
      setHashCode(response.data.hash);
      console.log("Setting new hash:", response.data.hash);
      // Access the rooms array
      const rooms = response.data.rooms;
      if (!Array.isArray(rooms) || rooms.length === 0) {
        console.log("Rooms is not an array or is empty");
        return;
      }

      // Loop through each room to find the rateType "secondary"
      let selectedRoom = null;
      let selectedRate = null;
      let optionID = null;
      let discountCoupon = null;

      for (const room of rooms) {
        const rates = room.rates; // Access rates from each room
        if (Array.isArray(rates) && rates.length > 0) {
          for (const rate of rates) {
            console.log("Current rate object:", rate); // Log each rate object

            const opttt = nftData + "|" ; 

            console.log("before checking ", nftData);

            
            if (rate.rateType === "secondary" && rate.optionID === opttt ) {
              selectedRoom = room;
              selectedRate = rate;
              optionID = rate.optionID;
              console.log("Selected Rate Object:", rate);
              console.log("OptionID:", rate.optionID);
              break; // Exit loop once found

            }

            if (optionID === opttt){
              console.log("same same but different");
              return
              break
            }
          }

        }
        if (selectedRoom) break; // Exit the outer loop once a matching rate is found
      }

      // Check if we found a matching room and rate
      if (selectedRoom && selectedRate) {
        setSelectedRate(selectedRate);
        setOptionID(optionID);
        console.log("Selected Room Object:", selectedRoom);
      } else {
        console.log("No rate with rateType 'secondary' was found");
      }
    } catch (error) {
      console.error("Error fetching hotel data:", error);
    }
  };



  useEffect(() => {
    console.log(checkIn, checkOut, propertyId, userInfo, selectedRate)
    if (propertyId && checkIn && checkOut) {
      fetchHotelData();
    }
    if (selectedRate) {
      const optionHash = selectedRate.optionHash;
      console.log("Option Hash:", optionHash);
      setOptionHash(optionHash);
      
    }
  }, [propertyId, checkIn, checkOut, selectedRate, optionHash]);
  // const TotalPrice = bookingData.data.listingDetails.price;
  // setTotalPrice(TotalPrice);
  // console.log('====================================');
  // console.log(TotalPrice);
  // console.log('====================================');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  const validatePhone = (phone) => {
    const cleanedNumber = phone.replace(/[\s\-\(\)]/g, '');

    // Main regex pattern components:
    // ^            - Start of string
    // \+?          - Optional plus sign for international format
    // (?:[0-9]|1)? - Optional country code starting with 0-9 or 1
    // [0-9]{7,15}  - Between 7 to 15 digits for the main number
    // $            - End of string
    const phoneRegex = /^\+?(?:[0-9]{1,4})?[0-9]{7,15}$/;

    if (!cleanedNumber) {
      return false;
    }

    if (cleanedNumber.replace(/\D/g, '').length < 7) {
      return false;
    }

    if (cleanedNumber.replace(/\D/g, '').length > 15) {
      return false;
    }

    return phoneRegex.test(cleanedNumber);
  };


  // Function to handle the Next button click
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log form submission attempt
    logAnalyticsEvent('form_submission_attempt', {
      screen: 'step_one'
    });

    // Validate email
    if (!email) {
      setEmailError("Email is required");
      logAnalyticsEvent('form_validation_error', {
        field: 'email',
        error: 'required',
        screen: 'step_one'
      });
      return;
    }

    // Validate phone
    if (!phone) {
      setPhoneError("Phone number is required");
      logAnalyticsEvent('form_validation_error', {
        field: 'phone',
        error: 'required',
        screen: 'step_one'
      });
      return;
    }

    try {
      // Your existing submission logic here
      
      // Log successful form submission
      logAnalyticsEvent('form_submission_success', {
        screen: 'step_one'
      });
      
      setNavigateAfterUpdate(true);
    } catch (error) {
      // Log form submission error
      logAnalyticsEvent('form_submission_error', {
        screen: 'step_one',
        error: error.message
      });
    }
  };

  // Handle key press for phone number input
  const handlePhoneKeyPress = (e) => {
    // Allow numbers, Backspace, and the + symbol
    if (!/[0-9+\-]/.test(e.key) && e.key !== "Backspace") {
      e.preventDefault();
    }
  };

  // const validateCountryCode = (code) => {
  //   const countryCodeRegex = /^\+\d{1,4}$/;
  //   return countryCodeRegex.test(code);
  // };
  const validateCountryCode = (code) => {
    const countryCodeRegex = /^\d{1,4}$/; // Allow 1 to 4 digits without the '+'
    return countryCodeRegex.test(code);
  };
  



  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getLoginMessage = (timestamp) => {
    return `Signature for login authentication: ${timestamp}`;
  };

  const handleAuth = async (address, signature, timestamp) => {
    try {
      const response = await fetch(
        "https://api.prawasa.com/auth/user/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: address,
            loginToken: timestamp,
            signature: signature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const data = await response.json();
      const jwt = data.data.accessToken;
      console.log('====================================');
      console.log("signer res", data);
      console.log('====================================');

      if (!jwt) {
        throw new Error("JWT not found in the response");
      }

      // Store token in localStorage under "accessToken"
      localStorage.setItem("accessToken", jwt);
      setIsAuthenticated(true);

      return data;
    } catch (err) {
      console.error("Authentication error:", err);
      throw new Error(err.message || "Authentication failed");
    }
  };

  const polygonMainnet = {
    chainId: "0x89", // Hexadecimal representation of 137
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC", // Symbol of the currency
      decimals: 18, // Precision of the currency
    },
    rpcUrls: ["https://polygon-rpc.com"], // Public RPC URL
    blockExplorerUrls: ["https://polygonscan.com"], // Explorer URL
  };

  const switchToAmoyNetwork = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [polygonMainnet],
      });
      console.log("Switched to polygonMainnet network");
    } catch (error) {
      console.error("Failed to switch networks:", error);
      throw error;
    }
  };
  

  const connectAndSign = async () => {
    setIsConnecting(true);
    setError("");
    setSignature("");
    setLoginToken("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }

      // Create provider and request accounts
      switchToAmoyNetwork();
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      // Get signer and address
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Create unix timestamp for login token
      const timestamp = Date.now();
      setLoginToken(timestamp.toString());

      // Sign message with timestamp
      const message = getLoginMessage(timestamp);
      const signedMessage = await signer.signMessage(message);
      setSignature(signedMessage);

      // Authenticate with the server
      await handleAuth(address, signedMessage, timestamp);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      // Optionally handle authentication failure
    } finally {
      setIsConnecting(false);
    }
  };

  const handleButtonClick = async () => {
    await connectAndSign(); // Wait for connection and signing to complete
    handleSubmit(); // Move to the next step after signing
  };

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedPhone = sessionStorage.getItem("phone");

    if (storedEmail) setEmail(storedEmail);
    if (storedPhone) setPhone(storedPhone);
  }, []);

  // Update sessionStorage whenever email or phone changes
  useEffect(() => {
    sessionStorage.setItem("email", email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem("phone", phone);
  }, [phone]);

  // const shortenAddress = (address) => {
  //   if (!address) return "";
  //   return `${address.substring(0, 6)}...${address.substring(
  //     address.length - 4
  //   )}`;
  // };

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
        <div className="bg-[#161616] w-full flex flex-col items-center sm:pt-1">
          {/* Progress Steps */}
          <div className="">
            <div className="flex">
              <div className="flex ml-[-15px]">
                <div className="text-white flex">
                  <img
                    src={step}
                    alt="step 1"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2">
                    Step 1
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[80px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
              </div>

              {/* Progress indicators */}
              <div className="flex ml-2">
                <div className="text-white flex">
                  <img
                    src={step1}
                    alt="step 2"
                    className="md:w-7 md:h-7 sm:w-5 sm:h-5"
                  />
                  <p className="md:text-xs sm:text-[10px] md:mt-2 sm:mt-1 md:ml-3 sm:ml-2 text-[#B1B1B1]">
                    Step 2
                  </p>
                </div>
                <div className="bg-[#CA3F2A] h-[0.5px] md:w-[90px] sm:w-[50px] md:mt-4 sm:mt-3 md:ml-3 sm:ml-2"></div>
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
          <div className="flex flex-col items-center sm:mt-3">
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email address"
              className="border border-[#373737] bg-[#222222] sm:text-xs md:text-base rounded-md md:p-2  sm:py-1 mb-2 w-full focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center"
            />  
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}

            <div className="border border-[#373737] bg-[#222222] sm:text-xs md:text-base rounded-md md:p-2 md:py-2 sm:py-1 mb-2 w-full gap-3 focus:outline-none focus:ring-[0.5px] focus:ring-[#FFCACA] text-white text-center flex justify-center items-center">
              <input
                type="text"
                value={countryCode}
                onChange={handleCountryCodeChange}
                placeholder="+91"
                className="w-12 bg-transparent flex justify-center outline-none border-r-2 border-white"
              />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyPress}
                placeholder="Mobile number"
                className="w-full bg-transparent outline-none"
              />
            </div>
            {phoneError && <p className="text-red-500 text-xs">{phoneError}</p>}

            <div className="flex w-full  md:mt-2 items-center justify-center pb-2">
              <img
                src={arrow}
                alt="arrow"
                className="md:w-9 md:h-9 sm:w-6 sm:h-6 mr-4 cursor-pointer"
                onClick={onBack}
              />
              <button
                className="bg-[#CA3F2A] sm:text-xs text-white md:px-[110px] sm:px-[68px] md:py-1 sm:py-1 rounded-md md:text-lg border-[#FFE3E3] border border-opacity-50"
                onClick={handleButtonClick} // Call the combined handler
                disabled={isConnecting}
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

export default StepOne;
