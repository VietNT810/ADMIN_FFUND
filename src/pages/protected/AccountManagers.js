import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import AccountManagers from '../../features/userManger/manager/AccountManagers'
import { setPageTitle } from '../../features/common/headerSlice'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Account Managers"}))
      }, [dispatch])


    return(
        <AccountManagers />
    )
}

export default InternalPage