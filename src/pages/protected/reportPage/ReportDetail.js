import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import ReportDetail from '../../../features/reportProject/ReportDetail'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Report Detail"}))
      }, [])


    return(
        <ReportDetail/>
    )
}

export default InternalPage