import { lazy } from 'react'

const Dashboard = lazy(() => import('../pages/protected/Dashboard'))
const Welcome = lazy(() => import('../pages/protected/Welcome'))
const Page404 = lazy(() => import('../pages/protected/404'))
const AccessDenied = lazy(() => import('../pages/protected/AccessDenied'))
const Blank = lazy(() => import('../pages/protected/Blank'))
const Charts = lazy(() => import('../pages/protected/Charts'))
const Integration = lazy(() => import('../pages/protected/Integration'))
const Calendar = lazy(() => import('../pages/protected/Calendar'))
const Team = lazy(() => import('../pages/protected/Team'))
const TeamDetail = lazy(() => import('../pages/protected/TeamDetail'))
const Transactions = lazy(() => import('../pages/protected/Transactions'))
const Bills = lazy(() => import('../pages/protected/Bills'))
const ProfileSettings = lazy(() => import('../pages/protected/ProfileSettings'))
const GettingStarted = lazy(() => import('../pages/GettingStarted'))
const DocFeatures = lazy(() => import('../pages/DocFeatures'))
const DocComponents = lazy(() => import('../pages/DocComponents'))
const Category = lazy(() => import('../pages/protected/Category'))
const UserManger = lazy(() => import('../pages/protected/UserManager'))
const UserDetail = lazy(() => import('../pages/protected/UserDetail'))
const ProjectList = lazy(() => import('../pages/protected/projectPage/ProjectList'))
const ProjectCompleted = lazy(() => import('../pages/protected/projectPage/ProjectCompleted'))
const ProjectRequests = lazy(() => import('../pages/protected/projectPage/ProjectRequests'))
const ProjectDetails = lazy(() => import('../pages/protected/projectPage/ProjectDetails'))
const Report = lazy(() => import('../pages/protected/reportPage/Report'))
const Request = lazy(() => import('../pages/protected/requestPage/Request'))
const ReportDetail = lazy(() => import('../pages/protected/reportPage/ReportDetail'))
const RequestDetail = lazy(() => import('../pages/protected/requestPage/RequestDetail'))
const PhaseRuleManagement = lazy(() => import('../pages/protected/phaseRulesPage/PhaseRules'))
const Criteria = lazy(() => import('../pages/protected/criteriaPage/Criteria'))
const CriteriaDetail = lazy(() => import('../pages/protected/criteriaPage/CriteriaDetail'))
const CriteriaType = lazy(() => import('../pages/protected/criteriaPage/CriteriaType'))

const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
  },
  {
    path: '/criteria',
    component: Criteria,
  },
  {
    path: '/criteria-type',
    component: CriteriaType,
  },
  {
    path: '/criteria-details/:criteriaId',
    component: CriteriaDetail,
  },
  {
    path: '/report-project',
    component: Report,
  },
  {
    path: '/report-project/:reportId',
    component: ReportDetail,
  },
  {
    path: '/request',
    component: Request,
  },
  {
    path: '/request/:requestId',
    component: RequestDetail,
  },
  {
    path: '/welcome',
    component: Welcome,
  },
  {
    path: '/user-detail/:id',
    component: UserDetail,
  },
  {
    path: '/user-management',
    component: UserManger,
  },
  {
    path: '/project-list',
    component: ProjectList,
  },
  {
    path: '/project-completed',
    component: ProjectCompleted,
  },
  {
    path: '/project-requests',
    component: ProjectRequests,
  },
  {
    path: '/project-details/:projectId',
    component: ProjectDetails,
  },
  {
    path: '/team',
    component: Team,
  },
  {
    path: '/team-detail/:teamId',
    component: TeamDetail,
  },
  {
    path: '/calendar',
    component: Calendar,
  },
  {
    path: '/transactions',
    component: Transactions,
  },
  {
    path: '/settings-profile',
    component: ProfileSettings,
  },
  {
    path: '/settings-billing',
    component: Bills,
  },
  {
    path: '/getting-started',
    component: GettingStarted,
  },
  {
    path: '/features',
    component: DocFeatures,
  },
  {
    path: '/components',
    component: DocComponents,
  },
  {
    path: '/integration',
    component: Integration,
  },
  {
    path: '/charts',
    component: Charts,
  },
  {
    path: '/404',
    component: Page404,
  },
  {
    path: '/access-denied',
    component: AccessDenied,
  },
  {
    path: '/blank',
    component: Blank,
  },
  {
    path: '/category',
    component: Category,
  },
  {
    path: '/phase-rules',
    component: PhaseRuleManagement,
  },
]

export default routes
