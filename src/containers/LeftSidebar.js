import { useState, useEffect } from 'react';
import routes from '../routes/sidebar';
import { NavLink, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';
import ChevronRightIcon from '@heroicons/react/24/outline/ChevronRightIcon';
import ChevronLeftIcon from '@heroicons/react/24/outline/ChevronLeftIcon';

function LeftSidebar() {
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [hoverTimer, setHoverTimer] = useState(null);

    const role = localStorage.getItem('role');

    const filteredRoutes = routes.map(route => {
        if (role === 'MANAGER') {
            if (['User', 'Criteria', 'Phase Rules', 'Transactions', 'Global Settings', 'Dashboard'].includes(route.name)) {
                return null;
            }
            
            if (route.submenu) {
                route.submenu = route.submenu.filter(subRoute => !['Assign project'].includes(subRoute.name));
            }
        } else if (role === 'ADMIN') {
            if (['Requests & Reports'].includes(route.name)) {
                return null;
            }

            if (route.submenu) {
                route.submenu = route.submenu.filter(subRoute => !['Completed'].includes(subRoute.name));
            }
        }
        return route;
    }).filter(Boolean);

    const close = (e) => {
        document.getElementById('left-sidebar-drawer').click();
    };

    const handleMouseEnter = () => {
        if (!isPinned) {
            clearTimeout(hoverTimer);
            setHoverTimer(setTimeout(() => setExpanded(true), 100));
        }
    };

    const handleMouseLeave = () => {
        if (!isPinned) {
            clearTimeout(hoverTimer);
            setHoverTimer(setTimeout(() => setExpanded(false), 300));
        }
    };

    const togglePin = () => {
        setIsPinned(!isPinned);
        setExpanded(!isPinned);
    };

    useEffect(() => {
        return () => {
            if (hoverTimer) clearTimeout(hoverTimer);
        };
    }, [hoverTimer]);

    return (
        <div className="drawer-side z-30">
            <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
            <div
                className={`menu pt-2 min-h-full bg-base-100 text-base-content ${expanded ? 'w-80' : 'w-20'
                    } transition-all duration-300 ease-in-out`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    className="btn btn-ghost bg-base-300 btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
                    onClick={() => close()}
                >
                    <XMarkIcon className="h-5 inline-block w-5" />
                </button>

                <button
                    className="btn btn-sm btn-ghost absolute top-2 right-2 hidden lg:flex"
                    onClick={togglePin}
                    title={isPinned ? "Unpin Sidebar" : "Pin Sidebar"}
                >
                    {isPinned ? <ChevronLeftIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                </button>

                <div className="mb-4 px-4">
                    <Link to={'/app/welcome'} className="flex items-center space-x-2 hover:text-primary transition-all duration-300">
                        <img
                            className="mask mask-squircle w-12 transition-transform transform hover:scale-110"
                            src="/logo192.png"
                            alt="FFUND Logo"
                        />
                        <span
                            className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-300 ${expanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'
                                }`}
                        >
                            FFund
                        </span>
                    </Link>
                </div>

                <ul className="px-2 py-2">
                    {filteredRoutes.map((route, k) => {
                        return (
                            <li key={k} className="my-1">
                                {route.submenu ? (
                                    <SidebarSubmenu {...route} isExpanded={expanded} />
                                ) : (
                                    <NavLink
                                        end
                                        to={route.path}
                                        className={({ isActive }) => `
                      ${isActive ? 'font-semibold bg-base-200' : 'font-normal'} 
                      flex items-center p-2 rounded-lg relative group
                    `}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className="flex justify-center items-center w-6">{route.icon}</div>
                                            <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${expanded ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 overflow-hidden'
                                                }`}>
                                                {route.name}
                                            </span>

                                            {!expanded && (
                                                <div className="absolute left-14 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 z-50 whitespace-nowrap">
                                                    {route.name}
                                                </div>
                                            )}
                                        </div>
                                        {location.pathname === route.path && (
                                            <span className="absolute inset-y-0 left-0 w-1 rounded-tr-md rounded-br-md bg-primary" aria-hidden="true"></span>
                                        )}
                                    </NavLink>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

export default LeftSidebar;