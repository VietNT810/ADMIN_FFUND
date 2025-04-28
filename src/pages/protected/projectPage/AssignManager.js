import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import AssignManager from '../../../features/projectmanager/AssignManager'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Assign Manager"}))
      }, [])


    return(
        <AssignManager />
    )
}

export default InternalPage