import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import PhaseRuleManagement from '../../../features/phaseRules/phaseRuleManager'


function InternalPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title: "Phase Rules" }))
    }, [])


    return (
        <PhaseRuleManagement />
    )
}

export default InternalPage