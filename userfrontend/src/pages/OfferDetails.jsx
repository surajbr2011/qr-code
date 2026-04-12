import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheck } from "react-icons/fi";
import api from "../utils/api";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-hot-toast";
import { useCart } from "../context/CartContext";

export default function OfferDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOfferDetails();
    }, [id]);

    const fetchOfferDetails = async () => {
        try {
            const { data } = await api.get(`/offers/${id}`);
            setOffer(data);
        } catch (err) {
            toast.error("Offer not found");
            navigate("/offers");
        } finally {
            setLoading(false);
        }
    };

    const { activateOffer } = useCart();

    const handleRedeem = () => {
        activateOffer(offer);
        toast.success(`Active! ${offer.discount}% OFF applied to menu prices.`);
        navigate("/menu");
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
    if (!offer) return null;

    return (
        <PageWrapper className="pb-24 bg-white min-h-screen max-w-[430px] mx-auto shadow-2xl relative">
            {/* Image Header */}
            <div className="relative h-72 bg-gray-100">
                <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md active:scale-95 transition z-10"
                >
                    <FiArrowLeft size={20} />
                </button>
            </div>

            <div className="px-5 -mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-50">
                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{offer.title}</h1>
                        <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold shadow-sm whitespace-nowrap ml-2">
                            {offer.discount}% OFF
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                        <FiClock className="text-orange-500" />
                        Valid until {new Date(offer.validUntil).toLocaleDateString()}
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-6"></div>

                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {offer.description || "Enjoy this exclusive offer regarding our special menu items. Order now to avail the discount!"}
                    </p>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] text-center z-50">
                <div className="max-w-[430px] mx-auto">
                    <p className="text-xs text-gray-400 mb-2">
                        {offer.promoCode ? `Promo Code: ${offer.promoCode} applied automatically` : "Discount applied at checkout"}
                    </p>
                    <button
                        onClick={handleRedeem}
                        className="w-full bg-black text-white font-bold py-4 rounded-xl text-lg shadow-lg active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                        Redeem & Order Now
                    </button>
                </div>
            </div>
        </PageWrapper>
    );
}
