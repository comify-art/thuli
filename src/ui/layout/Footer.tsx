import { Link } from 'react-router-dom';
// import { MapPin } from 'lucide-react';


export interface FooterProps {
    logo: string;
    description: string;
    skinny: boolean;
    links: {
        quickLinks: Array<{ name: string; path: string }>;
        community: Array<{ name: string; path: string }>;
        legal: Array<{ name: string; path: string }>;
    };
    contact: {
        email: string;
        address: string;
        name: string;
    };
    copyright: string;
    version: string;
}

const Footer = ({ logo, description, links, contact, copyright, version, skinny }: FooterProps) => {
    return (
        <footer className={`footer-root ${skinny ? '!py-2 fixed bottom-0 left-0 right-0 z-40 !border-t-0 bg-slate-900/90 backdrop-blur-sm' : ''}`}>
            <div className="footer-container">
                {!skinny && <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand-col">
                        <div className="footer-logo-wrapper">
                            <img
                                src={logo}
                                alt="Logo"
                                className="footer-logo-img"
                            />
                        </div>
                        <p className="footer-desc">
                            {description.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="footer-heading">Quick Links</h3>
                        <ul className="footer-links-list">
                            {links.quickLinks.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="footer-link">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Community */}
                    <div>
                        <h3 className="footer-heading">Community</h3>
                        <ul className="footer-links-list">
                            {links.community.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="footer-link">{link.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Legal */}
                    <div>
                        <h3 className="footer-heading">Contact</h3>
                        <div className="footer-contact-icons">
                            {/* Social icons could go here */}
                            <a href={`mailto:${contact.email}`} className="footer-contact-link">
                                {contact.address}
                            </a>
                        </div>
                        {/* <ul className="footer-links-list">
                            <li className="footer-address-item">
                                <MapPin size={16} className="footer-icon-shim" />
                                <span>
                                    {contact.address}<br />
                                </span>
                            </li>
                            <li className="pt-4"></li>
                            {links.legal.map((link) => (
                                <li key={link.name}>
                                    <Link to={link.path} className="footer-link">{link.name}</Link>
                                </li>
                            ))}
                        </ul> */}
                    </div>
                </div>}

                <div className={`footer-bottom ${skinny ? '!mt-0 !pt-0 !border-t-0 flex flex-row justify-center items-center gap-6 text-xs' : ''}`}>
                    <p>&copy; {copyright} <span className="footer-version">v{version}</span></p>
                    {skinny && (
                        <>
                            <span className="hidden sm:inline text-slate-600">|</span>
                            <div className="flex gap-6">
                                <Link to="/contact" className="hover:text-primary transition-colors">{contact.address}</Link>
                                <span className="text-slate-300">•</span>
                                <a href={`mailto:${contact.email}`} className="hover:text-primary transition-colors">
                                    {contact.name}
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default Footer;

