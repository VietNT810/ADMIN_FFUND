import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import ProjectScoring from '../../../features/projectmanager/ProjectScoring'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Project Scoring"}))
      }, [])


    return(
        <ProjectScoring />
    )
}

export default InternalPage