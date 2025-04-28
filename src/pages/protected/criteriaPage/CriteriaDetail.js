import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import CriteriaDetail from '../../../features/criteria/CriteriaDetail'


function InternalPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title: "Criteria Detail" }))
    }, [])


    return (
        <CriteriaDetail />
    )
}

export default InternalPage