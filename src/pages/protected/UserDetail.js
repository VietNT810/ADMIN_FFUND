import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import UserDetail from '../../features/userManger/UserDetail'
import { setPageTitle } from '../../features/common/headerSlice'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "User Detail"}))
      }, [dispatch])


    return(
        <UserDetail />
    )
}

export default InternalPage