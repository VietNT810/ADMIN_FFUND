import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import CriteriaType from '../../../features/criteria/CriteriaType'


function InternalPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title: "Criteria Type" }))
    }, [])


    return (
        <CriteriaType />
    )
}

export default InternalPage