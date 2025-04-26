import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import Criteria from '../../../features/criteria/Criteria'


function InternalPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title: "Criteria" }))
    }, [])


    return (
        <Criteria />
    )
}

export default InternalPage