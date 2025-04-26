import { configureStore } from '@reduxjs/toolkit'
import headerSlice from '../features/common/headerSlice'
import modalSlice from '../features/common/modalSlice'
import rightDrawerSlice from '../features/common/rightDrawerSlice'
import leadsSlice from '../features/leads/leadSlice'
import categorySlice from '../features/category/categorySlice'
import userSlice from '../features/userManger/userSlice'
import projectSlice from '../features/projectmanager/components/projectSlice'
import profileSlice from '../features/settings/profilesettings/profileSlice';
import teamSlice from '../features/team/teamSlice'
import transactionSlice from '../features/transactions/transactionSlice'
import reportSlice from '../features/reportProject/reportSlice'
import requestSlice from '../features/request/requestSlice'
import phaseRulesReducer from '../features/phaseRules/components/phaseRuleSlice'
import criteriaSlice from '../features/criteria/criteriaSlice'

const combinedReducer = {
  header: headerSlice,
  rightDrawer: rightDrawerSlice,
  modal: modalSlice,
  lead: leadsSlice,
  category: categorySlice,
  user: userSlice,
  project: projectSlice,
  profile: profileSlice,
  team: teamSlice,
  transaction: transactionSlice,
  request: requestSlice,
  report: reportSlice,
  phaseRules: phaseRulesReducer,
  criteria: criteriaSlice,
}

export default configureStore({
  reducer: combinedReducer,
})
