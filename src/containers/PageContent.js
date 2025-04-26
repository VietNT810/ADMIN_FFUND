import Header from "./Header"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import routes from '../routes'
import { Suspense, lazy } from 'react'
import SuspenseContent from "./SuspenseContent"
import { useSelector } from 'react-redux'
import { useEffect, useRef } from "react"

const Page404 = lazy(() => import('../pages/protected/404'))
const AccessDenied = lazy(() => import('../pages/protected/AccessDenied'))


function PageContent(){
    const mainContentRef = useRef(null);
    const {pageTitle} = useSelector(state => state.header)
    const userRole = localStorage.getItem('role');


    // Scroll back to top on new page load
    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
          });
      }, [pageTitle])

      return (
        <div className="drawer-content flex flex-col ">
            <Header/>
            <main className="flex-1 md:pt-4 pt-4 px-6  bg-base-200" ref={mainContentRef}>
                <Suspense fallback={<SuspenseContent />}>
                    <Routes>
                        {
                            routes.map((route, key) => {
                                if (route.role && !route.role.includes(userRole)) {
                                    return <Route key={key} path={route.path} element={<AccessDenied />} />;
                                }
                                return (
                                    <Route
                                        key={key}
                                        exact={true}
                                        path={route.path}
                                        element={<route.component />}
                                    />
                                );
                            })
                        }

                        <Route path="*" element={<Page404 />} />
                    </Routes>
                </Suspense>
                <div className="h-16"></div>
            </main>
        </div>
    )
}


export default PageContent
