import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import Report from '../../../features/reportProject/Report'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Report"}))
      }, [])


    return(
        <Report/>
    )
}

export default InternalPage