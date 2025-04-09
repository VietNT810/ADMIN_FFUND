import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import ProjectSettings from '../../../features/projectmanager/ProjectSettings'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Settings"}))
      }, [])


    return(
        <ProjectSettings />
    )
}

export default InternalPage