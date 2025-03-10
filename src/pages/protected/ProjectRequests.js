import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ProjectRequests from '../../features/projectmanager/ProjectRequests'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Project Requests"}))
      }, [])


    return(
        <ProjectRequests />
    )
}

export default InternalPage