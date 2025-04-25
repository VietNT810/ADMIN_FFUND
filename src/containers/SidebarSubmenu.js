import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function SidebarSubmenu({ submenu, name, icon, isExpanded }) {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    // Open Submenu list if path found in routes
    useEffect(() => {
        if (submenu.filter(m => m.path === location.pathname)[0]) setIsOpen(true);
    }, [location.pathname, submenu]);

    return (
        <div className="flex flex-col w-full relative group p-0">
            {/* Route header */}
            <div
                className="w-full block p-2 rounded-lg cursor-pointer flex items-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex justify-center items-center w-6">{icon}</div>
                <span className={`ml-3 flex-1 whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'
                    }`}>
                    {name}
                </span>

                {isExpanded && (
                    <ChevronDownIcon
                        className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                    <div className="absolute left-14 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 z-50 whitespace-nowrap">
                        {name}
                    </div>
                )}
            </div>

            {/* Submenu list - only render when parent is expanded */}
            {isExpanded && (
                <div
                    className={`w-full overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                >
                    <ul className="pl-6 mt-1">
                        {submenu.map((m, k) => (
                            <li key={k} className="my-1">
                                <Link
                                    to={m.path}
                                    className={`flex items-center p-2 rounded-lg relative ${location.pathname === m.path ? 'bg-base-200 font-semibold' : 'font-normal'
                                        }`}
                                >
                                    <div className="flex justify-center items-center w-6">{m.icon}</div>
                                    <span className="ml-3">{m.name}</span>
                                    {location.pathname === m.path && (
                                        <span
                                            className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary"
                                            aria-hidden="true"
                                        ></span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default SidebarSubmenu;