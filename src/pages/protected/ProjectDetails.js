import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ProjectDetails from '../../features/projectmanager/ProjectDetails'
import ProjectDetailsContent from '../../features/projectmanager/ProjectDetailsContent'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Project Details"}))
      }, [])


    return(
        <div>
            <ProjectDetails />
            <ProjectDetailsContent />
        </div>
    )
}

export default InternalPage