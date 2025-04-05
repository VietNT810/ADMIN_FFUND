import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TeamDetail from '../../features/team/TeamDetail'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Team Detail"}))
      }, [])


    return(
        <TeamDetail/>
    )
}

export default InternalPage