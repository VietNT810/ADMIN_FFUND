import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import ExclamationCircleIcon from '@heroicons/react/24/solid/ExclamationCircleIcon';

function InternalPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageTitle({ title: "" }));
    }, [dispatch]);

    return (
        <div className="hero h-4/5 bg-base-200">
            <div className="hero-content text-accent text-center">
                <div className="max-w-md">
                    <ExclamationCircleIcon className="h-48 w-48 inline-block text-red-600" />
                    <h1 className="text-5xl font-bold">Access Denied</h1>
                    <p className="text-lg mt-4">You do not have permission to access this page.</p>
                </div>
            </div>
        </div>
    );
}

export default InternalPage;
