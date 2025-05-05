import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../../features/common/headerSlice'
import GlobalSettingsManager from '../../../features/globalSetting/globalManager'


function InternalPage() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title: "Global Settings" }))
    }, [])


    return (
        <GlobalSettingsManager />
    )
}

export default InternalPage