const Footer = () => {
    return (
        <footer className="py-12 px-6 md:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="font-mono text-xs text-text-muted tracking-wider">
                    © {new Date().getFullYear()} — All rights reserved
                </div>
                <div className="font-serif text-sm text-text-muted italic">
                    Designed with intention
                </div>
            </div>
        </footer>
    );
};

export default Footer;
