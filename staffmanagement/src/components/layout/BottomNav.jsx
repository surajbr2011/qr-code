import { NavLink } from "react-router-dom";
import HomeIcon from "../../assets/images/Home.png";
import CartIcon from "../../assets/images/Cart.png";
import ProfileIcon from "../../assets/images/Profile.png";

export default function BottomNav() {
  return (
    <div className="w-full bg-white border-t flex justify-around items-center py-3 z-50">
      <NavItem to="/staff/orders" icon={HomeIcon} alt="Home" />
      <NavItem to="/staff/cart" icon={CartIcon} alt="Cart" />
      <NavItem to="/staff/profile" icon={ProfileIcon} alt="Profile" />
    </div>
  );
}

function NavItem({ to, icon, alt }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center w-12 h-12 rounded-full transition-colors ${isActive ? "opacity-100" : "opacity-50 grayscale"
        }`
      }
    >
      <img src={icon} alt={alt} className="w-[22px] h-[22px]" />
    </NavLink>
  );
}
