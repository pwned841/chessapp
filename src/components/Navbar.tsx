export default function Navbar() {
    return (
        <nav>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <h1 className="text-6xl text-white">ChessApp</h1>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex space-x-4">
                        <a href="#" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                            Home
                        </a>
                        <a href="#" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                            About
                        </a>
                        <a href="#" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                            Services
                        </a>
                        <a href="#" className="text-white px-3 py-2 rounded-md text-sm font-medium">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}
