'use client';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 py-12">
            <div className="container mx-auto px-4 md:px-6 flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex flex-col items-center md:items-start gap-1">
                    <span className="text-xl font-bold font-outfit text-gray-900">Sandesh Surwase</span>
                    <p className="text-gray-500 text-sm">Elevating fashion with Artificial Intelligence.</p>
                </div>

                <div className="flex gap-6 text-sm font-medium text-gray-500">
                    <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
                </div>

                <div className="text-sm text-gray-400">
                    &copy; {new Date().getFullYear()} Sandesh Surwase. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
