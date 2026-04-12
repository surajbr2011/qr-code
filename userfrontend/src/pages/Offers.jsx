import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiTag, FiClock } from "react-icons/fi";
import api from "../utils/api";
import PageWrapper from "../components/PageWrapper";
import BottomNav from "../components/BottomNav";

export default function Offers() {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const { data } = await api.get("/offers");
            setOffers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper className="pb-20 bg-gray-50 min-h-screen max-w-[430px] mx-auto shadow-2xl relative">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="active:scale-95 transition">
                        <FiArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold">Exclusive Offers</h1>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-10">Loading offers...</p>
                ) : offers.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-gray-400">
                            <FiTag size={24} />
                        </div>
                        <p className="text-gray-500 font-medium">No active offers right now.</p>
                    </div>
                ) : (
                    offers.map((offer) => (
                        <div
                            key={offer._id}
                            onClick={() => navigate(`/offers/${offer._id}`)}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition cursor-pointer"
                        >
                            <div className="h-40 bg-gray-100 relative">
                                <img
                                    src={offer.imageUrl}
                                    alt={offer.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-red-500 shadow-sm">
                                    {offer.discount}% OFF
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{offer.title}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{offer.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 w-fit px-2 py-1 rounded-lg">
                                    <FiClock size={14} />
                                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <BottomNav />
        </PageWrapper>
    );
}
