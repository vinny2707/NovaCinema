import { Facebook, Instagram, Youtube, Ticket } from "lucide-react";
import { Button } from "../common/Button";
import { Link, useNavigate } from "react-router-dom";
import { movieApi } from "../../api/endpoints/movie.api";
export default function Footer() {
  const navigate = useNavigate();

  const handleBuyTicket = async () => {
    console.log('Buy ticket button clicked!');
    try {
      const response = await movieApi.getNowShowing(1, 100);
      console.log('Movies response:', response);
      if (response.items && response.items.length > 0) {
        const randomMovie = response.items[Math.floor(Math.random() * response.items.length)];
        console.log('Random movie selected:', randomMovie);
        navigate(`/movie/${randomMovie._id}`);
      } else {
        console.log('No movies found, redirecting to now-showing');
        navigate('/now-showing');
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      navigate('/now-showing');
    }
  };

  return (
    <footer className="bg-linear-to-br from-[#682480] to-[#3864CC] text-gray-300 py-12 w-full">
      <div className="container mx-auto max-w-7xl px-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-10">

          <div className="lg:col-span-2 space-y-5">
            <img
              src="/logo.png"
              alt="Nova Cinema Logo"
              className="w-36"
            />
            <p className="tracking-wider text-white font-bold text-base">BE HAPPY, BE A STAR</p>

            <div className="flex gap-3">
              <Button intent="primary" className="hidden sm:flex" onClick={handleBuyTicket}>
                <Ticket size={16} />
                <span>BUY TICKETS</span>
              </Button>
            </div>

            <div className="flex gap-4 text-white text-xl">
              <a href="#" aria-label="Facebook" className="hover:text-yellow-400 transition-colors"><Facebook /></a>
              <a href="#" aria-label="YouTube" className="hover:text-yellow-400 transition-colors"><Youtube /></a>
              <a href="#" aria-label="Instagram" className="hover:text-yellow-400 transition-colors"><Instagram /></a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base font-anton tracking-wider">ACCOUNT</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">Sign in</Link></li>
              <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">Sign up</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base font-anton tracking-wider">MOVIE</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/now-showing" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">Movie is showing</Link></li>
              <li><Link to="/coming-soon" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">Movie coming soon</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base font-anton tracking-wider">NOVA CINEMA</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about-us" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">About us</Link></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base font-anton tracking-wider">THEATER SYSTEM</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">All location</a></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">NovaCinema Student</a></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Ha Noi Capital</a></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Ho Chi Minh City</a></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Da Nang City</a></li>
              <li><a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Can Tho City</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-t border-white mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 md:mb-0 text-white text-base">&copy; 2025 Nova Cinema. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link to="/privacy-policy" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-yellow-400 text-white text-base transition-colors">Privacy policy</Link>
            <a href="#" className="hover:text-yellow-400 text-white text-base transition-colors">Movie news</a>
          </nav>
        </div>

      </div>
    </footer>
  )
}