import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import ProjectCompleted from '../../../features/projectmanager/ProjectCompleted'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Project Completed"}))
      }, [])


    return(
        <div>
            <ProjectCompleted />
        </div>
    )
}

export default InternalPage