import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import RequestDetail from '../../../features/request/RequestDetail'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Request Detail"}))
      }, [])


    return(
        <RequestDetail/>
    )
}

export default InternalPage