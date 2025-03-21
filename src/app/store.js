import { configureStore } from '@reduxjs/toolkit'
import headerSlice from '../features/common/headerSlice'
import modalSlice from '../features/common/modalSlice'
import rightDrawerSlice from '../features/common/rightDrawerSlice'
import leadsSlice from '../features/leads/leadSlice'
import categorySlice from '../features/category/categorySlice'
import userSlice from '../features/userManger/userSlice'
import projectSlice from '../features/projectmanager/components/projectSlice'
import profileSlice from '../features/settings/profilesettings/profileSlice';

const combinedReducer = {
  header: headerSlice,
  rightDrawer: rightDrawerSlice,
  modal: modalSlice,
  lead: leadsSlice,
  category: categorySlice,
  user: userSlice,
  project: projectSlice,
  profile: profileSlice,
}

export default configureStore({
  reducer: combinedReducer,
})
