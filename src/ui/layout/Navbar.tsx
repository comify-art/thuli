import { ReactNode, useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export interface NavbarProps {
    logo: string;
    title: string;
    links: Array<{ name: string; path: string; external?: boolean }>;
    /**
     * Optional slot rendered after the main nav links. Hosts use this to
     * surface auth state — e.g. "Sign in" link for anonymous visitors,
     * user email + sign-out for signed-in users. Pass any ReactNode.
     * Also rendered at the bottom of the mobile menu.
     */
    rightSlot?: ReactNode;
}

const Navbar = ({ logo, title, links, rightSlot }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar-root ${scrolled ? 'scrolled' : 'transparent'}`}>
            <div className="navbar-container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo-link">
                        <img
                            src={logo}
                            alt={title}
                            className="navbar-logo-img"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="navbar-desktop-nav">
                        {links.map((link) => (
                            link.external ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    className="navbar-link"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `navbar-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            )
                        ))}
                        {rightSlot && (
                            <div className="ml-4 flex items-center gap-2">
                                {rightSlot}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="navbar-mobile-toggle">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`navbar-toggle-btn ${scrolled ? 'scrolled' : 'transparent'}`}
                        >
                            <span className={`navbar-brand-text ${scrolled ? 'scrolled' : 'transparent'}`}>{title}</span>
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="navbar-mobile-menu">
                    <div className="navbar-mobile-menu-container">
                        {links.map((link) => (
                            link.external ? (
                                <a
                                    key={link.name}
                                    href={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="navbar-mobile-link"
                                >
                                    {link.name}
                                </a>
                            ) : (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={({ isActive }) =>
                                        `navbar-mobile-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            )
                        ))}
                        {rightSlot && (
                            <div className="px-4 pt-3 mt-2 border-t border-slate-700/40">
                                {rightSlot}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;


