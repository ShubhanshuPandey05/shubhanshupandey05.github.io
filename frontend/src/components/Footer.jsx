import { FiHeart } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="py-8 px-6 border-t border-glass-border">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-text-muted text-sm font-mono">
                    <span className="text-primary">&lt;</span>
                    Dev
                    <span className="text-primary">/&gt;</span>
                    <span className="mx-2">•</span>
                    © {new Date().getFullYear()}
                </div>
                <div className="flex items-center gap-1 text-text-muted text-sm">
                    Built with <FiHeart className="text-red-500 mx-1" /> and a lot of
                    <span className="text-primary font-mono ml-1">console.log()</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
