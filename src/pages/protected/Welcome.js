import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import { Link } from 'react-router-dom';
import TemplatePointers from '../../features/user/components/TemplatePointers';
import { useAuth } from '../../context/AuthContext';

function InternalPage() {
    const dispatch = useDispatch();
    const { userRole } = useAuth();

    useEffect(() => {
        dispatch(setPageTitle({ title: "Welcome" }));
    }, [dispatch]);

    const getStartedPath = userRole === "MANAGER" ? "/app/project-list" : "/app/dashboard";

    return (
        <div className="min-h-screen flex justify-center items-start mt-6 bg-base-200">
            <div className="w-full max-w-4xl bg-base-100 shadow-xl rounded-lg p-8 flex flex-col items-center text-center">
                <TemplatePointers />
                <Link to={getStartedPath}>
                    <button className="mt-4 btn btn-primary hover:scale-105 transition duration-300">
                        Get Started 🚀
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default InternalPage;