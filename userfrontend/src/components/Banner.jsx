import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import api from "../utils/api";

export default function Banner() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get("/offers");
        setOffers(data);
      } catch (err) {
        console.error("Failed to load offers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) return <div className="h-36 mx-4 mt-4 bg-gray-100 rounded-xl animate-pulse"></div>;

  if (offers.length === 0) {
    return (
      <div className="px-4 mt-4">
        <div className="rounded-xl overflow-hidden shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=800"
            alt="Welcome"
            className="w-full h-36 object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mt-4">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        spaceBetween={10}
        className="rounded-xl overflow-hidden shadow-sm"
      >
        {offers.map((offer) => (
          <SwiperSlide key={offer._id}>
            <div
              className="relative w-full h-36 cursor-pointer"
              onClick={() => navigate(`/offers/${offer._id}`)}
            >
              <img
                src={offer.imageUrl}
                alt={offer.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight">{offer.title}</h3>
                <p className="text-white/90 text-xs font-medium">{offer.discount}% OFF until {new Date(offer.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

