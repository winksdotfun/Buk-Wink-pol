import React, { useEffect, useState } from 'react'
import first from '../assets/updated/bg.png';
import buk from '../assets/updated/buk.png';
import tick from '../assets/updated/tick.png'
import axios from "axios";


const SucessConfirmation = ({tokenID, nftData}) => {
  const [transactionId, setTransactionId] = useState('');
  const [roomImage, setRoomImage] = useState(null);


  useEffect(() => {
    const fetchBookingData = async () => {
      if (nftData) {
        try {
          const response = await axios.get(
            `https://api.prawasa.com/v2/hotel/getNFTBooking?tokenId=${nftData}`
          );
          const data = response.data;
          console.log(data);

          


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



  useEffect(() => {
    // Retrieve transaction ID from localStorage
    const txId = sessionStorage.getItem('transactionId');
    if (txId) {
      setTransactionId(txId);
    }
  }, []);




  return (
    <div className="flex justify-center items-center h-screen bg-black">
      <div className="relative md:w-[500px] md:h-[500px] h-[310px] sm:w-[300px] bg-[#161616] shadow-lg p-2 flex flex-col items-center">
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
              alt=""
              className="md:w-[70px] w-[50px] md:ml-12 sm:ml-[20px]"
            />
          </div>

          {/* content */}
          <div className="md:mt-48 sm:mt-24 items-center justify-center flex flex-col text-center">
            <img
              src={tick}
              alt=""
              className="md:w-16 md:h-16 sm:h-12 sm:w-12 "
            />

            <h2 className="text-white md:text-lg sm:text-sm">
              Congratulations! <br />
              You own this booking now.
            </h2>

            <div className="flex flex-col text-center ">
              <p className="text-[#CA3F2A] md:text-xs sm:text-[8px]">
                {" "}
                Transaction id:{" "}
              </p>
              <p className="md:text-[10px] sm:text-[6px] text-[#CACACA]">
                {transactionId || "Pending..."}
              </p>
            </div>

            <a
              href={`https://Prawasa.com/hotels/nft-details?nftId=${tokenID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#CA3F2A] text-white md:px-[40px] md:mt-8 sm:px-[30px] sm:mt-4 py-1 rounded-md md:text-lg sm:text-xs border-[#FFE3E3] border border-opacity-50   "
            >
              Check my Bookings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SucessConfirmation