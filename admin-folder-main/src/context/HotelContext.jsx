import { createContext, useContext, useState, useEffect } from "react";

const HotelContext = createContext();

export function HotelProvider({ children }) {
    const [hotelLogo, setHotelLogo] = useState(null);

    useEffect(() => {
        const savedLogo = localStorage.getItem("hotelLogo");
        if (savedLogo) setHotelLogo(savedLogo);
    }, []);

    const [hotelProfile, setHotelProfile] = useState({
        name: "B S B Restaurant",
        ownerName: "Dacchu",
        phone: "7878787808",
        email: "bsbrestaurant@gmail.com",
        location: "Bangalore",
        outletId: "0660205020202",
        trinixId: "0660205020"
    });

    useEffect(() => {
        const savedLogo = localStorage.getItem("hotelLogo");
        const savedProfile = localStorage.getItem("hotelProfile");
        if (savedLogo) setHotelLogo(savedLogo);
        if (savedProfile) setHotelProfile(JSON.parse(savedProfile));
    }, []);

    const updateLogo = (newLogo) => {
        setHotelLogo(newLogo);
        localStorage.setItem("hotelLogo", newLogo);
    };

    const updateProfile = (newProfile) => {
        const updated = { ...hotelProfile, ...newProfile };
        setHotelProfile(updated);
        localStorage.setItem("hotelProfile", JSON.stringify(updated));
    };

    return (
        <HotelContext.Provider value={{ hotelLogo, updateLogo, hotelProfile, updateProfile }}>
            {children}
        </HotelContext.Provider>
    );
}

export const useHotel = () => useContext(HotelContext);
